# Quizy

A full-featured online quiz and assessment platform built with Next.js (App
Router), TypeScript, Prisma (MongoDB), and NextAuth. Quizy provides an admin
dashboard to create tests, manage trainees, assign tests, and send credentials
by email. Trainees can take tests (MCQ and text), and results are recorded and
scored.

Live demo: https://quizy-rho.vercel.app/

---

## Quick demo credentials

Use the following admin credentials on a fresh demo deployment (if available):

- Username: `quizadmin@yopmail.com`
- Password: `quizadmin@yopmail.com`

---

## Highlights / Features

- Admin dashboard to manage positions, groups, questions, tests and trainees
- Create tests composed from question groups and set durations/dates
- Assign tests to trainees and send login credentials via email
- Support for MCQ and free-text questions; MCQ auto-scoring, text answers for
  manual scoring
- Test sessions with start/submit flow and per-session scoring
- Role-based users (ADMIN, USER, TEST)
- Authentication handled by `next-auth` (email, OAuth providers) and optional
  WebAuthn support
- Email delivery via Nodemailer (Gmail) for sending credentials and
  notifications
- Built using modern React + Tailwind + Radix UI components with accessible
  primitives

## Tech stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Prisma 6 (MongoDB provider) — schema at `prisma/schema.prisma`
- Authentication: `next-auth`
- Validation: `zod`
- UI: Tailwind CSS, Radix UI components, custom primitives in
  `src/components/ui`
- State & forms: `react-hook-form`
- Notifications: `sonner` / `react-hot-toast`

See `package.json` for full dependency list.

## Repo structure (important paths)

- `src/app` - Next.js App Router pages and API routes
- `src/components` - Reusable UI components and auth forms
- `src/lib` - Utilities: `db.ts`, `auth.ts`, `mail.ts`, `envs.ts`, etc.
- `prisma/schema.prisma` - Prisma schema (MongoDB models)
- `public` - Static assets

## Pages & Features (route -> what it does)

Below is a concise map of the main App Router pages and what feature each
provides. Use this to find where UI/logic lives when making changes.

- `/(home)/page` — Public home page; shows available tests and public info.
- `/(home)/auth/login/page` — Login page (email/password + OAuth via NextAuth
  where configured).
- `/(home)/auth/register/page` — Registration page (creates account and sends
  verification email).
- `/(home)/auth/forget-password/page` — Forgot password form (requests password
  reset link).
- `/(home)/auth/reset-password/page` — Reset password page (set new password
  using token from email).
- `/(home)/verify-email/page` — Email verification landing page (token-based
  verification).
- `/test/[id]/page` — Test detail / test-taking flow for assigned trainees
  (starts a session, shows questions).

- `/(dashboard)/dashboard/page` — Admin dashboard overview (requires ADMIN
  role).
- `/(dashboard)/dashboard/quiz/page` — Quiz/Test management (create/edit tests,
  add groups).
- `/(dashboard)/dashboard/test/page` — Tests listing and assigned test overview.
- `/(dashboard)/dashboard/review-test/[id]/page` — Review & score a trainee's
  submitted answers (manual scoring and status update).
- `/(dashboard)/dashboard/trainee/page` — Trainee management (create trainees,
  list users, assign roles).

Note: most of the admin actions call internal API routes under
`src/app/api/admin/*` which contain the server-side logic and triggers (see
Emails & Triggers section).

## Environment variables

The application validates the environment variables in `src/lib/envs.ts`. The
following variables are required:

- `NODE_ENV` (development|production|test)
- `NEXT_PUBLIC_BASE_URL` - Public base URL for the app (e.g.,
  `http://localhost:3000`)
- `DATABASE_URL` - MongoDB connection string (Prisma expects a MongoDB URL)
- `NEXTAUTH_SECRET` - Secret used by `next-auth`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - (Optional) Google OAuth
  credentials
- `GMAIL_EMAIL` - Gmail address used by Nodemailer (if using Gmail)
- `GMAIL_PASSWORD` - App password for the Gmail account
- `NODEMAILER_FROM` - Sender address used in outgoing emails

## Emails & Triggers

This application uses Nodemailer via `src/lib/mail.ts` and HTML templates in
`src/lib/email-template-generator.ts`. The following emails are implemented and
the places that trigger them are listed here.

- Verification email
  - Template: `generateVerificationEmail(actionLink)`
  - Triggered from: `src/actions/register.ts` (user self-registration); also
    re-sent when an unverified user attempts to register again.
  - When/why: Sent after successful registration to verify the user's email.

- Password reset email
  - Template: `generatePasswordResetEmail(actionLink)`
  - Triggered from: `src/app/api/forgot-password/route.ts` (POST)
  - When/why: Sent when a user requests a password reset via the forgot password
    form. The email contains a tokenized link (expires via token generation
    logic).

- Welcome email
  - Template: `generateWelcomeEmail(username, email)`
  - Triggered from: `src/app/api/admin/create-trainee/route.ts` and
    `src/app/api/admin/send-trainee-email/route.ts` (admin-created trainees or
    explicit send-welcome action)
  - When/why: Sent when an admin creates a trainee account or manually sends a
    trainee email; it contains login guidance and links to login/reset.

- Test assignment email
  - Template: `generateTestAssignmentEmail(...)`
  - Triggered from: `src/app/api/admin/test/route.ts` when creating a test with
    assigned users (the API will create AssignedTest rows and then send
    assignment emails). Also triggered implicitly when creating an AssignedTest
    via other admin flows that call the same API.
  - When/why: Sent to trainees who are assigned to a test; includes test details
    and link to the test page.

- Decision/result email
  - Template: `generateDecisionEmail(...)`
  - Triggered from: `src/app/api/admin/update-assigned-test/route.ts` when an
    admin updates an assigned test's status to `accepted`, `rejected`, or
    `pending`.
  - When/why: Notifies candidate of the decision after manual review.

Implementation notes:

- Mail transport: `src/lib/mail.ts` uses Gmail service with `GMAIL_EMAIL` and
  `GMAIL_PASSWORD` from env. If you want to use a different provider (SendGrid,
  Mailgun, SES), replace the transporter creation in that file.
- Template generation: All HTML templates live in
  `src/lib/email-template-generator.ts`.
- Bulk send: `sendEmailViaNodemailerMany` is used for batch assignment emails
  (sends one email with multiple recipients).

Security note: always use an app password for the Gmail account (or a dedicated
transactional email provider) and never commit `.env`.

Create a `.env` file (copy `.env.example` or create from scratch) and populate
these values before running the app.

### Notes on `DATABASE_URL`

Use a MongoDB Atlas connection string or another MongoDB provider. Example:

```
DATABASE_URL="mongodb+srv://<user>:<password>@cluster0.mongodb.net/mydb?retryWrites=true&w=majority"
```

## Local development

1. Install dependencies

```bash
npm install
```

2. Create and populate `.env` with the variables above.

3. Start the dev server (this runs `prisma generate` first):

```bash
npm run dev
```

The app will be available at `http://localhost:3000` by default.

## Prisma

This project uses Prisma with the MongoDB provider. The Prisma client is
generated automatically by the project's `dev` and `build` scripts (they run
`npx prisma generate` first).

If you make schema changes, run:

```bash
npx prisma generate
```

Note: MongoDB does not use SQL migrations the same way relational DBs do. Handle
migrations / schema changes according to Prisma's MongoDB docs.

## Scripts

- `npm run dev` — runs `npx prisma generate && next dev`
- `npm run build` — runs `npx prisma generate && next build`
- `npm run start` — runs `next start`
- `npm run format` — formats code with Prettier
- `npm run lint` / `npm run lint:fix` — runs ESLint
- `npm run type-check` — runs TypeScript build check

## Deployment

Recommended: Vercel (Next.js first-class support). When deploying, set the same
environment variables in your Vercel project settings. For production, ensure
`DATABASE_URL` points to a production MongoDB instance and `NEXTAUTH_SECRET` is
a strong secret.

## Contributing

- This repository includes Husky and Commitizen for consistent commit messages.
  Run `npm run prepare` to enable Husky hooks locally.
- Follow the existing code patterns in `src/components` and `src/app` (App
  Router).

## Admin notes / operations

- Admin can create `Position`, `Group`, `Question`, and `Test` entities from the
  dashboard.
- `AssignedTest` entities are used to allocate tests to trainees. When an
  assigned test is created, the app generates a login token and can send
  credentials via email (see `src/lib/mail.ts`).

## Security & privacy

- Never commit `.env` files or secrets to the repository.
- Use application-level access controls; the app expects role-based checks for
  admin features.

## Troubleshooting

- If Prisma client complains, run `npx prisma generate`.
- If emails fail, verify `GMAIL_EMAIL`, `GMAIL_PASSWORD` (use an App Password
  for Gmail), and `NODEMAILER_FROM` values.
