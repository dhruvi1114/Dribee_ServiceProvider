import { z } from 'zod';

import { emailField, passwordField } from '@/utils/validations/helpers';

// ── Auth Schemas ──

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Pro Registration Schema ──

export const registerProSchema = z.object({
  fullName:           z.string().trim().min(2, 'Name is required').max(80),
  phone:              z.string().regex(/^\d{10}$/, 'Enter 10-digit phone'),
  email:              z.string().email('Invalid email').optional().or(z.literal('')),

  addressLine1:       z.string().trim().min(2, 'Address is required').max(255),
  addressLine2:       z.string().trim().max(255).optional().or(z.literal('')),
  pincode:            z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),

  aadhaarLast4:       z.string().regex(/^\d{4}$/, 'Last 4 digits of Aadhaar'),
  panNumber:          z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN'),
  idProofUrl:         z.string().url('Upload an ID proof'),

  bankAccountNumber:  z.string().regex(/^\d{9,18}$/, 'Invalid account number'),
  ifscCode:           z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC'),
});
export type RegisterProFormValues = z.infer<typeof registerProSchema>;

export const completeProProfileSchema = z.object({
  state:          z.string().min(2, 'Select a state'),
  cityId:         z.string().regex(/^\d+$/, 'Select a city'),
  serviceTypeIds: z.array(z.string()).min(1, 'Pick at least one skill'),
  zoneIds:        z.array(z.string()).min(1, 'Pick at least one zone'),
  machineTypes:   z.array(z.string()).min(1, 'Pick at least one machine type'),
});
export type CompleteProProfileFormValues = z.infer<typeof completeProProfileSchema>;

// Add feature schemas below:
// export const createItemSchema = z.object({ ... });
// export type CreateItemFormValues = z.infer<typeof createItemSchema>;
