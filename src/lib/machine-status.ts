import type { MachineStatus } from '@/data/machines'

export type ShiftState = 'running' | 'slow' | 'planned' | 'microstop' | 'stopped'
export type Tone = 'success' | 'warning' | 'danger'

export const MACHINE_STATUS: Record<MachineStatus, { label: string; dot: string }> = {
  running: { label: 'Running', dot: 'bg-status-running' },
  idle: { label: 'Idle', dot: 'bg-status-idle' },
  offline: { label: 'Offline', dot: 'bg-status-offline' },
}

export const SHIFT_STATES: Record<ShiftState, { label: string; bg: string }> = {
  running: { label: 'Running', bg: 'bg-status-running' },
  slow: { label: 'Slow cycles', bg: 'bg-status-idle' },
  planned: { label: 'Planned stop', bg: 'bg-status-planned' },
  microstop: { label: 'Small stop', bg: 'bg-status-microstop' },
  stopped: { label: 'Stopped', bg: 'bg-status-offline' },
}

export const SHIFT_STATE_ORDER: ShiftState[] = ['running', 'slow', 'microstop', 'planned', 'stopped']

export const getOeeTone = (value: number): Tone => (value >= 85 ? 'success' : value >= 60 ? 'warning' : 'danger')

export const TONE_CLASSES: Record<Tone, { bg: string; text: string; stroke: string }> = {
  success: { bg: 'bg-success', text: 'text-success', stroke: 'stroke-success' },
  warning: { bg: 'bg-warning', text: 'text-warning', stroke: 'stroke-warning' },
  danger: { bg: 'bg-danger', text: 'text-danger', stroke: 'stroke-danger' },
}

export const formatDuration = (totalSeconds: number) => {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}m ${String(sec).padStart(2, '0')}s`
}

export const formatShiftTime = (minutesIntoShift: number, startHour = 6) => {
  const total = startHour * 60 + Math.floor(minutesIntoShift)
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
