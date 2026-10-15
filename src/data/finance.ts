// Mock economics used to turn lost minutes into pesos. Not meant to be accurate.

export interface MachineFinance {
  /** Value of one productive hour (contribution margin), PHP. */
  hourlyValue: number
  /** Ideal seconds per part. */
  idealCycleSec: number
}

export const FINANCE: Record<number, MachineFinance> = {
  1: { hourlyValue: 28000, idealCycleSec: 138 },
  2: { hourlyValue: 45000, idealCycleSec: 95 },
  3: { hourlyValue: 22000, idealCycleSec: 150 },
  4: { hourlyValue: 38000, idealCycleSec: 42 },
  5: { hourlyValue: 18000, idealCycleSec: 210 },
  6: { hourlyValue: 26000, idealCycleSec: 24 },
}

export const WORLD_CLASS_OEE = 85
/** 16 scheduled hours/day x 26 days. */
export const SCHEDULED_HOURS_PER_MONTH = 416

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 })
const pesoCompact = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const formatPeso = (value: number) => peso.format(Math.round(value))
export const formatPesoCompact = (value: number) => pesoCompact.format(value)
