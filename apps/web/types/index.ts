export type EquipmentStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'DECOMMISSIONED'
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE'
export type RentalCondition = 'GREAT' | 'GOOD' | 'BAD' | 'DAMAGED'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  document?: string
}

export interface Equipment {
  id: string
  name: string
  category: string
  brand: string
  model: string
  year: number
  serialNumber: string
  photos: string[]
  qrCode?: string
  status: EquipmentStatus
  dailyRate: string
  purchasePrice: string
  createdAt: string
  updatedAt: string
}

export interface Rental {
  id: string
  equipmentId: string
  clientId: string
  checkedOutById: string
  checkedInById?: string
  checkoutDate: string
  checkinDate?: string
  checkoutNotes?: string
  checkinCondition?: RentalCondition
  checkinNotes?: string
  dailyRate: string
  totalDays?: number
  totalAmount?: string
  equipment?: Partial<Equipment>
  client?: Partial<Client>
  checkedOutBy?: Partial<User>
  checkedInBy?: Partial<User>
}

export interface MaintenancePart {
  id: string
  name: string
  quantity: number
  unitPrice: string
}

export interface Maintenance {
  id: string
  equipmentId: string
  type: MaintenanceType
  description: string
  scheduledDate: string
  technicianName?: string
  executedDate?: string
  laborCost?: string
  releaseDate?: string
  releaseNotes?: string
  parts: MaintenancePart[]
  equipment?: Partial<Equipment>
  scheduledBy?: Partial<User>
  releasedBy?: Partial<User>
}

export interface Insurance {
  id: string
  equipmentId: string
  policyNumber: string
  insurer: string
  insuredValue: string
  premium: string
  startDate: string
  endDate: string
  coverage?: string
  claims: Claim[]
}

export interface Claim {
  id: string
  insuranceId: string
  description: string
  claimDate: string
  amount?: string
  resolved: boolean
  notes?: string
}

export interface EquipmentROI {
  equipment: Partial<Equipment>
  purchasePrice: number
  totalRevenue: number
  totalMaintenanceCost: number
  totalInsuranceCost: number
  netProfit: number
  roi: number
  roiPositive: boolean
  totalRentals: number
  downtimeDays: number
  lostRevenue: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}
