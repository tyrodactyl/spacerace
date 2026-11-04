# Space Race

Live classroom behavior dashboard. The teacher awards points to tables from a phone, and rockets build on the classroom TV. Static pages on GitHub Pages plus Firebase Realtime Database. No server to run.

## Pages
| Page | Who | URL |
|---|---|---|
| `display.html?p=3` | TV, read-only | `https://tyrodactyl.github.io/spacerace/display.html?p=3` |
| `control.html?p=3` | Teacher phone (Add to Home Screen) | `https://tyrodactyl.github.io/spacerace/control.html?p=3` |
| `test.html` | Connectivity check | `https://tyrodactyl.github.io/spacerace/test.html` |
| `index.html` | Launcher | `https://tyrodactyl.github.io/spacerace/` |

`p` is the class period (1-6). Each period has its own data.

## Setup
1. **GitHub Pages:** repo Settings > Pages > Deploy from a branch > `main` / root.
2. **Firebase:** Realtime Database created; Authentication > Email/Password enabled with one teacher user; `tyrodactyl.github.io` added under Authentication > Settings > Authorized domains.
3. **Rules:** paste `database.rules.json` into Realtime Database > Rules and Publish. Only the teacher's UID can write, and only `/public` is readable by anyone.
4. The Firebase web config in `firebase-config.js` is safe to commit. Never commit the teacher password.

## How points stay hidden
- Every award is stored as an event under `/private/` (teacher-only).
- The phone turns events into coarse build stages (0-8 per rocket system) and writes only those to `/public/`, which the TV reads.
- The TV never receives raw point totals.

## Tuning
Everything adjustable lives in `config.js`: table names and colors, number of stages, points per stage, quick amounts.

## Status
- [x] Connectivity test
- [x] Phone control: award, reasons, undo, per-period, week/unit, table count, headcounts
- [x] TV display: live rocket build and award animations
- [ ] Friday launch sequence and route map
- [ ] Hall of fame, admin page, CSV export
- [ ] Offline page caching, sound, random events
