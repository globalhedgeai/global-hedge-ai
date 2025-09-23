# Cursor import instructions (Arabic spec)
1) Create a `docs/` folder in your repo.
2) Add `SPEC_Global-Hedge-AI.md` to `docs/`.
3) Pin the spec in Cursor and use it as reference.
4) Ask Cursor to scaffold:
   - Next.js app in `apps/web` with i18n/RTL + PWA.
   - Prisma schema + migrations + seed (initial Admin).
   - RBAC middleware for `/api/admin/*` and AuditLog.
   - APIs & policies (deposit/withdraw/rewards/referrals) per spec.
5) Use PRs for iterative reviews.
