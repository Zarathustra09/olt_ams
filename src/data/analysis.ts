import { MACHINES } from '@/data/machines'

export type ErrorCategory = 'mechanical' | 'electrical' | 'material' | 'operator' | 'quality'
export type Severity = 'critical' | 'major' | 'minor'

export interface ErrorReason {
  code: string
  reason: string
  category: ErrorCategory
}

export interface ErrorEvent {
  id: number
  machineId: number
  subAssetId: string
  code: string
  severity: Severity
  /** Minutes into the shift. */
  minute: number
  durationSec: number
}

export interface SubAsset {
  id: string
  machineId: number
  name: string
  categories: ErrorCategory[]
  health: number
  temperature: number
  vibration: number
  runtimeHours: number
  nextServiceDays: number
  tempHistory: number[]
  vibHistory: number[]
}

// Category order matches the validated --cat-1..5 slots; keep them in sync.
export const ERROR_CATEGORIES: Record<ErrorCategory, { label: string; bg: string }> = {
  mechanical: { label: 'Mechanical', bg: 'bg-cat-1' },
  electrical: { label: 'Electrical', bg: 'bg-cat-2' },
  material: { label: 'Material', bg: 'bg-cat-3' },
  operator: { label: 'Operator', bg: 'bg-cat-4' },
  quality: { label: 'Quality', bg: 'bg-cat-5' },
}
export const ERROR_CATEGORY_ORDER: ErrorCategory[] = ['mechanical', 'electrical', 'material', 'operator', 'quality']

export const ERROR_REASONS: ErrorReason[] = [
  { code: 'M101', reason: 'Spindle overload', category: 'mechanical' },
  { code: 'M102', reason: 'Tool breakage', category: 'mechanical' },
  { code: 'M103', reason: 'Coolant level low', category: 'mechanical' },
  { code: 'M104', reason: 'Jam / blockage', category: 'mechanical' },
  { code: 'M105', reason: 'Hydraulic pressure loss', category: 'mechanical' },
  { code: 'E201', reason: 'Servo drive fault', category: 'electrical' },
  { code: 'E202', reason: 'Sensor misread', category: 'electrical' },
  { code: 'E203', reason: 'Emergency stop triggered', category: 'electrical' },
  { code: 'S301', reason: 'Material shortage', category: 'material' },
  { code: 'S302', reason: 'Wrong material batch', category: 'material' },
  { code: 'O401', reason: 'Operator not present', category: 'operator' },
  { code: 'O402', reason: 'Setup overrun', category: 'operator' },
  { code: 'Q501', reason: 'Dimension out of tolerance', category: 'quality' },
  { code: 'Q502', reason: 'Surface defect', category: 'quality' },
]
export const REASON_BY_CODE = Object.fromEntries(ERROR_REASONS.map((r) => [r.code, r])) as Record<string, ErrorReason>

type AssetSeed = [name: string, categories: ErrorCategory[], health: number, temp: number, vib: number]

const SUB_ASSET_SEEDS: Record<number, AssetSeed[]> = {
  1: [
    ['Spindle', ['mechanical', 'quality'], 78, 62, 3.8],
    ['Tool changer', ['mechanical'], 88, 41, 2.1],
    ['Coolant system', ['mechanical', 'material'], 71, 33, 1.2],
    ['Axis drives', ['electrical', 'quality'], 92, 48, 1.9],
    ['Controller', ['electrical', 'operator'], 96, 39, 0.4],
  ],
  2: [
    ['Hydraulic pump', ['mechanical'], 66, 68, 4.6],
    ['Ram & slide', ['mechanical', 'quality'], 84, 45, 2.8],
    ['Die cushion', ['mechanical', 'material'], 90, 40, 1.7],
    ['Light curtain', ['electrical', 'operator'], 94, 31, 0.3],
    ['Controller', ['electrical'], 97, 37, 0.4],
  ],
  3: [
    ['Main spindle', ['mechanical', 'quality'], 74, 58, 3.4],
    ['Turret', ['mechanical'], 81, 44, 2.4],
    ['Tailstock', ['mechanical'], 93, 35, 1.1],
    ['Chip conveyor', ['material', 'mechanical'], 62, 38, 2.9],
    ['Controller', ['electrical', 'operator'], 95, 40, 0.4],
  ],
  4: [
    ['Conveyor', ['mechanical', 'material'], 89, 36, 2.2],
    ['Pick & place robot', ['electrical', 'mechanical'], 86, 47, 1.8],
    ['Screwdriver unit', ['mechanical', 'quality'], 77, 43, 2.6],
    ['Vision system', ['electrical', 'quality'], 93, 41, 0.5],
    ['PLC', ['electrical', 'operator'], 98, 38, 0.3],
  ],
  5: [
    ['Welding torch', ['mechanical', 'quality'], 58, 29, 0.2],
    ['Wire feeder', ['mechanical', 'material'], 64, 27, 0.2],
    ['Robot arm', ['electrical', 'mechanical'], 72, 26, 0.1],
    ['Power source', ['electrical'], 34, 25, 0.1],
    ['Controller', ['electrical', 'operator'], 81, 26, 0.1],
  ],
  6: [
    ['Infeed conveyor', ['mechanical', 'material'], 87, 35, 2.0],
    ['Carton erector', ['mechanical'], 73, 42, 3.1],
    ['Sealer', ['mechanical', 'quality'], 80, 64, 1.6],
    ['Labeler', ['electrical', 'material', 'quality'], 91, 37, 0.9],
    ['Checkweigher', ['electrical', 'quality'], 95, 33, 0.6],
  ],
}

// Deterministic PRNG so the mock data looks the same on every load.
export const mulberry32 = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export const createSubAssets = (): SubAsset[] => {
  const rand = mulberry32(42)
  return MACHINES.flatMap((m) =>
    (SUB_ASSET_SEEDS[m.id] ?? []).map(([name, categories, health, temp, vib]) => ({
      id: `${m.id}-${slug(name)}`,
      machineId: m.id,
      name,
      categories,
      health,
      temperature: temp,
      vibration: vib,
      runtimeHours: Math.round(1200 + rand() * 8000),
      nextServiceDays: Math.round(2 + rand() * 60),
      tempHistory: [],
      vibHistory: [],
    })),
  )
}

const pick = <T>(rand: () => number, items: T[]) => items[Math.floor(rand() * items.length)]!

/** Weighted towards unhealthy sub-assets. */
export const pickSubAsset = (rand: () => number, assets: SubAsset[]) => {
  const weights = assets.map((a) => Math.max(5, 105 - a.health))
  let r = rand() * weights.reduce((sum, w) => sum + w, 0)
  for (let i = 0; i < assets.length; i++) {
    r -= weights[i]!
    if (r <= 0) return assets[i]!
  }
  return assets[assets.length - 1]!
}

let nextErrorId = 1

export const createErrorEvent = (
  rand: () => number,
  machineId: number,
  assets: SubAsset[],
  minute: number,
): ErrorEvent => {
  const asset = pickSubAsset(rand, assets)
  const reasons = ERROR_REASONS.filter((r) => asset.categories.includes(r.category))
  const reason = pick(rand, reasons.length ? reasons : ERROR_REASONS)
  const roll = rand()
  const severity: Severity = roll < 0.12 ? 'critical' : roll < 0.45 ? 'major' : 'minor'
  const base = severity === 'critical' ? 900 : severity === 'major' ? 300 : 60
  return {
    id: nextErrorId++,
    machineId,
    subAssetId: asset.id,
    code: reason.code,
    severity,
    minute,
    durationSec: Math.round(base * (0.5 + rand() * 1.5)),
  }
}

/** Error history for the shift so far, newest last. */
export const createErrorHistory = (subAssets: SubAsset[], upToMinute: number): ErrorEvent[] => {
  const rand = mulberry32(7)
  const events: ErrorEvent[] = []
  for (const m of MACHINES) {
    const assets = subAssets.filter((a) => a.machineId === m.id)
    // Busier/less healthy machines throw more errors; the offline welder failed early in the shift.
    const count = m.status === 'offline' ? 6 : m.status === 'idle' ? 26 : Math.round(12 + (100 - m.availability) * 1.4)
    const window = m.status === 'offline' ? Math.min(upToMinute, 90) : upToMinute
    for (let i = 0; i < count; i++) {
      events.push(createErrorEvent(rand, m.id, assets, Math.round(rand() * window * 4) / 4))
    }
  }
  return events.sort((a, b) => a.minute - b.minute)
}
