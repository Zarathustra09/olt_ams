export type MachineStatus = 'running' | 'idle' | 'offline'

export interface Machine {
  id: number
  name: string
  type: string
  status: MachineStatus
  location: string
  manufacturer: string
  model: string
  serialNumber: string
  installDate: string
  currentJob: string
  operator: string
  shift: string
  availability: number
  performance: number
  quality: number
  partsToday: number
}

export const MACHINES: Machine[] = [
  {
    id: 1, name: 'CNC Machine 01', type: 'CNC Mill', status: 'running',
    location: 'Production Floor A', manufacturer: 'HAAS Automation', model: 'VF-2SS',
    serialNumber: 'SN-2024-001', installDate: 'January 15, 2023',
    currentJob: 'Part #A-12345', operator: 'Mike Johnson', shift: 'Day Shift (6 AM - 2 PM)',
    availability: 92.3, performance: 95.8, quality: 99.4, partsToday: 247,
  },
  {
    id: 2, name: 'Press Machine 02', type: 'Hydraulic Press', status: 'running',
    location: 'Production Floor A', manufacturer: 'Schuler', model: 'HP-400',
    serialNumber: 'SN-2023-014', installDate: 'June 3, 2022',
    currentJob: 'Part #B-20871', operator: 'Dana Lopez', shift: 'Day Shift (6 AM - 2 PM)',
    availability: 88.1, performance: 85.3, quality: 98.6, partsToday: 188,
  },
  {
    id: 3, name: 'Lathe Machine 03', type: 'CNC Lathe', status: 'idle',
    location: 'Production Floor B', manufacturer: 'Mazak', model: 'QT-250',
    serialNumber: 'SN-2022-032', installDate: 'March 21, 2022',
    currentJob: 'Awaiting material', operator: 'Chris Tan', shift: 'Day Shift (6 AM - 2 PM)',
    availability: 65.2, performance: 70.3, quality: 97.9, partsToday: 96,
  },
  {
    id: 4, name: 'Assembly Line 01', type: 'Automated Assembly', status: 'running',
    location: 'Assembly Hall', manufacturer: 'Siemens', model: 'AL-900',
    serialNumber: 'SN-2024-007', installDate: 'August 9, 2023',
    currentJob: 'Order #7731', operator: 'Priya Nair', shift: 'Day Shift (6 AM - 2 PM)',
    availability: 95.5, performance: 96.5, quality: 99.8, partsToday: 412,
  },
  {
    id: 5, name: 'Welding Robot 01', type: 'Robotic Welder', status: 'offline',
    location: 'Production Floor B', manufacturer: 'FANUC', model: 'ARC Mate 100',
    serialNumber: 'SN-2021-019', installDate: 'November 2, 2021',
    currentJob: 'None', operator: 'Unassigned', shift: 'Day Shift (6 AM - 2 PM)',
    availability: 0, performance: 0, quality: 0, partsToday: 0,
  },
  {
    id: 6, name: 'Packaging Line 01', type: 'Packaging System', status: 'running',
    location: 'Shipping', manufacturer: 'Bosch Packaging', model: 'PL-120',
    serialNumber: 'SN-2023-026', installDate: 'May 17, 2023',
    currentJob: 'SKU #88-4410', operator: 'Sam Reyes', shift: 'Day Shift (6 AM - 2 PM)',
    availability: 90.1, performance: 91.4, quality: 99.1, partsToday: 305,
  },
]
