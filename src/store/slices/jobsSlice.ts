import { createSlice } from '@reduxjs/toolkit';

import { mockJobs } from '@/constants/mockData';

import type { Job, JobPart, JobStatus, TimelineStep } from '@/types/dribee';
import type { PayloadAction } from '@reduxjs/toolkit';

interface JobsState {
  jobs: Job[];
}

const initialState: JobsState = {
  jobs: mockJobs,
};

function advanceTimeline(timeline: TimelineStep[], stepKey: string): TimelineStep[] {
  const idx = timeline.findIndex((s) => s.key === stepKey);
  if (idx < 0) return timeline;
  return timeline.map((s, i) => {
    if (i < idx) return { ...s, status: 'completed' };
    if (i === idx)
      return { ...s, status: 'completed', timestamp: s.timestamp ?? new Date().toLocaleString() };
    if (i === idx + 1) return { ...s, status: 'active' };
    return { ...s, status: 'pending' };
  });
}

function setStatus(state: JobsState, jobId: string, status: JobStatus) {
  const job = state.jobs.find((j) => j.id === jobId);
  if (job) job.status = status;
}

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    acceptJob(state, action: PayloadAction<{ jobId: string; address: string }>) {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (!job) return;
      job.status = 'accepted';
      job.address = action.payload.address;
      job.customerName = job.customerName.startsWith('Customer #')
        ? 'Priya Sharma'
        : job.customerName;
      job.timeline = advanceTimeline(job.timeline, 'accepted');
    },
    rejectJob(state, action: PayloadAction<{ jobId: string }>) {
      setStatus(state, action.payload.jobId, 'rejected');
    },
    verifyOtp(state, action: PayloadAction<{ jobId: string }>) {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (!job) return;
      job.status = 'inProgress';
      job.timeline = advanceTimeline(job.timeline, 'inProgress');
    },
    setDiagnosis(state, action: PayloadAction<{ jobId: string; tags: string[] }>) {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (!job) return;
      job.diagnosis = action.payload.tags;
    },
    setJobParts(state, action: PayloadAction<{ jobId: string; parts: JobPart[] }>) {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (!job) return;
      job.parts = action.payload.parts;
    },
    sendPartsForApproval(state, action: PayloadAction<{ jobId: string }>) {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (!job) return;
      job.timeline = advanceTimeline(job.timeline, 'partsSent');
    },
    approveParts(state, action: PayloadAction<{ jobId: string }>) {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (!job) return;
      job.parts = job.parts.map((p) => ({ ...p, status: 'locked' }));
      job.timeline = advanceTimeline(job.timeline, 'partsApproved');
    },
    completeJob(
      state,
      action: PayloadAction<{ jobId: string; netEarning: number }>,
    ) {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (!job) return;
      job.status = 'completed';
      job.earning = action.payload.netEarning;
      job.timeline = advanceTimeline(job.timeline, 'completed');
    },
  },
});

export const {
  acceptJob,
  rejectJob,
  verifyOtp,
  setDiagnosis,
  setJobParts,
  sendPartsForApproval,
  approveParts,
  completeJob,
} = jobsSlice.actions;
export default jobsSlice.reducer;
