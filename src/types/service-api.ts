/**
 * API request/response types for the service module.
 * Field names match the backend wire format (snake_case) exactly —
 * see backend src/modules/service/service.repository.ts.
 * Mappers in @/services/jobs/mappers.ts convert these into the
 * local UI types (Job, Earning) defined in dribee.ts.
 */

export type BookingStatus =
  | 'pending_assignment'
  | 'assigned'
  | 'confirmed'
  | 'in_progress'
  | 'awaiting_parts'
  | 'parts_ready'
  | 'parts_pending'
  | 'ready_to_resume'
  | 'completed'
  | 'cancelled';

// Matches service_jobs.status CHECK constraint in the DB.
export type JobApiStatus = 'pending' | 'in_progress' | 'awaiting_parts' | 'awaiting_payment' | 'completed';

export type BookingPriority = 'normal' | 'urgent';

export type PaymentPhase = 'available_parts' | 'out_of_stock_parts' | 'final_balance';

export type EarningStatusApi = 'pending' | 'approved' | 'paid' | 'failed';

export type PartsListStatus = 'draft' | 'sent' | 'locked';

export interface ServiceAddress {
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

/** Row shape returned by GET /service/bookings (list) and /service/bookings/:id */
export interface BookingApi {
  id: string;
  status: BookingStatus;
  priority: BookingPriority;
  slot_date: string | null;
  slot_start_time: string | null;
  created_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  tc_accepted_at: string | null;
  price_at_booking: number | null;
  customer_address: string | null;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  dealer_id: string | null;
  dealer_name: string | null;
  dealer_phone: string | null;
  assigned_pro_id: string | null;
  pro_name: string | null;
  pro_phone: string | null;
  catalogue_id: string | null;
  area_id: string | null;
  zone_id: string | null;
  zone_name: string | null;
  service_type_name: string | null;
  service_name: string | null;
  machine_type: string | null;
  service_description: string | null;
  service_job_id: string | null;
  customer_last_lat: number | null;
  customer_last_lng: number | null;
  customer_last_pincode: string | null;
  pending_cod_payment: { id: string; amount: number } | null;
  completed_at: string | null;
  customer_rating: number | null;
  service_lat: number | null;
  service_lng: number | null;
  parts?: JobPartApi[];
}

export interface JobPartApi {
  id: string;
  job_id: string;
  product_id: string;
  sku_id: string;
  name: string;
  variant_name: string | null;
  qty: number;
  unit_price: number;
  gst_rate: number;
  availability_status: 'available' | 'out_of_stock' | 'reserved' | 'pending_approval' | 'approved' | 'dispatched';
  customer_approved: boolean;
  po_id: string | null;
  po_triggered: boolean;
}

export interface JobApi {
  id: string;
  booking_id: string;
  pro_id: string;
  status: JobApiStatus;
  started_at: string | null;
  completed_at: string | null;
  parts_list_status: PartsListStatus;
  diagnosis_issue_tags: string[];
  diagnosis_notes: string | null;
  parts: JobPartApi[];
}

export interface BookingListParams {
  status?: BookingStatus;
  pro_id?: string;
  page?: number;
  limit?: number;
}

export interface JobListParams {
  status?: JobApiStatus;
  page?: number;
  limit?: number;
}

export interface RejectBookingRequest {
  reason: string;
}

export interface VerifyOtpRequest {
  otp: string;
}

export interface AddDiagnosisRequest {
  issueTags: string[];
  notes?: string;
}

export interface AddJobPartRequest {
  productId: string;
  skuId: string;
  quantity: number;
  unitPrice: number;
}

export interface CompleteJobRequest {
  // Backend field name is `completionNotes`. Used for normal closing notes
  // and — when force=true — as the mandatory reason for force-completing.
  completionNotes?: string;
  // Phase 5 — force-complete a job that hasn't reached normal completion path
  // (e.g. customer declined a revisit while parts_pending). Backend requires
  // a non-empty completionNotes when this is true.
  force?: boolean;
}

export interface RegisterProRequest {
  name: string;
  phone: string;
  email: string;
  zoneIds: string[];
  skillTags: string[];
  machineTypes: string[];
}

export interface EarningApi {
  id: string;
  pro_id: string;
  booking_id: string;
  job_id: string;
  gross_amount: number;
  commission_amount: number;
  net_earning: number;
  /** Present when API aliases or legacy maps payout to `status`. */
  status?: EarningStatusApi;
  /** From `pro_earnings.payout_status` on GET /service/earnings (primary). */
  payout_status?: EarningStatusApi | 'processing';
  paid_at: string | null;
  fail_reason: string | null;
  created_at: string;
  service_type_name: string | null;
  service_name: string | null;
  machine_type: string | null;
  service_description: string | null;
  completed_at: string | null;
}

export interface EarningListParams {
  status?: EarningStatusApi;
  pro_id?: string;
  page?: number;
  limit?: number;
}

export interface ServiceCatalogueItemApi {
  id: string;
  service_type_id: string;
  service_type_name: string;
  machine_type: string;
  base_fee: number;
  urgency_multiplier: number;
  slot_duration_mins: number;
  description: string | null;
  is_active: boolean;
}
