# Design References

This folder contains approved visual references for RouteForge UI.

Screenshots are the **visual source of truth** for layout direction, spacing rhythm, hierarchy, component density and overall product feel.

Codex must use these references before building any UI feature.

---

## Core Rule

Do **not** copy screenshots pixel-perfect.

Use them to follow the visual direction:

- white cards
- blue primary actions
- rounded UI
- German labels by default
- high readability
- clean operational layout
- calm spacing
- professional courier operations feel

Mobile and admin do not share components, but they must feel like one product family.

---

## Required Workflow for UI Features

Before implementing any UI feature, Codex must:

1. Read the current Feature ID in `context/build-plan.md`
2. Check the relevant screenshot in this folder
3. Read `context/ui-tokens.md`
4. Read `context/ui-rules.md`
5. Read either `context/mobile-rules.md` or `context/admin-rules.md`
6. Check `context/ui-registry.md` for an existing matching pattern
7. Reuse existing patterns before creating new ones

After creating or changing a reusable UI pattern, Codex must update:

```txt
context/ui-registry.md
```

This update is mandatory for new cards, buttons, badges, forms, dialogs, tables, navigation patterns, status states or screen-level layouts.

---

## Mobile Screenshots

Expected mobile reference names:

```txt
context/designs/mobile/mobile-home-current-shift.png
context/designs/mobile/mobile-history-calendar.png
context/designs/mobile/mobile-profile-mailbox-signature.png
context/designs/mobile/mobile-daily-report.png
context/designs/mobile/mobile-day-details.png
context/designs/mobile/mobile-digital-mailbox.png
context/designs/mobile/mobile-profile-documents.png
```

Use mobile screenshots for:

- Expo React Native screens
- courier app navigation
- current shift UI
- report form UI
- history calendar
- mailbox
- profile and documents
- mobile empty/loading/error states

---

## Admin Screenshots

Expected admin reference names:

```txt
context/designs/admin/admin-dashboard.png
context/designs/admin/admin-shift-review.png
context/designs/admin/admin-couriers-list.png
context/designs/admin/admin-courier-profile.png
context/designs/admin/admin-documents-upload.png
```

Use admin screenshots for:

- Next.js admin panel screens
- dashboard metrics
- shift review workflow
- courier management
- document upload
- tables, filters and admin action panels

---

## If Screenshots Are Missing

If a referenced image is not present yet:

- Do not invent images
- Do not create placeholder image files
- Do not block implementation only because screenshots are missing
- Use `context/ui-tokens.md`, `context/ui-rules.md`, `context/mobile-rules.md`, `context/admin-rules.md` and `context/ui-registry.md` as the fallback source of truth
- Keep the same visual direction: white cards, blue actions, rounded UI, German labels and clean operational layout

---

## Product Family Rule

The mobile courier app and the admin panel must look related:

```txt
same blue primary color
same status color logic
same rounded-card language
same calm spacing
same readable typography
same German-first labels
same operational seriousness
```

Do not let mobile become playful while admin becomes corporate. RouteForge is practical, clean and trustworthy.
