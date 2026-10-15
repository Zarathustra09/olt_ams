import { computed, reactive, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { MACHINES, type Machine } from '@/data/machines'
import { createErrorEvent, createErrorHistory, createSubAssets, type ErrorEvent, type SubAsset } from '@/data/analysis'
import { SHIFT_STATE_ORDER, type ShiftState } from '@/lib/machine-status'

const TICK_MS = 2500
const HISTORY_POINTS = 30
const SHIFT_MINUTES = 480
const MINUTES_PER_TICK = 0.25
const LOADING_FACTOR = 0.62

export interface LiveMachine extends Machine {
  oee: number
  history: { t: number; oee: number }[]
}

export interface Segment {
  state: ShiftState
  start: number
  end: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const round1 = (v: number) => Math.round(v * 10) / 10
// Bounded random walk that gently mean-reverts so values never drift off.
const walk = (v: number, base: number, step: number, lo = 0, hi = 100) =>
  clamp(v + (Math.random() - 0.5) * step + (base - v) * 0.15, lo, hi)
const oeeOf = (m: Pick<Machine, 'availability' | 'performance' | 'quality'>) =>
  (m.availability * m.performance * m.quality) / 10000

const bases = new Map<number, Machine>(MACHINES.map((m) => [m.id, m]))

const machines = reactive<LiveMachine[]>(
  MACHINES.map((m) => ({ ...m, oee: round1(oeeOf(m)), history: [] })),
)

const plantHistory = reactive({
  oee: [] as number[],
  availability: [] as number[],
  performance: [] as number[],
  quality: [] as number[],
})

const subAssets = reactive<SubAsset[]>(createSubAssets())
const subAssetBases = new Map(subAssets.map((a) => [a.id, { ...a }]))
const errors = reactive<ErrorEvent[]>([])
const MAX_ERRORS = 600

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
}

const advanceTimeline = () => {
  if (nowMinute.value >= SHIFT_MINUTES) {
    timeline.value = [{ state: 'running', start: 0, end: 0 }]
    nowMinute.value = 0
    errors.splice(0)
  }
  nowMinute.value = Math.min(SHIFT_MINUTES, nowMinute.value + MINUTES_PER_TICK)
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

const step = (record = true) => {
  for (const m of machines) {
    const base = bases.get(m.id)!
    if (m.status === 'offline') {
      m.availability = m.performance = m.quality = m.oee = 0
    } else {
      const wobble = m.status === 'running' ? 1 : 0.4
      m.availability = round1(walk(m.availability, base.availability, 1.6 * wobble))
      m.performance = round1(walk(m.performance, base.performance, 2 * wobble))
      m.quality = round1(walk(m.quality, base.quality, 0.5 * wobble, base.quality - 3, 100))
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
    if (bases.get(a.machineId)!.status !== 'offline') {
      a.temperature = round1(walk(a.temperature, base.temperature, 1.6, base.temperature - 8, base.temperature + 12))
      a.vibration = Math.round(walk(a.vibration, base.vibration, base.vibration * 0.18, 0, 12) * 100) / 100
      a.health = round1(walk(a.health, base.health, 0.6, base.health - 4, Math.min(100, base.health + 2)))
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
      const candidates = machines.filter((m) => m.status !== 'offline')
      const m = candidates[Math.floor(Math.random() * candidates.length)]!
      errors.push(createErrorEvent(Math.random, m.id, subAssets.filter((a) => a.machineId === m.id), nowMinute.value))
      if (errors.length > MAX_ERRORS) errors.shift()
    }
    lastUpdated.value = Date.now()
  }
}

const lastUpdated = ref(Date.now())
const isLive = ref(true)
let initialised = false

const { pause, resume } = useIntervalFn(() => step(), TICK_MS, { immediate: false })

const init = () => {
  if (initialised) return
  initialised = true
  seedTimeline()
  errors.push(...createErrorHistory(subAssets, nowMinute.value))
  // Pre-fill history so sparklines and trend charts are populated on first paint.
  const now = Date.now()
  for (let i = HISTORY_POINTS; i > 0; i--) {
    step(false)
    for (const m of machines) m.history[m.history.length - 1]!.t = now - i * TICK_MS
  }
  lastUpdated.value = now
  resume()
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
    lastUpdated,
    isLive,
    toggle,
    getMachine: (id: number) => machines.find((m) => m.id === id),
  }
}
