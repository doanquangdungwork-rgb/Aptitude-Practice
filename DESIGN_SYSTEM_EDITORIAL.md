# Aptitude Lab — Editorial Visual System

## Visual direction
Playful editorial minimalism inspired by the approved reference: warm ivory paper, subtle 64px grid, geometric sans typography, flat pastel accents, generous whitespace, restrained borders/shadows, lime CTA, small human-feeling graphic interventions, and a quiet editorial rhythm.

Avoid: glassmorphism, giant gradients, neon/cartoon styling, excessive blobs, heavy card shadows, serif display typography, dashboard-as-decoration, or random decorative icons.

## Non-negotiable redesign rule
**A redesign changes presentation, never product capability.**

Whenever an existing feature already exists, keep its behavior, data, state, persistence, navigation, and interaction. Only adapt its layout, spacing, typography, colors, surfaces, controls, and responsive treatment to the new visual system.

Never remove or silently replace an existing feature because it does not fit the reference visually. Instead, redesign the feature so it belongs to the same visual language.

## Features that must remain present
- Homepage practice library and reasoning-category navigation
- Practice Tests library with per-test star/favourite control
- Practice by Type with pillar/subtype selection
- Full Dashboard: streak calendar, month/year filter, completion, question coverage, accuracy, wrong-question count, strengths/gaps by pillar, all-test progress, saved questions, and next-practice actions
- Bookmarks/Your Library: In Progress + Starred Tests
- Test runner: resume, no countdown, recorded duration, question save/bookmark, previous/next, finish, wrong-question tracking
- Result review: score, correct/wrong/skipped, duration, accuracy, question-by-question review, explanations, wrong-question add/remove, share
- Learning Center/history
- Google authentication, account menu, sign out, user state
- Profile/dashboard/result share flows

## Page consistency rule
Every route must use the same shell and design tokens. A page may have a different information hierarchy, but it must not look like it belongs to an older version of the product.

## Responsive rule
Desktop uses the fixed editorial rail. Mobile collapses to a compact top navigation. Data-heavy features remain accessible; content is reorganized rather than removed.
