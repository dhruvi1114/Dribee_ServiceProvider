export type JobStatus =
  | 'new'
  | 'accepted'
  | 'inProgress'
  | 'partsPending'
  | 'readyResume'
  | 'completed'
  | 'rejected';

export type PartAvailability = 'available' | 'outOfStock' | 'locked';

export type EarningStatus = 'pending' | 'approved' | 'paid' | 'failed';

export type NotificationType = 'job' | 'payment' | 'alert' | 'failure';

export type TimelineStepStatus = 'completed' | 'active' | 'pending';

export interface TimelineStep {
  key: string;
  label: string;
  status: TimelineStepStatus;
  timestamp?: string;
}

export interface Part {
  id: string;
  name: string;
  variant: string;
  category: string;
  available: boolean;
}

export interface JobPart {
  partId: string;
  // SKU id (variant id). Required for backend addJobPart, which expects a
  // productId + skuId pair. Optional on legacy/mock rows that lack a sku.
  skuId?: string;
  name: string;
  variant: string;
  qty: number;
  unitPrice?: number;
  gstRate?: number;
  status: PartAvailability;
}

export interface Job {
  id: string;
  // service_jobs.id, populated once the pro accepts and the job row is created.
  // Required for any /service/jobs/:id/* call (diagnoses, parts, etc.).
  serviceJobId?: string | null;
  status: JobStatus;
  serviceType: string;
  serviceName: string;
  machineType: string;
  description: string;
  price: number | null;
  slot: string;
  date: string;
  zone: string;
  customerName: string;
  address: string | null;
  diagnosis?: string[];
  parts: JobPart[];
  timeline: TimelineStep[];
  earning: number | null;
  rating?: number;
  ratingComment?: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
}

export interface Earning {
  id: string;
  jobId: string;
  serviceType: string;
  serviceName: string;
  machineType: string;
  description: string;
  date: string;
  grossEarning: number;
  continuationFee?: number;
  commissionPct: number;
  commissionAmount: number;
  netEarning: number;
  status: EarningStatus;
  completedAt?: string | null;
  paidOn?: string;
  failReason?: string;
}

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

export interface ProUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string | null;
  status: 'pendingApproval' | 'approved' | 'rejected';
  isAvailable: boolean;
  zones: string[];
  skills: string[];
  machineTypes: string[];
  serviceTypes: string[];
  rating: number;
  totalJobs: number;
  bankDetails: BankDetails;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Rating {
  jobId: string;
  stars: number;
  comment: string;
  serviceType: string;
  machineType: string;
  date: string;
}
