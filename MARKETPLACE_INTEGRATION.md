# Marketplace / Book Purchase Integration

This describes the backend API for buying books on the Gudina Tumsa digital library, so a
frontend can implement checkout, purchase status, and access to paid content. Copy this
file into the frontend repo for Claude (or anyone) to implement against.

## Auth

All authenticated endpoints expect `Authorization: Bearer <token>`. Tokens come from the
existing login endpoint (`POST /api/users/login`) — auth isn't part of this feature, just a
prerequisite for it.

Error responses look like:
```json
{ "status": "fail", "message": "human readable message" }
```
with the HTTP status code indicating the kind of error (400 bad input, 401 unauthenticated,
402 payment required / not purchased, 403 forbidden, 404 not found, 409 conflict e.g. already
purchased, 502 payment gateway failure).

## Book fields relevant to the marketplace

`GET /api/book` (list) and `GET /api/book/:id` (detail) both return book objects that now
include:

```ts
{
  // ...existing fields (title, author, coverImageUrl, description, etc.)
  price: number;        // in ETB, 0 if not for sale
  payable: boolean;     // true if this book must be purchased
  fileUrl: string | null;             // the actual book file (pdf/epub) — see gating below
  audioSummarizationUrl: string | null; // audio file — see gating below
}
```

**Important — content gating:** if `payable` is `true`, `fileUrl` and `audioSummarizationUrl`
will be `null` for anyone who hasn't purchased the book (or isn't its uploader). Don't treat a
null `fileUrl` as a data bug — it means "not entitled yet." Once purchased, `GET /api/book/:id`
(sent with the buyer's `Authorization` header) will return the real URLs.

Because of this, don't try to read/play a paid book directly from `fileUrl`/`audioSummarizationUrl`
in the general case — use the dedicated content endpoints below, which enforce the purchase
check themselves and work regardless of whether the raw URL was exposed:
- Reading a book: `GET /api/book/:id/pages` (requires `Authorization`; returns the full PDF/EPUB
  binary; response has header `X-Book-Format: pdf|epub`). Returns `402` if not purchased.
- Streaming audio: `GET /api/audio/stream/:fileName` (requires `Authorization`; supports HTTP
  Range requests for a normal `<audio>`/`<video>` element). Returns `402` if not purchased.
  `fileName` is the last path segment of `audioSummarizationUrl`.
- `GET /api/book/:id/metadata` and `POST /api/book/:id/download` also require `Authorization`
  and return `402` if the book is payable and not purchased.

Free (`payable: false`) books behave exactly as before — no purchase needed, just login.

## Purchase flow

### 1. Start a purchase
```
POST /api/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "<book id>",
  "method": "CHAPA" | "TELEBIRR" | "STARPAY" | "CASH" | "BANK_TRANSFER",
  "returnUrl": "https://your-frontend.example.com/purchase/complete"  // optional
}
```

- `returnUrl` is where the payment provider redirects the user's browser back to after they
  pay. If omitted, the backend falls back to its configured default frontend URL. Point this
  at a page in your app that can read the sale/payment status (step 3) and show a
  success/pending/failure state — the redirect itself does **not** guarantee payment succeeded.
- 400 if `bookId`/`method` invalid, 404 if book not found, 400 if the book isn't `payable`,
  409 if the user already purchased it.

Response (`201`):
```json
{
  "success": true,
  "message": "Purchase initiated",
  "data": {
    "saleId": "…",
    "paymentId": "…",
    "transactionRef": "…",
    "amountDue": 49.5,
    "checkoutUrl": "https://checkout.chapa.co/…"   // present for CHAPA/TELEBIRR/STARPAY only
  }
}
```

- **Online methods** (`CHAPA`, `TELEBIRR`, `STARPAY`): redirect the browser to `checkoutUrl`
  to complete payment. If the gateway can't be reached, this call fails with `502` instead of
  returning a URL — show an error and let the user retry.
- **Offline methods** (`CASH`, `BANK_TRANSFER`): no `checkoutUrl`. The sale stays pending until
  staff confirm payment out-of-band (there's no self-serve way to finalize these from the
  frontend — that's an admin action on the backend).

### 2. Payment happens on the provider's site
The user completes payment on the gateway's hosted checkout page, then is redirected to
`returnUrl`.

### 3. Confirm purchase status
The actual confirmation happens asynchronously via a server-to-server webhook the gateway
calls — **do not assume the purchase is done just because the user landed back on
`returnUrl`.** On the return page, poll or check once:

```
GET /api/sales/has/:bookId
Authorization: Bearer <token>
```
```json
{ "success": true, "data": { "purchased": true } }
```

or fetch the specific sale for more detail:
```
GET /api/sales/:saleId
Authorization: Bearer <token>
```
returns `{ success, data: { sale } }` where `sale.finalized` is the thing to check
(`true` = paid and unlocked, `false` = still pending). If it's still `false` shortly after
redirect, poll every few seconds for a short window (webhooks are usually fast but not
instant) before showing a "payment pending" state.

### 4. Access the content
Once `finalized: true`, `GET /api/book/:id` will include the real `fileUrl`/
`audioSummarizationUrl`, and `/pages`, `/metadata`, `/download`, and the audio stream endpoint
all become accessible for that user.

## Other endpoints

```
GET /api/sales/my              # Authorization required — the current user's completed purchases
                                # { data: { sales: [{ ...sale, book: {title, author, coverImageUrl, price}, payment }] } }

GET /api/sales/admin/all       # admin — filters: status=pending|completed|refunded, userId, bookId, from, to, page, limit
GET /api/sales/admin/summary   # admin — totals, revenue, top-selling books
PATCH /api/sales/admin/:id/refund    # admin — marks a finalized sale as refunded
PATCH /api/sales/admin/:id/finalize  # admin — manually completes a CASH/BANK_TRANSFER sale
```

("admin" here just means `Authorization` is required — there's no real role check enforced
yet on the backend, so don't rely on these being hidden from non-admins if you expose them in
a UI; gate them client-side for now.)

## Payment method values

`"CHAPA" | "TELEBIRR" | "STARPAY" | "CASH" | "BANK_TRANSFER"` — present these as the checkout
options. All amounts are in ETB (Ethiopian Birr).

## Known caveats

- Gateway sandbox/production credentials may not be configured on the backend yet — if
  `POST /api/sales` returns a `502`, that's a backend config issue, not something to fix in
  the frontend.
- There's no cancel/retry-specific endpoint — starting a new `POST /api/sales` for the same
  book while a previous one is still pending is allowed (it doesn't overwrite the old pending
  sale), so avoid letting users spam the buy button without a loading/disabled state.
