# Space Race Classroom Dashboard: Build Spec

## Goal
A live classroom dashboard shown on a classroom smart TV. The teacher awards behavior points to tables from a phone, and the TV updates in real time. Each class period is its own separate environment with 8-9 tables. Tables build a rocket each week, launch it on Friday, and travel farther out in the solar system each week. Over a 4-week unit, whichever table is farthest along the route wins.

## Hard constraints
- **No servers to run.** Static pages on GitHub Pages (the repo and account already exist) plus Firebase Realtime Database (free tier) as the shared live data store.
- **District Wi-Fi restrictions.** The TV only makes outbound HTTPS requests. Do not use WebRTC, local-network discovery, or anything that needs the phone and TV on the same network. The phone may be on cellular data.
- **Weak smart-TV browser.** Use CSS animations and simple canvas or SVG. No heavy 3D or WebGL. Target 30 fps and test on low-end hardware.
- **Phone page is the main product.** It must be fast and usable with one thumb in the middle of a lesson.

## Hosting
- The GitHub repo is named `spacerace`. Deploy with GitHub Pages from the `main` branch, repo root (Settings → Pages → "Deploy from a branch").
- The site will be served at `https://<github-username>.github.io/spacerace/`, so pages are `/display.html?p=3`, `/control.html?p=3`, `/admin.html`, and `/test.html`.
- Use relative paths for all assets so the site works under the `/spacerace/` subpath.
- The repo is public (required for free Pages). The Firebase web config is safe to commit. Never commit the teacher password, service-account keys, or any admin credentials.
- Include a README with the Pages setup steps, the Firebase setup steps, and how to deploy the security rules.

## Step 1: Connectivity test (do this first, before anything else)
Build `/test.html` and deploy it to GitHub Pages. It should:
1. Load and show a green "page loaded" status.
2. Connect to a Firebase Realtime Database test path, write a timestamp, read it back live, and show pass/fail with a clear message.
3. Display the user agent and screen resolution so the TV's capabilities are known.

The teacher will open this on the classroom TV on school Wi-Fi. If it fails, stop and report what is blocked (GitHub Pages domain vs. `firebaseio.com`) before building anything else. Fallback options if blocked: single-device mode (see Fallbacks) or a different backend.

## Core concepts
- **Period:** an isolated environment (e.g. period 1 to 6). Each has its own tables, data, and route progress. URLs: `/display.html?p=3` and `/control.html?p=3`.
- **Tables:** 8-9 per period, configurable. Each table has a name, a color, and a headcount (students present, editable per day for fairness).
- **Weekly cycle:**
  - **Mon-Thu, Build:** points added during class build the table's rocket on the TV.
  - **Fri, Launch:** a staggered countdown launches all rockets, results are revealed one by one, and tables advance along the route.
- **Unit:** 4 weeks, so 4 launches. At the end of the unit, the farthest table wins and is added to the period's hall of fame. The next unit resets the route, and the hall of fame persists.

## Points and rocket building
Reason presets map to rocket systems:

| Reason | Rocket system |
|---|---|
| On task | Fuel |
| Helped a peer | Crew |
| Great answer | Guidance |
| Ready first | Engines |

- Every award makes something visibly change on the table's rocket on the TV (a part snaps in, a light turns on, a stage extends), so instant feedback is never lost.
- **Raw point totals are hidden from students.** The TV shows build *progress* in coarse stages only (for example 8-10 stages per system), so students see their rocket growing but cannot rank tables precisely. The stage granularity is a tunable config value.
- Optional teacher-only negative or private tracking is allowed on the phone page and is **never displayed on the TV**. No public deductions.

## Launch outcomes (Friday)
Computed on the **teacher's phone**, then only the results are written to the public display path. The TV never receives raw scores.

1. `power` = points per student present for the week (normalized so absences and table sizes do not decide the outcome).
2. Roll = about 70% `power` (relative to the period's other tables) plus about 30% randomness. Weights are tunable.
3. Teacher-triggered **random events** (solar flare, perfect launch window, meteor shower) apply modifiers.
4. **Gravity assist:** tables trailing on the route get a launch bonus, so leaders do not snowball.
5. Outcomes are **soft failures only**, with no explosions:
   - **Orbit:** a short launch that advances a little. The table gets a "salvage" build bonus next week.
   - **Success:** advances to the next route stop.
   - **Bonus:** a rare skip or an extra-far launch.
6. Everyone always moves forward, just at different speeds.

**Route:** Moon → Mars → Asteroid Belt → Jupiter's Moons → Saturn → edge of the solar system. Position is stored as a continuous distance with named stops as milestones. The tiebreak is the most total launch power.

## Position visibility
A table's position on the solar-system route is **visible only during launch (Friday)**. Monday to Thursday, the TV shows build pads only. After launch, the route view shows each table's new position and holds for a short time, then returns to the build view. The teacher can also reveal it from the phone.

## Pages
### Display (TV): `display.html?p=N`
- Build view: a launch-pad scene with 8-9 rockets side by side, table names and colors, starfield, and ambient motion (steam, blinking lights, drifting stars) so the screen feels alive even when nothing is happening.
- Award animation: a part drops in with a small sound or flash, plus a brief glow on the rocket.
- Launch view: staggered countdown, mission-control style text, launch animation, then a route map reveal.
- Read-only, no login. Reads only the **public** data path.
- If the connection drops, keep showing the last known state and show a small reconnecting indicator.

### Control (phone): `control.html?p=N`, installable as a PWA
- Period switcher at the top (default to the current period based on a bell schedule config).
- A big colored button per table. Tap a table, then tap a reason preset (+1 default, +2/+5 via a second tap or long press).
- Prominent **Undo** (last award, with a multi-step history).
- Per-table headcount-present editor.
- Friday panel: "Run launch" (computes outcomes, writes results), "Trigger event", "Reveal route".
- Offline queue: awards made while offline are stored locally and synced when the connection returns.
- Secured (see Auth).

### Admin: `admin.html`
- Setup tables (names, colors, headcount) per period.
- Theme and thresholds editor, unit start/end, week reset, hall of fame.
- Export award history as CSV.

## Data model (Firebase Realtime Database)
```
/private/{period}/events/{id}     = { table, system, amount, reason, ts }   // append-only log
/private/{period}/config          = tables, headcounts, thresholds, weights
/public/{period}/build/{table}    = { fuel: stage, crew: stage, guidance: stage, engines: stage }
/public/{period}/route/{table}    = { distance, lastOutcome }               // revealed on launch
/public/{period}/state            = { view: "build" | "launch" | "route", week, unit }
/public/{period}/halloffame/...   = past unit winners
```
- Store every award as an **event** (append-only) so undo, history, and CSV export work.
- The phone derives `build` stages and `route` outcomes from private events and writes only the coarse public data.

## Auth and security
- Teacher signs in on the phone with Firebase Auth (email/password or a single-user setup).
- **Rules:** `/public/**` is readable by anyone and writable only by the teacher's UID. `/private/**` is readable and writable only by the teacher's UID.
- Students who open the TV page's source or the network tab can only ever see `/public`.
- Provide a security-rules file and explain how to deploy it.

## Config
One `config.js` for everything tunable: number of tables, reason-to-system mapping, stage thresholds, luck/power weights, route stops and distances, launch outcome thresholds, gravity-assist strength, bell schedule, and the visual theme (palette and sprites) so a reskin is easy later.

## Fallbacks
- **Connectivity blocked on the TV:** a single-device mode runs everything from the TV's browser with local storage, and the teacher awards points from the board itself.
- **Phone offline:** awards queue and sync.
- **TV connection drops:** show the last known state and reconnect automatically.

## Build order
1. Connectivity test page (Step 1 above), stop and report.
2. Firebase project, security rules, auth.
3. Phone control page: award flow, presets, undo, event log.
4. TV display: build view with live award animations.
5. Friday launch: computation on the phone, launch sequence, route reveal.
6. Admin page, hall of fame, CSV export.
7. Polish: sound, random events, offline queue, PWA install, single-device fallback.

## Open items to decide (defaults in brackets)
- Number of periods and tables per period [6 periods, 8-9 tables each].
- Exact stage counts per rocket system [8].
- Luck vs. power weights [30/70].
- Route distances so a strong table finishes the route in 4 launches while an average table lands mid-route.
- Bell schedule for default period selection.
