export interface User {
  id: string
  email: string
  displayName: string | null
  role: 'beneficiary' | 'admin' | 'superadmin'
  barangay?: string
  createdAt: Date
  updatedAt: Date
}

export interface Program {
  id: string
  name: string
  description: string
  type: 'livelihood' | 'social-pension' | 'child-services' | 'family-support' | 'emergency-response'
  requirements: string[]
  benefits: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Application {
  id: string
  userId: string
  programId: string
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'active' | 'completed'
  reason: string
  documents: string[]
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Beneficiary {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  barangay: string
  address: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  civilStatus?: 'single' | 'married' | 'widowed' | 'separated'
  occupation?: string
  monthlyIncome?: number
  householdSize?: number
  createdAt: Date
  updatedAt: Date
}

export interface WebflowSite {
  id: string
  displayName: string
  shortName: string
  lastPublished?: Date
  previewUrl: string
  timezone: string
}

export interface WebflowCollection {
  id: string
  displayName: string
  singularName: string
  slug: string
  fields: WebflowField[]
}

export interface WebflowField {
  id: string
  displayName: string
  slug: string
  type: string
  isRequired: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}