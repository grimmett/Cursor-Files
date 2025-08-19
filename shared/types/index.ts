export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    company: string;
    phone?: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum UserRole {
    ADMIN = 'admin',
    PROJECT_MANAGER = 'project_manager',
    INSPECTOR = 'inspector',
    CONTRACTOR = 'contractor'
  }
  
  export interface Project {
    id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    clientName: string;
    startDate: Date;
    endDate?: Date;
    status: ProjectStatus;
    createdBy: string;
    assignedUsers: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum ProjectStatus {
    PLANNING = 'planning',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    ON_HOLD = 'on_hold'
  }
  
  export interface PunchlistItem {
    id: string;
    projectId: string;
    title: string;
    description: string;
    location: string;
    trade: Trade;
    priority: Priority;
    status: ItemStatus;
    assignedTo?: string;
    createdBy: string;
    dueDate?: Date;
    completedDate?: Date;
    verifiedDate?: Date;
    photos: Photo[];
    notes: Note[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum Trade {
    ELECTRICAL = 'electrical',
    PLUMBING = 'plumbing',
    HVAC = 'hvac',
    STRUCTURAL = 'structural',
    FINISHES = 'finishes',
    LANDSCAPING = 'landscaping',
    GENERAL = 'general'
  }
  
  export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
  }
  
  export enum ItemStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    VERIFIED = 'verified',
    REJECTED = 'rejected'
  }
  
  export interface Photo {
    id: string;
    url: string;
    thumbnailUrl: string;
    caption?: string;
    takenAt: Date;
    uploadedBy: string;
    uploadedAt: Date;
  }
  
  export interface Note {
    id: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface PunchlistReport {
    id: string;
    projectId: string;
    name: string;
    generatedBy: string;
    generatedAt: Date;
    filters: ReportFilters;
    data: PunchlistItem[];
  }
  
  export interface ReportFilters {
    status?: ItemStatus[];
    trade?: Trade[];
    priority?: Priority[];
    assignedTo?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
  }
  
  export interface CreatePunchlistItemRequest {
    projectId: string;
    title: string;
    description: string;
    location: string;
    trade: Trade;
    priority: Priority;
    assignedTo?: string;
    dueDate?: Date;
  }
  
  export interface UpdatePunchlistItemRequest {
    title?: string;
    description?: string;
    location?: string;
    trade?: Trade;
    priority?: Priority;
    status?: ItemStatus;
    assignedTo?: string;
    dueDate?: Date;
  }