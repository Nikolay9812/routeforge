# RouteForge Memory

## Locked Decisions

- Product name: RouteForge
- Multi-tenant platform
- Companies use RouteForge under their own company name
- First example company: Ivanov Transport
- Roles: admin, dispatcher, courier
- Courier registration requires approval
- One shift per courier per day
- Languages: German and Bulgarian
- Mobile app: Expo
- Admin panel: Next.js
- Backend/database/storage/auth: InsForge
- Development method: UI-first

## Payroll Rules

### Hourly courier
- Real time is tracked.
- Legal break is calculated automatically.
- Timer auto-stops at 10:00 hours.
- Billable time max is 10:00 hours.

### Daily fixed courier
- Real time is tracked.
- Default billable time is 8:20 hours.
- Admin/dispatcher can manually override billable time.
- Every override requires a reason.

## Current Stage

Phase 1: Foundation
Goal: project skeleton, context files, shared types, payroll logic, mock UI plan.