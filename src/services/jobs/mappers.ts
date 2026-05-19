import type { Job, JobStatus, JobPart, Earning, EarningStatus } from '@/types/dribee';
import type { BookingApi, BookingStatus, EarningApi, EarningStatusApi, JobPartApi } from '@/types/service-api';

const mapBookingStatus = (status: BookingStatus): JobStatus => {
  switch (status) {
    case 'pending_assignment':
    case 'assigned':
      return 'new';
    case 'confirmed':
      return 'accepted';
    case 'in_progress':
      return 'inProgress';
    // New flow: when a parts order has been placed, the booking is paused on
    // the warehouse fulfilling the order. Pro shouldn't tap into the job;
    // they wait for the customer to hit Resume.
    case 'awaiting_parts':
    case 'parts_pending':
      return 'partsPending';
    case 'parts_ready':
    case 'ready_to_resume':
      return 'readyResume';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'rejected';
    default:
      return 'new';
  }
};

const mapPartAvailability = (s: JobPartApi['availability_status'], approved: boolean): JobPart['status'] => {
  if (approved) return 'locked';
  if (s === 'out_of_stock') return 'outOfStock';
  if (s === 'reserved' || s === 'dispatched') return 'locked';
  return 'available';
};

export const bookingToJob = (b: BookingApi): Job => ({
  id: b.id,
  serviceJobId: b.service_job_id,
  status: mapBookingStatus(b.status),
  serviceType: b.service_type_name ?? 'Service',
  serviceName: b.service_name ?? b.service_type_name ?? 'Service',
  machineType: b.machine_type ?? '',
  description: b.service_description ?? '',
  price: b.price_at_booking ?? null,
  slot: b.slot_date ?? '—',
  date: b.slot_date ?? b.created_at,
  zone: b.zone_name ?? '—',
  customerName: b.customer_name || b.dealer_name || '—',
  // Spec: address is hidden from pro until they accept the booking.
  address:
    b.status === 'pending_assignment' || b.status === 'assigned'
      ? null
      : b.customer_address ?? null,
  rating: b.customer_rating ?? undefined,
  parts: (b.parts ?? []).map(jobPartApiToJobPart),
  timeline: [],
  earning: null,
  completedAt: b.completed_at ?? null,
  cancelledAt: b.cancelled_at ?? null,
  cancellationReason: b.cancellation_reason ?? null,
});

export const jobPartApiToJobPart = (p: JobPartApi): JobPart => ({
  partId: p.id,
  name: p.name,
  variant: p.variant_name ?? '',
  qty: p.qty,
  unitPrice: p.unit_price,
  gstRate: p.gst_rate,
  status: mapPartAvailability(p.availability_status, p.customer_approved),
});

/** GET /service/earnings returns `payout_status` (DB column); some payloads may still send `status`. */
const normalizeEarningStatusApi = (e: EarningApi): EarningStatusApi => {
  const raw = (e.status ?? e.payout_status ?? 'pending') as string;
  if (raw === 'processing') return 'approved';
  if (raw === 'pending' || raw === 'approved' || raw === 'paid' || raw === 'failed') return raw;
  return 'pending';
};

const mapEarningStatus = (s: EarningStatusApi): EarningStatus => s;

export const earningApiToEarning = (e: EarningApi): Earning => ({
  id: e.id,
  jobId: e.job_id,
  serviceType: e.service_type_name ?? '—',
  serviceName: e.service_name ?? e.service_type_name ?? '—',
  machineType: e.machine_type ?? '—',
  description: e.service_description ?? '',
  date: e.created_at,
  grossEarning: e.gross_amount,
  commissionPct: e.gross_amount > 0 ? Math.round((e.commission_amount / e.gross_amount) * 100) : 0,
  commissionAmount: e.commission_amount,
  netEarning: e.net_earning,
  status: mapEarningStatus(normalizeEarningStatusApi(e)),
  completedAt: e.completed_at ?? null,
  paidOn: e.paid_at ?? undefined,
  failReason: e.fail_reason ?? undefined,
});
