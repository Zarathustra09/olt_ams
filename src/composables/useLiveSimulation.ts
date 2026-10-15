import { computed, reactive, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { MACHINES, type Machine } from '@/data/machines'
import {
  REASON_BY_CODE,
  createErrorEvent,
  createErrorHistory,
  createSubAssets,
  type ErrorEvent,
  type SubAsset,
} from '@/data/analysis'
import { FINANCE, SCHEDULED_HOURS_PER_MONTH, WORLD_CLASS_OEE } from '@/data/finance'
import { SHIFT_STATE_ORDER, formatDuration, type ShiftState } from '@/lib/machine-status'

const TICK_MS = 2500
const HISTORY_POINTS = 30
const SHIFT_MINUTES = 480
const MINUTES_PER_TICK = 0.25
const LOADING_FACTOR = 0.62
// A breakdown is shown as a time-lapse: each tick of the outage advances the shift clock faster.
const FAULT_TICKS = 10
const FAULT_MINUTES_PER_TICK = 2.5
const DRIFT_TICKS = 14
const MAX_ERRORS = 600
const MAX_ALERTS = 50

export interface LiveMachine extends Machine {
  oee: number
  history: { t: number; oee: number }[]
}

export interface Segment {
  state: ShiftState
  start: number
  end: number
}

export type AlertKind = 'critical' | 'major' | 'success' | 'info'

export interface Alert {
  id: number
  machineId: number
  kind: AlertKind
  title: string
  detail: string
  /** Minutes into the shift. */
  minute: number
  /** Wall-clock time the alert was raised. */
  at: number
  read: boolean
  /** Whether the toaster should pop it up (the bell always lists it). */
  toast: boolean
}

interface ActiveFault {
  machineId: number
  assetId: string
  ticksLeft: number
  durationSec: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const round1 = (v: number) => Math.round(v * 10) / 10
const round2 = (v: number) => Math.round(v * 100) / 100
// Bounded random walk that gently mean-reverts so values never drift off.
const walk = (v: number, base: number, step: number, lo = 0, hi = 100) =>
  clamp(v + (Math.random() - 0.5) * step + (base - v) * 0.15, lo, hi)
const oeeOf = (m: Pick<Machine, 'availability' | 'performance' | 'quality'>) =>
  (m.availability * m.performance * m.quality) / 10000

const bases = new Map<number, Machine>(MACHINES.map((m) => [m.id, m]))

const machines = reactive<LiveMachine[]>(
  MACHINES.map((m) => ({ ...m, oee: round1(oeeOf(m)), history: [] })),
)
const machineById = (id: number) => machines.find((m) => m.id === id)

const plantHistory = reactive({
  oee: [] as number[],
  availability: [] as number[],
  performance: [] as number[],
  quality: [] as number[],
})

const subAssets = reactive<SubAsset[]>(createSubAssets())
const subAssetBases = new Map(subAssets.map((a) => [a.id, { ...a }]))
// Lasting health penalty on a sub-asset after a breakdown, so it stays "on watch".
const degraded = new Map<string, number>()
const errors = reactive<ErrorEvent[]>([])
const alerts = reactive<Alert[]>([])

let faults: ActiveFault[] = []
const drifts = new Map<number, number>()

const live = computed(() => machines.filter((m) => m.status !== 'offline'))
const avg = (pick: (m: LiveMachine) => number) =>
  live.value.length ? live.value.reduce((sum, m) => sum + pick(m), 0) / live.value.length : 0

const plant = computed(() => ({
  oee: round1(avg((m) => m.oee)),
  availability: round1(avg((m) => m.availability)),
  performance: round1(avg((m) => m.performance)),
  quality: round1(avg((m) => m.quality)),
}))

// Comparison baseline shown as "Previous period".
const previous = { oee: 74.1, availability: 89.4, performance: 84.2, quality: 96.3 }

const mttr = ref(1080)
const mtbf = ref(8951)
const previousKpis = { teep: 36.2, mttr: 1285, mtbf: 9814 }
const kpis = computed(() => ({
  teep: round1(plant.value.oee * LOADING_FACTOR),
  mttr: mttr.value,
  mtbf: mtbf.value,
}))

const timeline = ref<Segment[]>([])
const nowMinute = ref(0)
let holdTicks = 0

const seedTimeline = () => {
  const plan: [ShiftState, number][] = [
    ['running', 72], ['microstop', 3], ['running', 55], ['slow', 12], ['running', 48],
    ['planned', 15], ['running', 55], ['microstop', 4], ['running', 36], ['stopped', 10],
    ['slow', 12], ['running', 23],
  ]
  let cursor = 0
  timeline.value = plan.map(([state, len]) => {
    const seg = { state, start: cursor, end: cursor + len }
    cursor += len
    return seg
  })
  nowMinute.value = cursor
  holdTicks = 0
}

const advanceTimeline = () => {
  if (nowMinute.value >= SHIFT_MINUTES) {
    timeline.value = [{ state: 'running', start: 0, end: 0 }]
    nowMinute.value = 0
    errors.splice(0)
  }
  const minutes = faults.length ? FAULT_MINUTES_PER_TICK : MINUTES_PER_TICK
  nowMinute.value = Math.min(SHIFT_MINUTES, nowMinute.value + minutes)
  const last = timeline.value[timeline.value.length - 1]!
  // Extend first so a new segment always starts exactly where the previous one ends.
  last.end = nowMinute.value

  if (holdTicks > 0) {
    holdTicks--
  } else if (last.state === 'running') {
    if (Math.random() < 0.07) {
      const pool: ShiftState[] = ['slow', 'microstop', 'microstop']
      const state = pool[Math.floor(Math.random() * pool.length)]!
      timeline.value.push({ state, start: nowMinute.value, end: nowMinute.value })
      holdTicks = 2 + Math.floor(Math.random() * 3)
    }
  } else {
    timeline.value.push({ state: 'running', start: nowMinute.value, end: nowMinute.value })
  }
}

// ---- alerts ---------------------------------------------------------------

let nextAlertId = 1
const listeners = new Set<(alert: Alert) => void>()
// While seeding, alerts are listed in the bell but must not pop toasts.
let seeding = false

const pushAlert = (input: Omit<Alert, 'id' | 'at' | 'read' | 'minute'> & { minute?: number; read?: boolean; at?: number }) => {
  const alert: Alert = {
    id: nextAlertId++,
    at: Date.now(),
    read: false,
    minute: nowMinute.value,
    ...input,
  }
  alerts.unshift(alert)
  if (alerts.length > MAX_ALERTS) alerts.pop()
  if (!seeding) listeners.forEach((cb) => cb(alert))
  return alert
}

const onAlert = (cb: (alert: Alert) => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const unreadCount = computed(() => alerts.filter((a) => !a.read).length)
const markAllRead = () => alerts.forEach((a) => (a.read = true))

const alertFromError = (e: ErrorEvent, toast: boolean) => {
  const machine = machineById(e.machineId)
  const asset = subAssets.find((a) => a.id === e.subAssetId)
  pushAlert({
    machineId: e.machineId,
    kind: e.severity === 'critical' ? 'critical' : 'major',
    title: `${machine?.name ?? 'Machine'}: ${REASON_BY_CODE[e.code]?.reason ?? e.code}`,
    detail: `${asset?.name ?? 'Component'} · ${formatDuration(e.durationSec)}`,
    minute: e.minute,
    toast,
  })
}

// ---- finance --------------------------------------------------------------

const costByMachine = computed(() =>
  machines.map((m) => {
    const f = FINANCE[m.id]!
    let seconds = 0
    for (const e of errors) if (e.machineId === m.id) seconds += e.durationSec
    // Monthly value of lifting this machine to world-class OEE.
    // A machine in fault is judged by its normal OEE so the figure doesn't spike mid-outage.
    const oee = m.status === 'fault' ? oeeOf(bases.get(m.id)!) : m.oee
    const gap = m.status === 'offline' ? 0 : Math.max(0, WORLD_CLASS_OEE - oee) / 100
    return {
      machineId: m.id,
      seconds,
      cost: (seconds / 3600) * f.hourlyValue,
      unitsLost: Math.round(seconds / f.idealCycleSec),
      opportunity: gap * SCHEDULED_HOURS_PER_MONTH * f.hourlyValue,
    }
  }),
)

const finance = computed(() => ({
  cost: costByMachine.value.reduce((s, c) => s + c.cost, 0),
  unitsLost: costByMachine.value.reduce((s, c) => s + c.unitsLost, 0),
  opportunity: costByMachine.value.reduce((s, c) => s + c.opportunity, 0),
}))

// ---- tick -----------------------------------------------------------------

const recoverFault = (f: ActiveFault) => {
  const m = machineById(f.machineId)
  const base = bases.get(f.machineId)
  if (!m || !base) return
  m.status = base.status
  m.availability = round1(base.availability * 0.6)
  m.performance = round1(base.performance * 0.7)
  degraded.set(f.assetId, 10)
  const asset = subAssets.find((a) => a.id === f.assetId)
  pushAlert({
    machineId: m.id,
    kind: 'success',
    title: `${m.name} back online`,
    detail: `Downtime ${formatDuration(f.durationSec)}${asset ? ` · ${asset.name} needs inspection` : ''}`,
    toast: true,
  })
}

const step = (record = true) => {
  if (record) {
    for (const f of [...faults]) {
      f.ticksLeft--
      if (f.ticksLeft <= 0) {
        recoverFault(f)
        faults = faults.filter((x) => x !== f)
      }
    }
    for (const [id, left] of [...drifts]) {
      if (left - 1 <= 0) {
        drifts.delete(id)
        const m = machineById(id)
        if (m) {
          pushAlert({ machineId: id, kind: 'success', title: `${m.name}: quality back in spec`, detail: 'Reject rate returned to normal', toast: true })
        }
      } else {
        drifts.set(id, left - 1)
      }
    }
  }

  for (const m of machines) {
    const base = bases.get(m.id)!
    if (m.status === 'offline') {
      m.availability = m.performance = m.quality = m.oee = 0
    } else if (m.status === 'fault') {
      m.availability = m.performance = m.oee = 0
    } else {
      const wobble = m.status === 'running' ? 1 : 0.4
      const drifting = drifts.has(m.id)
      m.availability = round1(walk(m.availability, base.availability, 1.6 * wobble))
      m.performance = round1(walk(m.performance, base.performance, 2 * wobble))
      m.quality = round1(
        walk(m.quality, base.quality - (drifting ? 5 : 0), 0.5 * wobble, base.quality - (drifting ? 9 : 3), 100),
      )
      m.oee = round1(oeeOf(m))
      if (m.status === 'running') m.partsToday += Math.random() < 0.7 ? Math.ceil(Math.random() * 2) : 0
    }
    m.history.push({ t: Date.now(), oee: m.oee })
    if (m.history.length > HISTORY_POINTS) m.history.shift()
  }

  const p = plant.value
  for (const key of ['oee', 'availability', 'performance', 'quality'] as const) {
    plantHistory[key].push(p[key])
    if (plantHistory[key].length > HISTORY_POINTS) plantHistory[key].shift()
  }

  for (const a of subAssets) {
    const base = subAssetBases.get(a.id)!
    const machine = machineById(a.machineId)
    const held = faults.some((f) => f.assetId === a.id)
    if (machine && machine.status !== 'offline' && !held) {
      const healthTarget = base.health - (degraded.get(a.id) ?? 0)
      a.temperature = round1(walk(a.temperature, base.temperature, 1.6, base.temperature - 8, base.temperature + 12))
      a.vibration = round2(walk(a.vibration, base.vibration, base.vibration * 0.18, 0, 12))
      a.health = round1(walk(a.health, healthTarget, 0.6, healthTarget - 4, Math.min(100, healthTarget + 2)))
    }
    a.tempHistory.push(a.temperature)
    a.vibHistory.push(a.vibration)
    if (a.tempHistory.length > HISTORY_POINTS) a.tempHistory.shift()
    if (a.vibHistory.length > HISTORY_POINTS) a.vibHistory.shift()
  }

  mttr.value = Math.round(walk(mttr.value, 1080, 90, 600, 1800))
  mtbf.value = Math.round(walk(mtbf.value, 8951, 400, 6000, 12000))

  if (record) {
    advanceTimeline()
    if (Math.random() < 0.35) {
      const candidates = machines.filter((m) => m.status === 'running' || m.status === 'idle')
      const m = candidates[Math.floor(Math.random() * candidates.length)]
      if (m) {
        const e = createErrorEvent(Math.random, m.id, subAssets.filter((a) => a.machineId === m.id), nowMinute.value)
        errors.push(e)
        if (errors.length > MAX_ERRORS) errors.shift()
        if (e.severity !== 'minor') alertFromError(e, e.severity === 'critical')
      }
    }
    lastUpdated.value = Date.now()
  }
}

// ---- presenter scenarios --------------------------------------------------

/** A machine stops hard, the plant recovers about 25 seconds later. Returns false if it can't start. */
const simulateBreakdown = (machineId = 2) => {
  const m = machineById(machineId)
  if (!m || m.status === 'offline' || m.status === 'fault') return false
  const asset = subAssets
    .filter((a) => a.machineId === machineId)
    .sort((a, b) => a.health - b.health)[0]
  if (!asset) return false

  const durationSec = Math.round((FAULT_TICKS - 1) * FAULT_MINUTES_PER_TICK * 60)
  m.status = 'fault'
  m.availability = m.performance = m.oee = 0
  asset.health = round1(Math.max(8, asset.health - 18))
  asset.temperature = round1(asset.temperature + 24)
  asset.vibration = round2(asset.vibration * 2.2 + 1)
  faults.push({ machineId, assetId: asset.id, ticksLeft: FAULT_TICKS, durationSec })

  const e = createErrorEvent(Math.random, machineId, [asset], nowMinute.value)
  e.code = 'M105'
  e.severity = 'critical'
  e.durationSec = durationSec
  errors.push(e)

  timeline.value.push({ state: 'stopped', start: nowMinute.value, end: nowMinute.value })
  holdTicks = FAULT_TICKS

  pushAlert({
    machineId,
    kind: 'critical',
    title: `${m.name} stopped`,
    detail: `${REASON_BY_CODE.M105!.reason} · ${asset.name}`,
    toast: true,
  })
  return true
}

/** Quality drops and rejects start piling up for a short while. */
const simulateQualityDrift = (machineId = 1) => {
  const m = machineById(machineId)
  if (!m || m.status === 'offline' || m.status === 'fault' || drifts.has(machineId)) return false
  drifts.set(machineId, DRIFT_TICKS)
  m.quality = round1(Math.max(0, bases.get(machineId)!.quality - 5))
  m.oee = round1(oeeOf(m))

  const assets = subAssets.filter((a) => a.machineId === machineId)
  for (const code of ['Q501', 'Q502']) {
    const e = createErrorEvent(Math.random, machineId, assets, nowMinute.value)
    e.code = code
    e.severity = 'major'
    e.durationSec = 180 + Math.round(Math.random() * 120)
    errors.push(e)
  }
  pushAlert({
    machineId,
    kind: 'major',
    title: `${m.name}: quality drifting`,
    detail: 'Rejects rising · dimension out of tolerance',
    toast: true,
  })
  return true
}

// ---- lifecycle ------------------------------------------------------------

const lastUpdated = ref(Date.now())
const isLive = ref(true)
let initialised = false

const { pause, resume } = useIntervalFn(() => step(), TICK_MS, { immediate: false })

const resetState = () => {
  faults = []
  drifts.clear()
  degraded.clear()
  seeding = true

  for (const m of machines) {
    const base = bases.get(m.id)!
    Object.assign(m, { ...base, oee: round1(oeeOf(base)), history: [] })
  }
  subAssets.splice(0, subAssets.length, ...createSubAssets())
  for (const key of Object.keys(plantHistory) as (keyof typeof plantHistory)[]) plantHistory[key].splice(0)
  errors.splice(0)
  alerts.splice(0)
  mttr.value = 1080
  mtbf.value = 8951

  seedTimeline()
  errors.push(...createErrorHistory(subAssets, nowMinute.value))

  // Pre-fill history so sparklines and trend charts are populated on first paint.
  const now = Date.now()
  for (let i = HISTORY_POINTS; i > 0; i--) {
    step(false)
    for (const m of machines) m.history[m.history.length - 1]!.t = now - i * TICK_MS
  }
  lastUpdated.value = now

  // A couple of recent unread alerts so the bell is not empty on first load.
  const recent = errors.filter((e) => e.severity !== 'minor').slice(-3)
  recent.forEach((e, i) => {
    alertFromError(e, false)
    if (i < recent.length - 2) alerts[0]!.read = true
  })
  seeding = false
}

const init = () => {
  if (initialised) return
  initialised = true
  resetState()
  resume()
}

const resetDemo = () => {
  resetState()
  if (!isLive.value) toggle()
}

const toggle = () => {
  isLive.value = !isLive.value
  if (isLive.value) resume()
  else pause()
}

const distribution = computed(() => {
  const totals = Object.fromEntries(SHIFT_STATE_ORDER.map((s) => [s, { minutes: 0, count: 0 }])) as Record<
    ShiftState,
    { minutes: number; count: number }
  >
  for (const seg of timeline.value) {
    totals[seg.state].minutes += seg.end - seg.start
    totals[seg.state].count += 1
  }
  return totals
})

export function useLiveSimulation() {
  init()
  return {
    machines,
    plant,
    previous,
    plantHistory,
    kpis,
    previousKpis,
    timeline,
    distribution,
    nowMinute,
    shiftMinutes: SHIFT_MINUTES,
    subAssets,
    errors,
    alerts,
    unreadCount,
    markAllRead,
    onAlert,
    costByMachine,
    finance,
    lastUpdated,
    isLive,
    toggle,
    simulateBreakdown,
    simulateQualityDrift,
    resetDemo,
    getMachine: (id: number) => machineById(id),
  }
}
