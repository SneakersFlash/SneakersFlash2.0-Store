# ONE MORE THING — spin-to-win landing page (handoff for Claude Code)

Campaign page on sneakersflash.com. Marketplace buyers (Shopee, Tokopedia, TikTok Shop, Blibli) find a folded card in their package with a **QR** and a **sticker holding a unique code**. The QR opens this page; they sign in with Google, activate the code, and spin a wheel for one reward to use on their next sneakersflash.com order.

- **QR = static URL** that opens the page: `https://sneakersflash.com/one-more-thing` (confirm the final slug).
- **Unique code = the spin entitlement.** One code = one spin. Never treat the QR itself as the entitlement.

---

## 0. Files in this folder

| File | What it is |
|---|---|
| `design/reference.dc.html` | **Visual source of truth.** Full markup, inline styles, CSS keyframes and the demo interaction logic. Port it, don't redesign it. |
| `assets/sf-logo.png` | SNKRS FLASH logo, 800×378, transparent PNG. Do not recolor, outline or put it on yellow. |
| `HANDOFF.md` | This spec. |

### How to read `reference.dc.html`
It is written for a design-canvas runtime, not for production. To translate it:
- `{{name}}` reads a value returned by `renderVals()` in the `<script type="text/x-dc">` block at the bottom.
- `<sc-if value="{{x}}">…</sc-if>` is a conditional render. `<sc-for list="{{items}}" as="item">…</sc-for>` is a `.map()`.
- `onClick="{{fn}}"` is the event handler of the same name in `renderVals()`.
- The `<helmet><style>` block holds every `@keyframes` and hover rule. Move it into a CSS module or global stylesheet.
- The `previewState` prop and the `Math.random()` prize pick are **demo only**. In production the server decides the reward (see §3).
- Ignore `./support.js` and the `<x-dc>` wrapper.

---

## 1. Design rules (keep exactly)

- **Font:** Plus Jakarta Sans 400/500/600/700 (Google Fonts). Use tabular numerals.
- **Colors:**
  - Page `#f5f5f3`, cards `#ffffff`, soft fills `#efefec`.
  - Ink `#111213`, muted text `#4f4f4a`, subtle text `#6b6b66`.
  - Yellow `#f6e70a` (pressed edge `#d4c600`), orange `#faa61a`.
  - Success `#e8f5ec` / `#0a5a2b`. Danger `#fdecec` / `#931212` / `#d94141`.
- **One yellow primary button per state.** Buttons are at least 48px tall; primary buttons are 64px.
- **3D is pure CSS:** `transform-style: preserve-3d`, `perspective`, and stacked layers for thickness. **No Three.js / WebGL.** Target buyers are on mid-range Android over mobile data.
- **Reduced motion:** every animated element carries `.sf-anim`. Honor `prefers-reduced-motion: reduce` by switching animations off (see the `@media` rule in the reference).
- **Responsive:**
  - Fluid layout with a 1120px max container.
  - The hero splits into 2 columns on desktop and stacks on phones.
  - **Mobile (390px) is the primary viewport**, because traffic comes from a QR scan.
  - Hero objects must never sit behind text. Keep them where the reference puts them.

### Sections (top → bottom)
1. **Header:** logo (38px tall) + "Ke toko" pill.
2. **Hero:**
   - The background is a 3D world: floating coins, a gift box and a yellow cube. It tilts with the mouse on desktop and with `deviceorientation` on mobile.
   - Left column: a 3D logo plaque, the headline, the subtitle and 3 checkmark points.
   - Right column: the wheel card.
3. **Wheel card:**
   - The 3D wheel has 12-layer thickness, 20 chase bulbs, a ticking pointer and a podium with a pulse ring.
   - Below the wheel is the action panel, which changes with state (§2).
   - After the spin, it shows the result with a spinning 3D medal and confetti.
4. **"Cara dapat hadiahnya":** 3 tilted 3D slabs with extruded numerals.
5. **"Ada 5 jenis reward":** a simple grid of 5 cards. Each card pops in on scroll, its icon bobs, and it lifts on hover. **Do not turn this into a carousel.**
6. **"Syarat dan ketentuan":** 7 numbered items.
7. **Closing band:** dark background, floating 3D objects, and a "Kembali ke roda" anchor that scrolls to `#roda`.
8. **Footer.**

### Wheel slot order (must match the conic-gradient colors in the reference)
8 slots, 5 reward types; some types repeat.

| Slot | Reward key | Segment color |
|---|---|---|
| 0 | `FP_50K` | yellow |
| 1 | `SOCKS` | light |
| 2 | `FP_100K` | ink |
| 3 | `DOUBLE_BOX` | light |
| 4 | `FP_150K` | yellow |
| 5 | `SOCKS` | light |
| 6 | `FP_50K` | ink |
| 7 | `DOUBLE_BOX` | light |

Keep this mapping in **one shared constant**, used by both the backend (to choose a slot) and the frontend (to render).

### Spin animation (copy from the reference)
1. **Wind-up:** rotate −20° over 400ms.
2. **Spin:** 6 full turns to the target slot center in 5.4s, `cubic-bezier(0.1, 0.75, 0.1, 1)`.
3. **Pointer tick:** rate steps down 0.08s → 0.14s → 0.26s → 0.5s.
4. **Win:** the bulbs flash, the winning wedge glows, 44 confetti pieces fall in 3D, and the result card flips in.

Target rotation: `target = wind - (wind mod 360) + 360*6 + (360 - (slot*45 + 22.5))`.

---

## 2. Action panel states and exact copy

Copy is final, from the "COPY REVISION / 19 NOV 2026" PDF. Use it **verbatim**, including uppercase and punctuation.

| State | Shown when | UI |
|---|---|---|
| `guest` | not signed in | Chance row: title **"Kesempatan dari kode unik"**, note **"Masuk dengan Google, lalu aktifkan kode unik"**, value **"1x"**.<br>Yellow button: **"Masuk dengan Google"**.<br>Line: **"Belum punya akun?"** + link **"Daftar dengan Google"**.<br>Info box: **"Baru pertama kali daftar? Dapatkan voucher Rp100.000 untuk pengguna baru. Syarat dan ketentuan berlaku."** |
| `enter_code` | signed in, no active code | Label **"Masukkan kode unik"**. Input placeholder **"Kode dari stiker di kartu"**; it uppercases input.<br>Yellow button **"Aktifkan kode"**, disabled while the input is empty.<br>Line: "Sudah masuk dengan Google." + link "Ganti akun". |
| `code_invalid` | activate returns invalid | Red alert under the input: **"Kode tidak valid. Periksa kembali kode pada stiker di kartu."** |
| `code_used` | activate returns already used | Red alert: **"Kode ini sudah digunakan. Satu kode hanya berlaku untuk satu kali spin."** |
| `ready` | code reserved for this user | Green row "Kode aktif" + the code.<br>Yellow button **"SPIN NOW"**, labelled "Spinning…" while spinning. |
| `result_fp` | reward is Flash Point | Pill "Sukses", heading **"REWARD UNLOCKED!"**, then **"Kamu dapat Flash Point senilai [NOMINAL]. Gunakan saat pembelian berikutnya di website sesuai ketentuan."** `[NOMINAL]` comes from the actual reward, e.g. "Rp 100.000".<br>Yellow link "Belanja di sneakersflash.com".<br>Secondary button "Aktifkan kode lain" goes back to `enter_code`. |
| `result_physical` | reward is socks or double box | Same layout with **"Kamu dapat [kaos kaki/double box]. Klaim bersama pesanan website berikutnya sesuai ketentuan."** |

The chip at the top-right of the wheel card reads "Belum masuk", "Sudah masuk", "Kode aktif" or "Reward unlocked".

Every other string on the page (hero, steps, reward cards, terms, closing) is already final in `reference.dc.html`. Copy it from there.

**Copy rules from the PDF. Do not break them:**
- Never say a physical reward is shipped automatically or credited automatically.
- Never say 1 QR = 1 spin.
- Never show Tebus sneakers or Goodie bag. Both have been removed.
- Never present the Rp100K new-user voucher as a spin reward.

---

## 3. Backend (NestJS + Prisma + Postgres + Redis)

**Look at the existing code first and follow its conventions:**
- the auth module (is there Google OAuth already?)
- the user model
- any points / loyalty / voucher module
- the module, controller, service and DTO structure
- the test patterns

Reuse what exists and only add what's missing. **If Google login or a points ledger doesn't exist yet, stop and say so before building one.**

### 3.1 Data model (adapt names to repo conventions)

- **`SpinCampaign`:** `id`, `slug` ("one-more-thing"), `startsAt`, `endsAt`, `isActive`.
- **`SpinCode`:**
  - Fields: `id`, `code` (unique, stored uppercase), `campaignId`, `batch`, `status` (`UNUSED | RESERVED | REDEEMED | VOID`), `reservedByUserId?`, `reservedUntil?`, `redeemedByUserId?`, `redeemedAt?`, `createdAt`.
  - Codes are 8 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no 0/O/1/I), which gives about 1.1e12 combinations.
- **`SpinReward`:**
  - Fields: `id`, `campaignId`, `key` (`FP_50K | FP_100K | FP_150K | SOCKS | DOUBLE_BOX`), `type` (`FLASH_POINT | PHYSICAL`), `pointValue?`, `weight`, `stockTotal?`, `stockUsed`, `weeklyCap?`.
  - **Weights and stock are config. Don't hardcode odds** (they're still pending, see §5).
- **`SpinResult`:** `id`, `codeId` (unique), `userId`, `rewardId`, `slotIndex`, `claimStatus` (`UNCLAIMED | CLAIMED`), `claimedOrderId?`, `createdAt`.

### 3.2 Endpoints (all require an authenticated user, except the campaign info endpoint)

- **`GET /spin/campaign/one-more-thing`:**
  - Public. Returns whether the campaign is active.
  - Also returns the slot map and the reward list, used for display only.
- **`POST /spin/codes/activate { code }`:**
  - Trim and uppercase the code.
  - Unknown or VOID, or the campaign is inactive → `404 { error: "CODE_INVALID" }`.
  - REDEEMED, or RESERVED by another user and not expired → `409 { error: "CODE_USED" }`.
  - Otherwise → set `RESERVED`, `reservedByUserId = me`, `reservedUntil = now + 30 min`, then `200 { code, status: "RESERVED" }`.
  - Calling it again for the same user and code returns 200 (idempotent).
- **`POST /spin/play { code }`:**
  - Do everything in **one DB transaction**, with a row lock on the code (`SELECT … FOR UPDATE`).
  - The code must be RESERVED by me and not expired.
  - Pick a reward by weighted random among rewards that still have stock and haven't hit their weekly cap.
  - Increment `stockUsed`. Create a `SpinResult`. Mark the code `REDEEMED`.
  - Choose a `slotIndex` at random among the slots that map to the chosen reward key.
  - If the reward is Flash Point, credit it through the existing points ledger, with min spend and expiry taken from config.
  - Return `{ rewardKey, type, pointValue, label, slotIndex }`.
  - **Idempotent:** if a `SpinResult` already exists for this code and user, return the same result instead of spinning again.
- **`GET /spin/me/results`:** the user's past results, for the account page or later claim at checkout.

### 3.3 Security
- **Rate-limit `activate`** with a Redis limiter: about 10 attempts per user per 10 min and about 30 per IP per 10 min, to stop code brute-forcing.
- **The client never decides the reward.** The frontend only animates to the `slotIndex` the server returns.
- **Log every activate and play attempt** with the user, IP and result, for fraud review.

### 3.4 Code generation (for printing stickers)
- Add a CLI/script: `generate-spin-codes --campaign one-more-thing --batch <name> --count <n>`.
- It inserts codes as `UNUSED` and writes a CSV of the codes for the printer.
- It must never print a code that wasn't inserted.

---

## 4. Frontend (Next.js)

- **Route:** `/one-more-thing`, in whichever router the repo uses (App or Pages).
- **Components, suggested split:**
  - `Header`
  - `HeroWorld3D`
  - `LogoPlaque3D`
  - `WheelCard` (`Wheel3D`, `ActionPanel`, `RewardResult`, `Confetti3D`)
  - `StepsSlabs`
  - `RewardGrid`
  - `Terms`
  - `ClosingBand`
  - `Footer`
- **Keyframes:** move all `@keyframes` from the reference into one stylesheet scoped to this page.
- **Google login:** use the existing auth flow and come back to `/one-more-thing` afterwards. Keep any code the user already typed (e.g. in `sessionStorage`) so it survives the redirect.
- **Spin sequence:**
  1. Press SPIN NOW.
  2. Disable the button and start the wind-up animation **at the same moment** as calling `POST /spin/play`.
  3. When the response arrives, compute the target from `slotIndex` and run the 5.4s spin.
  4. Show the result when the spin ends.
  5. On API error, stop the wheel and show a generic error. Don't show a reward.
- **Device tilt:** listen for `deviceorientation`. On iOS 13+ it needs `DeviceOrientationEvent.requestPermission()` from a user gesture. Ask on the first tap of a button. If permission is denied, carry on without tilt.
- **Google button:** "Masuk dengan Google" should follow Google's sign-in branding guidelines (official button or approved logo usage). The reference deliberately has no G logo.
- **Placeholders:** keep `[TANGGAL MULAI]`, `[TANGGAL BERAKHIR]`, `[NOMOR WHATSAPP CS]` and `[LINK INSTAGRAM]` as config values, not hardcoded.

---

## 5. Pending decisions. Do NOT invent values

These are still waiting on approval (from the PDF, p.9). Put them in config or env with obvious placeholder defaults, and flag them in the PR:
- Flash Point minimum spend and expiry
- Whether Flash Point stacks with the Rp100K new-user voucher
- Reward weights / odds, stock per reward, weekly allocation
- Program period (start and end dates)
- Physical reward claim procedure (web + warehouse)
- Official CS WhatsApp number

---

## 6. Acceptance criteria

- [ ] At 390px and at 1280px the page matches `reference.dc.html` visually: layout, colors, type, 3D objects and animations.
- [ ] No hero object overlaps text at 360, 390, 768 or 1280px.
- [ ] With `prefers-reduced-motion`, nothing animates and all content is visible.
- [ ] Guest → Google login → back on the page in the `enter_code` state.
- [ ] Invalid code shows the exact CODE_INVALID copy. A redeemed code shows the exact CODE_USED copy.
- [ ] One code can produce only one `SpinResult`, even with double-clicks, two tabs or replayed requests (test it).
- [ ] The reward comes only from the server. The wheel lands on the slot the server returned.
- [ ] Flash Point results credit the points ledger. Physical results are stored as `UNCLAIMED`.
- [ ] `activate` is rate-limited.
- [ ] Unit tests for reward selection (weights, stock exhaustion, weekly cap). E2E test for activate → play → idempotent replay.
- [ ] Lighthouse mobile Performance ≥ 80 on the page.
