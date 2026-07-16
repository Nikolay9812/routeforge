# RF-PROD-003 GDPR / DSGVO Review

Date: 2026-07-16

This review records the production-prep privacy checks for RouteForge. It is an engineering review of the implemented product controls, not legal advice.

## Reviewed Surfaces

- Admin dashboard, shift review, document upload, exports, settings and audit logs.
- Mobile settings, profile, mailbox, history, daily reports, shift start/stop and PDF downloads.
- InsForge migrations for RLS, storage policies, shift writes, document uploads, signature access, photo retention and audit logging.

## Findings

- Data minimization: admin dashboard, shift list/detail, export and document overview loaders now avoid selecting Steuer-ID, IBAN and private profile document references unless the feature explicitly needs those fields.
- Location transparency: the mobile settings privacy note states that RouteForge stores location only at shift start and shift end and does not use live tracking.
- Private documents: document, payslip, generated PDF, signature and company stamp access remains private through scoped storage paths, authenticated downloads, scoped RPCs or server routes.
- Shift photo retention: `cleanup_expired_shift_photos(...)` deletes only expired `shift-photos` storage files, marks metadata with `deleted_at` and is not executable by regular authenticated clients.
- Auditability: approval, correction, billable override, document upload, depot access, invitation and accountant export actions have audit-log paths.
- Auth/signup: public signup and email-verification project settings were not changed in this review because invite registration must remain compatible with InsForge Auth. This remains a deployment-readiness decision.

## Follow-Up For Deployment Readiness

- Decide whether global InsForge Auth public signup can be tightened without breaking invite-code registration and email verification.
- Add an operator schedule for `cleanup_expired_shift_photos(...)` if the production InsForge environment does not already run it.
- Keep future subject-access/export/delete workflows behind a separate reviewed feature rather than improvising them inside operational screens.
