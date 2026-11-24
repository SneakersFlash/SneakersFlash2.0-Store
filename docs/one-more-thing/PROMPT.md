# Prompt to paste into Claude Code

Run Claude Code from the root of the SneakersFlash 2.0 repo, after copying this folder to `docs/one-more-thing/`. Start in **plan mode** (Shift+Tab twice), then paste:

---

Read `docs/one-more-thing/HANDOFF.md` in full, then read `docs/one-more-thing/design/reference.dc.html`. The HTML file is the visual source of truth for the new campaign page "ONE MORE THING" (`/one-more-thing`): a Google-login + unique-code + 3D spin wheel landing page.

Before planning, explore the codebase and tell me:
1. How auth works today. Is Google login already there? How does the frontend know who's signed in?
2. Whether there is a points/loyalty ledger I can credit Flash Point into, and how it handles expiry and minimum spend.
3. Which Next.js router the storefront uses, and where global styles and fonts are loaded.
4. The existing module/service/controller/DTO/test conventions in NestJS and Prisma that I should follow.

Then propose a plan in these phases, and wait for my OK before writing code:
- **Phase 1, backend:** Prisma models + migration, `activate` / `play` / `results` endpoints with transaction + row lock + idempotency, Redis rate limit, code-generation script, unit + e2e tests.
- **Phase 2, frontend:** port the reference into React components on `/one-more-thing`, wire to the API, keep every animation and the exact copy, reduced-motion support.
- **Phase 3, QA:** run the acceptance checklist in HANDOFF.md §6 and report each item.

Rules:
- Follow existing conventions. Adapt to the real code instead of rewriting.
- Never invent the pending values in HANDOFF.md §5. Put them in config with placeholders and list them in the summary.
- Don't add Three.js or any 3D library. The 3D is pure CSS, as in the reference.
- Use the UI copy verbatim from HANDOFF.md §2 and the reference.
- Commit at the end of each phase with a clear message. Don't push.
