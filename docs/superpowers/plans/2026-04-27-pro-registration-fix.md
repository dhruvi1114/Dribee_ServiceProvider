# Service Provider Registration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make external service-provider self-registration work end-to-end — from a 3-step wizard in the RN app to admin approval that creates a usable login.

**Architecture:** Backend changes ship first (schema, master endpoints, upload endpoint, register/approval flow). Then the RN app is restructured into a 3-step wizard that submits a complete payload matching the backend schema. Razorpay contact/fund-account creation is wired into the existing admin approval flow using helpers that already exist.

**Tech Stack:** Node/Express + Postgres (raw SQL Prisma migrations), Jest, multer, Razorpay SDK helpers (existing). React Native 0.76, react-query v5, react-native-image-picker, NativeWind, Zod.

**Repos:**
- Backend: `/Users/sarvadhisolution/Documents/DriBee_Project/dribee-web-monorepo/backend`
- Frontend: `/Users/sarvadhisolution/Documents/Service_Provide`

**Spec:** `docs/superpowers/specs/2026-04-27-pro-registration-fix-design.md`

**Schema decision (overrides spec §5.1, §5.4):** the live DB has `cities(id, name, state, is_active, created_at)` with `state` as a plain varchar — no separate `states` table. To avoid a risky data migration we will:
- Expose states by `SELECT DISTINCT state FROM cities WHERE is_active = true`.
- Store `state VARCHAR(100) NOT NULL` and `city_id BIGINT NOT NULL REFERENCES cities(id)` on `pros`.

---

## File Map

### Backend (new / modified)

- **Modify** `backend/prisma/migrations/<new-ts>_pro_registration_kyc/migration.sql` (new) — add columns to `pros`, add unique partial index on `pro_registration_requests`, ensure `machine_types(is_active)` is respected by master.
- **Modify** `backend/src/modules/master/master.repository.ts` — add `is_active = true` filter to machine types; add `listStates()`, `listCities(state)`.
- **Modify** `backend/src/modules/master/master.controller.ts` — controllers for states/cities.
- **Modify** `backend/src/modules/master/master.routes.ts` — register `/states` and `/cities`.
- **Modify** `backend/src/modules/service/service.types.ts` — `registerProSchema` updates.
- **Modify** `backend/src/modules/service/service.routes.ts` — add `POST /pros/upload-id-proof` (public, multer).
- **Modify** `backend/src/modules/service/service.controller.ts` — `uploadIdProofController`.
- **Modify** `backend/src/middleware/upload.ts` — add `uploadIdProof` multer config (5 MB; jpeg/png/pdf).
- **Modify** `backend/src/modules/service/service.repository.ts` — `approveProRegistration` writes new columns, populates `pro_machine_types`, calls Razorpay helpers.
- **Test** `backend/src/__tests__/service-pro-registration.test.ts` (new).
- **Test** `backend/src/__tests__/master-states-cities.test.ts` (new).

### Frontend (new / modified)

- **Modify** `Service_Provide/src/utils/constants/api.constant.ts` — add new endpoints.
- **Modify** `Service_Provide/src/utils/validations/index.ts` — `registerProSchema` (Zod).
- **Modify** `Service_Provide/src/services/master/master.query.ts` — add `useStates`, `useCities`, `useMachineTypes`.
- **Create** `Service_Provide/src/services/pro/upload.query.ts` — `useUploadIdProof` mutation.
- **Modify** `Service_Provide/src/services/pro/pro.query.ts` — fix `useRegisterPro` payload shape.
- **Create** `Service_Provide/src/screens/dribee/auth/register/Step1Basic.tsx`
- **Create** `Service_Provide/src/screens/dribee/auth/register/Step2Services.tsx`
- **Create** `Service_Provide/src/screens/dribee/auth/register/Step3KycAddress.tsx`
- **Modify** `Service_Provide/src/screens/dribee/auth/RegisterScreen.tsx` — becomes the wizard host.
- **Create** `Service_Provide/src/screens/dribee/auth/RegistrationSubmittedScreen.tsx`
- **Modify** `Service_Provide/src/navigation/AuthStack.tsx` — register the new screen, remove `PendingApproval` polling.
- **Modify** `Service_Provide/src/store/slices/proSlice.ts` — drop `pendingApproval` mock state.
- **Delete (or empty)** `Service_Provide/src/screens/dribee/auth/PendingApprovalScreen.tsx` — replaced by `RegistrationSubmittedScreen`.

---

# Phase 1 — Backend Schema & Migration

### Task 1: Migration — `pros` columns, indexes, request constraints

**Files:**
- Create: `backend/prisma/migrations/20260427120000_pro_registration_kyc/migration.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Add address, KYC and ensure NOT NULL bank_account on pros
ALTER TABLE pros
  ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS state         VARCHAR(100),
  ADD COLUMN IF NOT EXISTS city_id       BIGINT REFERENCES cities(id),
  ADD COLUMN IF NOT EXISTS pincode       VARCHAR(10),
  ADD COLUMN IF NOT EXISTS aadhaar_last4 CHAR(4),
  ADD COLUMN IF NOT EXISTS pan_number    VARCHAR(10),
  ADD COLUMN IF NOT EXISTS id_proof_url  VARCHAR(500);

-- NOT NULL is enforced at the application layer for now (existing rows lack the data).
-- A follow-up migration can add NOT NULL after backfill.

CREATE INDEX IF NOT EXISTS idx_pros_phone   ON pros(phone);
CREATE INDEX IF NOT EXISTS idx_pros_status  ON pros(status);
CREATE INDEX IF NOT EXISTS idx_pros_city_id ON pros(city_id);

-- Prevent duplicate pending submissions for the same phone
CREATE UNIQUE INDEX IF NOT EXISTS uq_proreg_phone_pending
  ON pro_registration_requests ((payload_json->>'phone'))
  WHERE status = 'pending_approval';
```

- [ ] **Step 2: Apply locally**

Run: `cd backend && npx prisma migrate dev --name pro_registration_kyc`
Expected: migration applied, no errors.

- [ ] **Step 3: Verify schema**

Run: `psql $DATABASE_URL -c "\d pros"`
Expected output contains: `address_line1`, `state`, `city_id`, `aadhaar_last4`, `pan_number`, `id_proof_url`.

- [ ] **Step 4: Commit**

```bash
cd backend
git add prisma/migrations/20260427120000_pro_registration_kyc
git commit -m "feat(db): add address+KYC columns and pending-phone uniqueness for pro registration"
```

---

# Phase 2 — Backend Master Endpoints

### Task 2: `GET /v1/master/states`

**Files:**
- Modify: `backend/src/modules/master/master.repository.ts`
- Modify: `backend/src/modules/master/master.controller.ts`
- Modify: `backend/src/modules/master/master.routes.ts`
- Test: `backend/src/__tests__/master-states-cities.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/__tests__/master-states-cities.test.ts
import request from 'supertest';
import { app } from '../app';

describe('GET /v1/master/states', () => {
  it('returns distinct active states', async () => {
    const res = await request(app).get('/v1/master/states');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('name');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `cd backend && npx jest master-states-cities -i`
Expected: 404 from missing route.

- [ ] **Step 3: Add `listStates` to repository**

In `master.repository.ts` add:

```ts
export async function listStates(): Promise<{ name: string }[]> {
  const result = await pool.query<{ state: string }>(
    `SELECT DISTINCT state
       FROM cities
      WHERE is_active = true
      ORDER BY state ASC`,
  );
  return result.rows.map((r) => ({ name: r.state }));
}
```

- [ ] **Step 4: Add controller**

In `master.controller.ts`:

```ts
import { listStates } from './master.repository';

export async function listStatesController(_req: Request, res: Response) {
  const data = await listStates();
  res.json({ data });
}
```

- [ ] **Step 5: Wire route**

In `master.routes.ts`, add (mirroring the existing `/zones` registration around line 145):

```ts
router.get('/states', listStatesController);
```

- [ ] **Step 6: Run test, verify it passes**

Run: `cd backend && npx jest master-states-cities -i`
Expected: 1 passing.

- [ ] **Step 7: Commit**

```bash
git add src/modules/master src/__tests__/master-states-cities.test.ts
git commit -m "feat(master): GET /v1/master/states returns distinct active states"
```

### Task 3: `GET /v1/master/cities?state=`

**Files:**
- Modify: `backend/src/modules/master/master.repository.ts`
- Modify: `backend/src/modules/master/master.controller.ts`
- Modify: `backend/src/modules/master/master.routes.ts`
- Test: `backend/src/__tests__/master-states-cities.test.ts`

- [ ] **Step 1: Write the failing test (append)**

```ts
describe('GET /v1/master/cities', () => {
  it('400s when state is missing', async () => {
    const res = await request(app).get('/v1/master/cities');
    expect(res.status).toBe(400);
  });

  it('returns cities for the requested state', async () => {
    const states = (await request(app).get('/v1/master/states')).body.data;
    const stateName = states[0].name;
    const res = await request(app).get(`/v1/master/cities?state=${encodeURIComponent(stateName)}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((c: any) => c.state === stateName)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `cd backend && npx jest master-states-cities -i`
Expected: 404 on cities endpoint.

- [ ] **Step 3: Add `listCities`**

In `master.repository.ts`:

```ts
export async function listCities(state: string): Promise<{ id: string; name: string; state: string }[]> {
  const result = await pool.query<{ id: string; name: string; state: string }>(
    `SELECT id::text, name, state
       FROM cities
      WHERE is_active = true AND state = $1
      ORDER BY name ASC`,
    [state],
  );
  return result.rows;
}
```

- [ ] **Step 4: Controller + route**

`master.controller.ts`:

```ts
import { listCities } from './master.repository';

export async function listCitiesController(req: Request, res: Response) {
  const state = String(req.query.state ?? '').trim();
  if (!state) {
    return res.status(400).json({ error: { message: 'state query param is required' } });
  }
  const data = await listCities(state);
  res.json({ data });
}
```

`master.routes.ts`:

```ts
router.get('/cities', listCitiesController);
```

- [ ] **Step 5: Run tests**

Run: `cd backend && npx jest master-states-cities -i`
Expected: 3 passing.

- [ ] **Step 6: Commit**

```bash
git add src/modules/master src/__tests__/master-states-cities.test.ts
git commit -m "feat(master): GET /v1/master/cities?state= returns cities for a state"
```

### Task 4: Filter `machine_types` by `is_active`

**Files:**
- Modify: `backend/src/modules/master/master.repository.ts:566`
- Test: `backend/src/__tests__/master-states-cities.test.ts`

- [ ] **Step 1: Write the failing test (append)**

```ts
describe('GET /v1/master/machine-types', () => {
  it('returns only active machine types', async () => {
    const res = await request(app).get('/v1/master/machine-types');
    expect(res.status).toBe(200);
    expect(res.body.data.every((m: any) => m.is_active === true)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `cd backend && npx jest master-states-cities -i`
Expected: failure — current query returns inactive rows.

- [ ] **Step 3: Edit the SQL**

`master.repository.ts:566` — replace:

```ts
`SELECT id, name, is_active, created_at FROM machine_types ORDER BY name ASC`
```

with:

```ts
`SELECT id, name, is_active, created_at
   FROM machine_types
  WHERE is_active = true
  ORDER BY name ASC`
```

- [ ] **Step 4: Run test, verify it passes**

Run: `cd backend && npx jest master-states-cities -i`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add src/modules/master/master.repository.ts src/__tests__/master-states-cities.test.ts
git commit -m "fix(master): machine-types must filter by is_active=true"
```

---

# Phase 3 — Backend ID-proof Upload Endpoint

### Task 5: Multer config for ID proof

**Files:**
- Modify: `backend/src/middleware/upload.ts`

- [ ] **Step 1: Append a new multer config**

```ts
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const ID_PROOF_DIR = path.join(process.cwd(), 'uploads', 'id-proofs');
fs.mkdirSync(ID_PROOF_DIR, { recursive: true });

const idProofStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ID_PROOF_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const uploadIdProof = multer({
  storage: idProofStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPEG, PNG or PDF files are allowed'), ok);
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware/upload.ts
git commit -m "feat(upload): add ID-proof multer config (5MB; jpeg/png/pdf)"
```

### Task 6: `POST /v1/service/pros/upload-id-proof` (public)

**Files:**
- Modify: `backend/src/modules/service/service.controller.ts`
- Modify: `backend/src/modules/service/service.routes.ts`
- Test: `backend/src/__tests__/service-pro-upload.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/__tests__/service-pro-upload.test.ts
import request from 'supertest';
import path from 'path';
import { app } from '../app';

describe('POST /v1/service/pros/upload-id-proof', () => {
  it('uploads a JPEG and returns a URL', async () => {
    const res = await request(app)
      .post('/v1/service/pros/upload-id-proof')
      .attach('idProof', path.join(__dirname, 'fixtures', 'sample.jpg'));
    expect(res.status).toBe(200);
    expect(res.body.data.url).toMatch(/\/uploads\/id-proofs\/.+\.jpg$/i);
  });

  it('rejects unsupported types', async () => {
    const res = await request(app)
      .post('/v1/service/pros/upload-id-proof')
      .attach('idProof', path.join(__dirname, 'fixtures', 'sample.txt'));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Add fixtures**

Create `backend/src/__tests__/fixtures/sample.jpg` (any valid 1x1 jpeg) and `backend/src/__tests__/fixtures/sample.txt`.

Run: `cd backend && mkdir -p src/__tests__/fixtures && printf '\xFF\xD8\xFF\xD9' > src/__tests__/fixtures/sample.jpg && printf 'hello' > src/__tests__/fixtures/sample.txt`

- [ ] **Step 3: Run test, verify it fails**

Run: `cd backend && npx jest service-pro-upload -i`
Expected: 404 (route not registered).

- [ ] **Step 4: Add controller**

In `service.controller.ts`:

```ts
import { Request, Response } from 'express';

export async function uploadIdProofController(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: { message: 'idProof file is required' } });
  }
  const baseUrl = process.env.PUBLIC_BASE_URL ?? `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/id-proofs/${req.file.filename}`;
  res.json({ data: { url } });
}
```

- [ ] **Step 5: Wire route (PUBLIC, no auth)**

In `service.routes.ts`, near other `/pros` registrations (around line 113):

```ts
import { uploadIdProof } from '../../middleware/upload';
import { uploadIdProofController } from './service.controller';

router.post(
  '/pros/upload-id-proof',
  uploadIdProof.single('idProof'),
  uploadIdProofController,
);
```

- [ ] **Step 6: Run tests**

Run: `cd backend && npx jest service-pro-upload -i`
Expected: 2 passing.

- [ ] **Step 7: Commit**

```bash
git add src/modules/service src/__tests__/service-pro-upload.test.ts src/__tests__/fixtures
git commit -m "feat(service): public POST /pros/upload-id-proof for registration KYC"
```

---

# Phase 4 — Backend Register Schema & Approval Flow

### Task 7: Update `registerProSchema`

**Files:**
- Modify: `backend/src/modules/service/service.types.ts:17-30`

- [ ] **Step 1: Replace the schema**

```ts
import { z } from 'zod';

export const registerProSchema = z.object({
  fullName:           z.string().trim().min(2).max(80),
  phone:              z.string().regex(/^\d{10}$/, 'phone must be 10 digits'),
  email:              z.string().email().optional(),

  addressLine1:       z.string().trim().min(2).max(255),
  addressLine2:       z.string().trim().max(255).optional(),
  state:              z.string().trim().min(2).max(100),
  cityId:             z.string().regex(/^\d+$/, 'cityId must be a numeric id'),
  pincode:            z.string().regex(/^\d{6}$/, 'pincode must be 6 digits'),

  aadhaarLast4:       z.string().regex(/^\d{4}$/),
  panNumber:          z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/),
  idProofUrl:         z.string().url().min(5).max(500),

  bankAccountNumber:  z.string().regex(/^\d{9,18}$/),
  ifscCode:           z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),

  serviceTypeIds:     z.array(z.string().uuid()).min(1),
  zoneIds:            z.array(z.string().uuid()).min(1),
  machineTypes:       z.array(z.string().min(1)).min(1),
});

export type RegisterProDto = z.infer<typeof registerProSchema>;
```

`skillTags` is removed; skills are derived from `serviceTypeIds`.

- [ ] **Step 2: Type-check & commit**

Run: `cd backend && npx tsc --noEmit`
Expected: any consumers referencing `skillTags` surface here — fix them in Task 8/9.

```bash
git add src/modules/service/service.types.ts
git commit -m "refactor(service): registerProSchema adds address+KYC, drops skillTags"
```

### Task 8: `registerProRequest` repository — store full payload

**Files:**
- Modify: `backend/src/modules/service/service.repository.ts:38-44`

- [ ] **Step 1: Replace insert**

The existing `registerProRequest` already stores the full DTO in `payload_json`. Confirm the function signature is `RegisterProDto` (no separate columns to write). If it does anything with `skillTags`, remove that line.

- [ ] **Step 2: Add a unique-violation handler**

Wrap the INSERT in try/catch:

```ts
try {
  const result = await client.query<{ id: string }>(
    `INSERT INTO pro_registration_requests (payload_json, status)
     VALUES ($1, 'pending_approval') RETURNING id::text`,
    [payload],
  );
  return { id: result.rows[0].id };
} catch (err: any) {
  if (err.code === '23505') {
    const e: any = new Error('A registration with this phone is already pending approval.');
    e.statusCode = 409;
    throw e;
  }
  throw err;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/service/service.repository.ts
git commit -m "fix(service): handle duplicate pending-phone registration with 409"
```

### Task 9: `approveProRegistration` writes new columns + junctions + Razorpay

**Files:**
- Modify: `backend/src/modules/service/service.repository.ts:103-148`
- Test: `backend/src/__tests__/service-pro-approval.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/__tests__/service-pro-approval.test.ts
import { Pool } from 'pg';
import { approveProRegistration, registerProRequest } from '../modules/service/service.repository';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const validPayload = {
  fullName: 'Test Pro',
  phone: '9999900001',
  email: 'pro@test.dev',
  addressLine1: '1 Test St', state: 'Maharashtra', cityId: '1', pincode: '400001',
  aadhaarLast4: '1234', panNumber: 'ABCDE1234F', idProofUrl: 'http://x/y.jpg',
  bankAccountNumber: '123456789012', ifscCode: 'HDFC0001234',
  serviceTypeIds: ['<seed-uuid>'], zoneIds: ['<seed-uuid>'], machineTypes: ['Excavator'],
};

describe('approveProRegistration', () => {
  it('creates user, pro, junctions, and razorpay ids', async () => {
    const { id } = await registerProRequest(validPayload as any);
    const adminId = '<seed-admin-uuid>';
    await approveProRegistration(id, 'StrongPass1', adminId);

    const pro = (await pool.query(
      `SELECT * FROM pros WHERE phone = $1`, [validPayload.phone])).rows[0];
    expect(pro.registration_type).toBe('external');
    expect(pro.status).toBe('active');
    expect(pro.aadhaar_last4).toBe('1234');
    expect(pro.id_proof_url).toBe(validPayload.idProofUrl);
    expect(pro.razorpay_contact_id).toMatch(/^cont_/);
    expect(pro.razorpay_fund_account_id).toMatch(/^fa_/);

    const machines = await pool.query(
      `SELECT mt.name FROM pro_machine_types pmt
         JOIN machine_types mt ON mt.id = pmt.machine_type_id
        WHERE pmt.pro_id = $1`, [pro.id]);
    expect(machines.rows.map((r) => r.name)).toContain('Excavator');
  });
});
```

(Replace seed UUIDs with values from the test seed data; if your seeds don't include service-type/zone/admin rows, add them to the test setup.)

- [ ] **Step 2: Run test, verify it fails**

Run: `cd backend && npx jest service-pro-approval -i`
Expected: failure — new columns NULL, machine types not linked, no razorpay IDs.

- [ ] **Step 3: Rewrite `approveProRegistration`**

Replace the body so that, inside the existing transaction, after creating the user:

```ts
import { createRazorpayContact, createRazorpayFundAccount } from '../../utils/razorpay.helper';

// ...inside the tx, after user is created and roleId fetched:

const rpContact = await createRazorpayContact({
  name: payload.fullName,
  email: payload.email,
  contact: payload.phone,
});
const rpFa = await createRazorpayFundAccount({
  contactId: rpContact.id,
  accountNumber: payload.bankAccountNumber,
  ifsc: payload.ifscCode,
  name: payload.fullName,
});

const proInsert = await client.query<{ id: string }>(
  `INSERT INTO pros
     (user_id, name, phone, email, registration_type, status,
      address_line1, address_line2, state, city_id, pincode,
      aadhaar_last4, pan_number, id_proof_url,
      bank_account, razorpay_contact_id, razorpay_fund_account_id,
      approved_by, approved_at)
   VALUES ($1,$2,$3,$4,'external','active',
           $5,$6,$7,$8,$9,
           $10,$11,$12,
           $13,$14,$15,
           $16, NOW())
   RETURNING id::text`,
  [
    userId, payload.fullName, payload.phone, payload.email ?? null,
    payload.addressLine1, payload.addressLine2 ?? null, payload.state, payload.cityId, payload.pincode,
    payload.aadhaarLast4, payload.panNumber, payload.idProofUrl,
    JSON.stringify({
      accountNumber: payload.bankAccountNumber,
      ifsc: payload.ifscCode,
      holderName: payload.fullName,
    }),
    rpContact.id, rpFa.id,
    adminUserId,
  ],
);
const proId = proInsert.rows[0].id;

// junctions
for (const stId of payload.serviceTypeIds) {
  await client.query(
    `INSERT INTO pro_skills (pro_id, service_type_id) VALUES ($1, $2)`,
    [proId, stId],
  );
}
for (const zId of payload.zoneIds) {
  await client.query(
    `INSERT INTO pro_zones (pro_id, zone_id) VALUES ($1, $2)`,
    [proId, zId],
  );
}
for (const machineName of payload.machineTypes) {
  await client.query(
    `INSERT INTO pro_machine_types (pro_id, machine_type_id)
       SELECT $1, id FROM machine_types WHERE name = $2 AND is_active = true`,
    [proId, machineName],
  );
}

await client.query(
  `UPDATE pro_registration_requests
      SET status = 'active', reviewed_by = $1, reviewed_at = NOW()
    WHERE id = $2`,
  [adminUserId, registrationId],
);
```

The transaction guarantees that if Razorpay or any insert fails, nothing is persisted.

- [ ] **Step 4: Run test, verify it passes**

Run: `cd backend && npx jest service-pro-approval -i`
Expected: 1 passing.

- [ ] **Step 5: Commit**

```bash
git add src/modules/service/service.repository.ts src/__tests__/service-pro-approval.test.ts
git commit -m "feat(service): approval persists KYC+address+junctions and creates Razorpay payouts"
```

---

# Phase 5 — Frontend Constants, Validations, Queries

### Task 10: API endpoint constants

**Files:**
- Modify: `Service_Provide/src/utils/constants/api.constant.ts`

- [ ] **Step 1: Add endpoints**

```ts
export const API_ENDPOINTS = {
  // ...existing,
  MASTER: {
    ZONES: '/master/zones',
    SERVICE_TYPES: '/master/service-types',
    MACHINE_TYPES: '/master/machine-types',
    STATES: '/master/states',
    CITIES: '/master/cities',
  },
  PRO: {
    // ...existing,
    REGISTER:        '/service/pros/register',
    UPLOAD_ID_PROOF: '/service/pros/upload-id-proof',
  },
};
```

- [ ] **Step 2: Commit**

```bash
cd /Users/sarvadhisolution/Documents/Service_Provide
git add src/utils/constants/api.constant.ts
git commit -m "feat(api): constants for states, cities, machine-types, upload-id-proof"
```

### Task 11: Centralized Zod schema

**Files:**
- Modify: `Service_Provide/src/utils/validations/index.ts`

- [ ] **Step 1: Add `registerProSchema`**

```ts
import { z } from 'zod';

export const registerProSchema = z.object({
  fullName:           z.string().trim().min(2, 'Name is required').max(80),
  phone:              z.string().regex(/^\d{10}$/, 'Enter 10-digit phone'),
  email:              z.string().email('Invalid email').optional().or(z.literal('')),

  addressLine1:       z.string().trim().min(2, 'Address is required').max(255),
  addressLine2:       z.string().trim().max(255).optional().or(z.literal('')),
  state:              z.string().min(2, 'Select a state'),
  cityId:             z.string().regex(/^\d+$/, 'Select a city'),
  pincode:            z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),

  aadhaarLast4:       z.string().regex(/^\d{4}$/, 'Last 4 digits of Aadhaar'),
  panNumber:          z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN'),
  idProofUrl:         z.string().url('Upload an ID proof'),

  bankAccountNumber:  z.string().regex(/^\d{9,18}$/, 'Invalid account number'),
  ifscCode:           z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC'),

  serviceTypeIds:     z.array(z.string().uuid()).min(1, 'Pick at least one skill'),
  zoneIds:            z.array(z.string().uuid()).min(1, 'Pick at least one zone'),
  machineTypes:       z.array(z.string()).min(1, 'Pick at least one machine type'),
});

export type RegisterProFormValues = z.infer<typeof registerProSchema>;
```

- [ ] **Step 2: Build check & commit**

Run: `npm run build`
Expected: pass.

```bash
git add src/utils/validations/index.ts
git commit -m "feat(validation): centralized registerProSchema (Zod)"
```

### Task 12: Master query hooks

**Files:**
- Modify: `Service_Provide/src/services/master/master.query.ts`
- Modify: `Service_Provide/src/services/react-query/queryKeys.ts`

- [ ] **Step 1: Add query keys**

In `queryKeys.ts`:

```ts
export const queryKeys = {
  // ...existing
  master: {
    zones:        ['master', 'zones'] as const,
    serviceTypes: ['master', 'service-types'] as const,
    machineTypes: ['master', 'machine-types'] as const,
    states:       ['master', 'states'] as const,
    cities:       (state: string) => ['master', 'cities', state] as const,
  },
};
```

- [ ] **Step 2: Add hooks**

In `master.query.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api/apiService';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';
import { queryKeys } from '@/services/react-query/queryKeys';

export function useStates() {
  return useQuery({
    queryKey: queryKeys.master.states,
    queryFn: () => apiService.get<{ name: string }[]>(API_ENDPOINTS.MASTER.STATES),
    staleTime: 5 * 60_000,
  });
}

export function useCities(state: string | undefined) {
  return useQuery({
    queryKey: queryKeys.master.cities(state ?? ''),
    queryFn: () =>
      apiService.get<{ id: string; name: string; state: string }[]>(
        `${API_ENDPOINTS.MASTER.CITIES}?state=${encodeURIComponent(state!)}`,
      ),
    enabled: !!state,
    staleTime: 5 * 60_000,
  });
}

export function useMachineTypes() {
  return useQuery({
    queryKey: queryKeys.master.machineTypes,
    queryFn: () =>
      apiService.get<{ id: number; name: string; is_active: boolean }[]>(
        API_ENDPOINTS.MASTER.MACHINE_TYPES,
      ),
    staleTime: 5 * 60_000,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/services/master src/services/react-query/queryKeys.ts
git commit -m "feat(master-query): useStates, useCities, useMachineTypes hooks"
```

### Task 13: Upload mutation

**Files:**
- Create: `Service_Provide/src/services/pro/upload.query.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useMutation } from '@tanstack/react-query';
import { baseService } from '@/services/api/baseService';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';

type UploadResp = { data: { url: string } };

export function useUploadIdProof() {
  return useMutation({
    mutationFn: async (asset: { uri: string; name: string; type: string }) => {
      const form = new FormData();
      // RN FormData file shape
      form.append('idProof', {
        uri: asset.uri,
        name: asset.name,
        type: asset.type,
      } as unknown as Blob);
      const { data } = await baseService.post<UploadResp>(
        API_ENDPOINTS.PRO.UPLOAD_ID_PROOF,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data.data.url;
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/pro/upload.query.ts
git commit -m "feat(pro): useUploadIdProof mutation"
```

### Task 14: Fix `useRegisterPro` payload

**Files:**
- Modify: `Service_Provide/src/services/pro/pro.query.ts`

- [ ] **Step 1: Replace the mutation**

```ts
import type { RegisterProFormValues } from '@/utils/validations';

export function useRegisterPro() {
  return useMutation({
    mutationFn: (values: RegisterProFormValues) =>
      apiService.post<{ id: string }>(API_ENDPOINTS.PRO.REGISTER, {
        fullName:          values.fullName,
        phone:             values.phone,
        email:             values.email || undefined,
        addressLine1:      values.addressLine1,
        addressLine2:      values.addressLine2 || undefined,
        state:             values.state,
        cityId:            values.cityId,
        pincode:           values.pincode,
        aadhaarLast4:      values.aadhaarLast4,
        panNumber:         values.panNumber,
        idProofUrl:        values.idProofUrl,
        bankAccountNumber: values.bankAccountNumber,
        ifscCode:          values.ifscCode,
        serviceTypeIds:    values.serviceTypeIds,
        zoneIds:           values.zoneIds,
        machineTypes:      values.machineTypes,
      }),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/pro/pro.query.ts
git commit -m "fix(pro): useRegisterPro sends fullName + KYC + address (no skillTags)"
```

---

# Phase 6 — Frontend Wizard Screens

> Existing `RegisterScreen.tsx` collects all fields on a single screen with `useState`. We replace it with a 3-step wizard backed by a single `useForm({ resolver: zodResolver(registerProSchema) })` from react-hook-form. Per-step validation calls `trigger([...stepFields])` before allowing next.

### Task 15: Wizard host (`RegisterScreen.tsx`)

**Files:**
- Modify: `Service_Provide/src/screens/dribee/auth/RegisterScreen.tsx`

- [ ] **Step 1: Rewrite as a wizard host**

```tsx
import { useState } from 'react';
import { View } from 'react-native';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { registerProSchema, type RegisterProFormValues } from '@/utils/validations';
import { useUploadIdProof } from '@/services/pro/upload.query';
import { useRegisterPro } from '@/services/pro/pro.query';
import { getApiErrorMessage } from '@/utils/common-functions';

import { Step1Basic } from './register/Step1Basic';
import { Step2Services } from './register/Step2Services';
import { Step3KycAddress } from './register/Step3KycAddress';

const stepFields: Record<number, (keyof RegisterProFormValues)[]> = {
  1: ['fullName', 'phone', 'email'],
  2: ['serviceTypeIds', 'zoneIds', 'machineTypes'],
  3: [
    'addressLine1', 'addressLine2', 'state', 'cityId', 'pincode',
    'aadhaarLast4', 'panNumber', 'idProofUrl',
    'bankAccountNumber', 'ifscCode',
  ],
};

export function RegisterScreen() {
  const [step, setStep] = useState(1);
  const navigation = useNavigation<any>();
  const upload = useUploadIdProof();
  const register = useRegisterPro();

  const form = useForm<RegisterProFormValues>({
    resolver: zodResolver(registerProSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '', phone: '', email: '',
      addressLine1: '', addressLine2: '', state: '', cityId: '', pincode: '',
      aadhaarLast4: '', panNumber: '', idProofUrl: '',
      bankAccountNumber: '', ifscCode: '',
      serviceTypeIds: [], zoneIds: [], machineTypes: [],
    },
  });

  const next = async () => {
    const ok = await form.trigger(stepFields[step]);
    if (ok) setStep((s) => Math.min(3, s + 1));
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      await register.mutateAsync(values);
      Toast.show({ type: 'success', text1: 'Registration submitted' });
      navigation.reset({ index: 0, routes: [{ name: 'RegistrationSubmitted' as never }] });
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Registration failed') });
    }
  });

  return (
    <ScreenWrapper>
      <FormProvider {...form}>
        <View className="flex-1 px-4">
          {step === 1 && <Step1Basic />}
          {step === 2 && <Step2Services />}
          {step === 3 && <Step3KycAddress uploading={upload.isPending} />}
          <View className="flex-row gap-3 mt-4">
            {step > 1 && (
              <Button variant="secondary" className="flex-1" onPress={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button className="flex-1" onPress={next}>Next</Button>
            ) : (
              <Button
                className="flex-1"
                onPress={submit}
                loading={register.isPending}
                disabled={!form.watch('idProofUrl')}>
                Submit
              </Button>
            )}
          </View>
        </View>
      </FormProvider>
    </ScreenWrapper>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: errors only from the missing step files (created next).

### Task 16: Step 1 — Basic info

**Files:**
- Create: `Service_Provide/src/screens/dribee/auth/register/Step1Basic.tsx`

- [ ] **Step 1: Implement**

```tsx
import { View, Text } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import type { RegisterProFormValues } from '@/utils/validations';

export function Step1Basic() {
  const { control, formState: { errors } } = useFormContext<RegisterProFormValues>();
  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold">Step 1 of 3 · Basic info</Text>

      <Controller name="fullName" control={control} render={({ field }) => (
        <Input label="Full name" value={field.value} onChangeText={field.onChange}
               error={errors.fullName?.message} />
      )} />
      <Controller name="phone" control={control} render={({ field }) => (
        <Input label="Phone" keyboardType="number-pad" maxLength={10}
               value={field.value} onChangeText={field.onChange}
               error={errors.phone?.message} />
      )} />
      <Controller name="email" control={control} render={({ field }) => (
        <Input label="Email (optional)" autoCapitalize="none" keyboardType="email-address"
               value={field.value} onChangeText={field.onChange}
               error={errors.email?.message} />
      )} />
    </View>
  );
}
```

### Task 17: Step 2 — Services / Zones / Machines

**Files:**
- Create: `Service_Provide/src/screens/dribee/auth/register/Step2Services.tsx`
- Create: `Service_Provide/src/components/shared/ChipSelector.tsx`

- [ ] **Step 1: Create `ChipSelector`** (reusable multi-select)

```tsx
import { View, Text, Pressable } from 'react-native';
import { cn } from '@/lib/utils';

type Option = { id: string | number; name: string };

export function ChipSelector({
  options, value, onChange, label, error,
}: {
  options: Option[];
  value: (string | number)[];
  onChange: (next: (string | number)[]) => void;
  label: string;
  error?: string;
}) {
  const toggle = (id: string | number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => {
          const selected = value.includes(o.id);
          return (
            <Pressable key={String(o.id)} onPress={() => toggle(o.id)}
              className={cn(
                'px-3 py-2 rounded-full border',
                selected ? 'bg-primary-500 border-primary-500' : 'border-gray-300',
              )}>
              <Text className={cn(selected ? 'text-white' : 'text-gray-700')}>{o.name}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="text-red-500 text-xs">{error}</Text> : null}
    </View>
  );
}
```

- [ ] **Step 2: Implement Step 2**

```tsx
import { ScrollView, Text } from 'react-native';
import { useFormContext } from 'react-hook-form';
import type { RegisterProFormValues } from '@/utils/validations';
import { useServiceTypes, useZones, useMachineTypes } from '@/services/master/master.query';
import { ChipSelector } from '@/components/shared/ChipSelector';

export function Step2Services() {
  const { watch, setValue, formState: { errors } } = useFormContext<RegisterProFormValues>();
  const services = useServiceTypes();
  const zones = useZones();
  const machines = useMachineTypes();

  return (
    <ScrollView contentContainerClassName="gap-5 pb-4">
      <Text className="text-lg font-semibold">Step 2 of 3 · Skills & service area</Text>

      <ChipSelector
        label="Skills (service types)"
        options={(services.data ?? []).map((s: any) => ({ id: s.id, name: s.name }))}
        value={watch('serviceTypeIds')}
        onChange={(v) => setValue('serviceTypeIds', v as string[], { shouldValidate: true })}
        error={errors.serviceTypeIds?.message}
      />
      <ChipSelector
        label="Service zones"
        options={(zones.data ?? []).map((z: any) => ({ id: z.id, name: z.name }))}
        value={watch('zoneIds')}
        onChange={(v) => setValue('zoneIds', v as string[], { shouldValidate: true })}
        error={errors.zoneIds?.message}
      />
      <ChipSelector
        label="Machine types"
        options={(machines.data ?? []).map((m) => ({ id: m.name, name: m.name }))}
        value={watch('machineTypes')}
        onChange={(v) => setValue('machineTypes', v as string[], { shouldValidate: true })}
        error={errors.machineTypes?.message}
      />
    </ScrollView>
  );
}
```

### Task 18: Step 3 — Address, KYC, Bank

**Files:**
- Create: `Service_Provide/src/screens/dribee/auth/register/Step3KycAddress.tsx`

- [ ] **Step 1: Implement**

```tsx
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

import { Input } from '@/components/ui/Input';
import type { RegisterProFormValues } from '@/utils/validations';
import { useStates, useCities } from '@/services/master/master.query';
import { useUploadIdProof } from '@/services/pro/upload.query';
import { getApiErrorMessage } from '@/utils/common-functions';

export function Step3KycAddress({ uploading: _ }: { uploading: boolean }) {
  const { control, watch, setValue, formState: { errors } } = useFormContext<RegisterProFormValues>();
  const states = useStates();
  const cities = useCities(watch('state') || undefined);
  const upload = useUploadIdProof();

  const pickIdProof = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    try {
      const url = await upload.mutateAsync({
        uri: asset.uri,
        name: asset.fileName ?? 'id-proof.jpg',
        type: asset.type ?? 'image/jpeg',
      });
      setValue('idProofUrl', url, { shouldValidate: true });
      Toast.show({ type: 'success', text1: 'ID proof uploaded' });
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Upload failed') });
    }
  };

  return (
    <ScrollView contentContainerClassName="gap-4 pb-4">
      <Text className="text-lg font-semibold">Step 3 of 3 · Address, KYC & bank</Text>

      {/* Address */}
      <Controller name="addressLine1" control={control} render={({ field }) => (
        <Input label="Address line 1" value={field.value} onChangeText={field.onChange}
               error={errors.addressLine1?.message} />
      )} />
      <Controller name="addressLine2" control={control} render={({ field }) => (
        <Input label="Address line 2 (optional)" value={field.value ?? ''} onChangeText={field.onChange} />
      )} />

      {/* State picker (simple chip list) */}
      <Text className="text-sm font-medium">State</Text>
      <View className="flex-row flex-wrap gap-2">
        {(states.data ?? []).map((s: any) => (
          <Pressable key={s.name}
            onPress={() => { setValue('state', s.name, { shouldValidate: true }); setValue('cityId', '', { shouldValidate: false }); }}
            className={`px-3 py-2 rounded-full border ${watch('state') === s.name ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
            <Text className={watch('state') === s.name ? 'text-white' : 'text-gray-700'}>{s.name}</Text>
          </Pressable>
        ))}
      </View>
      {errors.state?.message ? <Text className="text-red-500 text-xs">{errors.state.message}</Text> : null}

      {/* City picker (depends on state) */}
      {watch('state') ? (
        <>
          <Text className="text-sm font-medium">City</Text>
          <View className="flex-row flex-wrap gap-2">
            {(cities.data ?? []).map((c: any) => (
              <Pressable key={c.id}
                onPress={() => setValue('cityId', String(c.id), { shouldValidate: true })}
                className={`px-3 py-2 rounded-full border ${watch('cityId') === String(c.id) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                <Text className={watch('cityId') === String(c.id) ? 'text-white' : 'text-gray-700'}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
          {errors.cityId?.message ? <Text className="text-red-500 text-xs">{errors.cityId.message}</Text> : null}
        </>
      ) : null}

      <Controller name="pincode" control={control} render={({ field }) => (
        <Input label="Pincode" keyboardType="number-pad" maxLength={6}
               value={field.value} onChangeText={field.onChange}
               error={errors.pincode?.message} />
      )} />

      {/* KYC */}
      <Controller name="aadhaarLast4" control={control} render={({ field }) => (
        <Input label="Aadhaar last 4 digits" keyboardType="number-pad" maxLength={4}
               value={field.value} onChangeText={field.onChange}
               error={errors.aadhaarLast4?.message} />
      )} />
      <Controller name="panNumber" control={control} render={({ field }) => (
        <Input label="PAN number" autoCapitalize="characters" maxLength={10}
               value={field.value} onChangeText={(t) => field.onChange(t.toUpperCase())}
               error={errors.panNumber?.message} />
      )} />

      {/* ID proof */}
      <View className="gap-2">
        <Text className="text-sm font-medium">ID proof image</Text>
        <Pressable onPress={pickIdProof}
          className="border border-gray-300 rounded-md py-3 items-center">
          <Text>{upload.isPending ? 'Uploading…' : (watch('idProofUrl') ? 'Change image' : 'Pick image')}</Text>
        </Pressable>
        {errors.idProofUrl?.message ? <Text className="text-red-500 text-xs">{errors.idProofUrl.message}</Text> : null}
      </View>

      {/* Bank */}
      <Controller name="bankAccountNumber" control={control} render={({ field }) => (
        <Input label="Bank account number" keyboardType="number-pad"
               value={field.value} onChangeText={field.onChange}
               error={errors.bankAccountNumber?.message} />
      )} />
      <Controller name="ifscCode" control={control} render={({ field }) => (
        <Input label="IFSC" autoCapitalize="characters" maxLength={11}
               value={field.value} onChangeText={(t) => field.onChange(t.toUpperCase())}
               error={errors.ifscCode?.message} />
      )} />
    </ScrollView>
  );
}
```

- [ ] **Step 2: Commit Phase 6**

```bash
git add src/screens/dribee/auth/RegisterScreen.tsx \
        src/screens/dribee/auth/register \
        src/components/shared/ChipSelector.tsx
git commit -m "feat(register): 3-step wizard for pro registration"
```

---

# Phase 7 — Post-submit Screen & Navigation

### Task 19: `RegistrationSubmittedScreen`

**Files:**
- Create: `Service_Provide/src/screens/dribee/auth/RegistrationSubmittedScreen.tsx`

- [ ] **Step 1: Implement**

```tsx
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2 } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';

export function RegistrationSubmittedScreen() {
  const navigation = useNavigation<any>();
  return (
    <ScreenWrapper>
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <CheckCircle2 size={64} color="#22c55e" strokeWidth={1.5} />
        <Text className="text-xl font-semibold text-center">Registration submitted</Text>
        <Text className="text-center text-gray-600">
          Our team will review your application and notify you once it's approved.
          You'll then be able to log in with the credentials provided to you.
        </Text>
        <Button onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>
          Back to login
        </Button>
      </View>
    </ScreenWrapper>
  );
}
```

### Task 20: AuthStack — register the screen, drop polling

**Files:**
- Modify: `Service_Provide/src/navigation/AuthStack.tsx`
- Modify: `Service_Provide/src/store/slices/proSlice.ts`
- Modify: `Service_Provide/src/screens/dribee/auth/PendingApprovalScreen.tsx` (delete or replace)

- [ ] **Step 1: Update AuthStack**

Replace the existing `PendingApproval` registration:

```tsx
import { RegistrationSubmittedScreen } from '@/screens/dribee/auth/RegistrationSubmittedScreen';

// inside the navigator:
<Stack.Screen name="RegistrationSubmitted" component={RegistrationSubmittedScreen} />
```

Remove any imports/screens for `PendingApprovalScreen` from `AuthStack`. If the screen file is unused everywhere, delete it.

- [ ] **Step 2: Strip mock state from `proSlice`**

Remove `pendingApproval` field, its setter, and the 30-second poll effect (whichever component used it). Anything that reads `proSlice.pendingApproval` must be updated; the new flow no longer maintains a "pending" state in Redux.

- [ ] **Step 3: Verify no `setAuthenticated(true)` after register**

Grep `RegisterScreen.tsx` and any post-submit code:

Run: `grep -rn 'setAuthenticated(true)' src/`
Expected: only matches inside `LoginScreen.tsx`. None inside the registration flow.

- [ ] **Step 4: Type-check & commit**

Run: `npm run build`
Expected: passes.

```bash
git add src/navigation/AuthStack.tsx \
        src/screens/dribee/auth/RegistrationSubmittedScreen.tsx \
        src/screens/dribee/auth/PendingApprovalScreen.tsx \
        src/store/slices/proSlice.ts
git commit -m "feat(auth): post-submit screen, drop pendingApproval mock + auto-login"
```

---

# Phase 8 — End-to-end Manual QA

### Task 21: Run the full flow on a device/simulator

- [ ] **Step 1: Backend up**

Run: `cd backend && npm run dev`
Expected: server listening; no startup errors.

- [ ] **Step 2: RN app on iOS or Android**

Run: `cd /Users/sarvadhisolution/Documents/Service_Provide && npm run ios` (or `npm run android`)

- [ ] **Step 3: Walk the wizard**

  1. Open Register from Login.
  2. Step 1: enter name + 10-digit phone + email. Tap Next.
  3. Step 2: pick at least one each of skills, zones, machines. Tap Next.
  4. Step 3: pick state → city, fill address + pincode, fill Aadhaar last 4 + PAN, pick an image (verify upload succeeds), enter bank details. Tap Submit.
  5. See "Registration submitted" screen. Tap "Back to login".

  Expected: Login screen does NOT log you in automatically. Trying to log in with new credentials should fail (admin hasn't approved).

- [ ] **Step 4: Admin approve via existing admin UI**

  Approve the new pending pro and supply a password. Verify in DB:

  Run: `psql $DATABASE_URL -c "SELECT id, name, status, registration_type, aadhaar_last4, city_id, razorpay_contact_id FROM pros ORDER BY created_at DESC LIMIT 1;"`
  Expected: row with `status='active'`, `registration_type='external'`, all KYC and Razorpay IDs populated.

- [ ] **Step 5: Log in as the new pro**

  Use the registered phone/email + admin-supplied password. Expected: login succeeds, lands on the Pro home tabs.

- [ ] **Step 6: Tag release**

```bash
cd /Users/sarvadhisolution/Documents/Service_Provide
git tag pro-registration-fix-v1
```

---

## Open verification items (carry-over from spec §10)

These are not blocking tasks but should be confirmed during Task 21:

- Razorpay rollback semantics: verified by inducing a Razorpay failure (e.g. invalid IFSC) and confirming the entire approval transaction rolls back.
- `users.phone` / `users.email` uniqueness behavior when admin approves a registration whose contact info already exists for a customer — note in CHANGELOG; if collisions are blocking, file a follow-up.
- Whether existing admin UI surfaces the new KYC fields — out of scope for this plan; file a follow-up if review finds gaps.
