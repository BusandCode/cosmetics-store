# Cosmetics Store

Ecommerce app for cosmetics/personal care (deodorants, perfumes, costumes, etc).
Payment v1: manual bank transfer + admin confirmation. Paystack can be added
later by switching `ACTIVE_PAYMENT_METHOD` in `src/lib/payment-config.ts` —
the order/schema flow doesn't change.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Pages implemented so far

- `/` — homepage, product grid grouped by category
- `/products/[slug]` — product detail with variant picker (buttons are placeholders — cart not wired yet)
- `/orders/[id]` — checkout confirmation, bank details + reference
- `/admin/orders` — admin queue to confirm manual payments

## Flow implemented so far

- `POST /api/orders` — creates order + payment record from cart items, generates a transfer reference, decrements nothing yet (add stock decrement inside the same transaction once you wire cart → checkout UI)
- `GET /orders/[id]` — customer-facing page showing bank details + reference + "I've made the transfer" button
- `POST /api/orders/[id]/mark-paid` — customer confirms they've sent the transfer (order → AWAITING_CONFIRMATION, NOT paid yet)
- `GET /admin/orders` — admin queue of orders awaiting confirmation
- `POST /api/admin/orders/[id]/confirm` — admin confirms against their bank alert (order → PAID)

## Not built yet (next steps)

- Auth (NextAuth wiring — schema has `User`/`Role` ready)
- Product listing/detail pages + categories
- Cart (client state)
- Stock decrement on order creation (should happen in the same DB transaction as order creation)
- Admin product CRUD
- Admin auth guard on `/admin/*` routes (currently unprotected — do this before deploying)
