# REFLEX.

A browser reaction timer in the **Midnight Velocity — 3D Edition** design system. A lit, faceted icosahedron floats inside thin orbital rings; red means wait, electric green means react. Built with semantic HTML, CSS, vanilla JavaScript, Three.js and Vite. No framework, backend, accounts or leaderboard.

## Run locally

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Run `npm run build` to generate `dist/`; run `npm run preview` to inspect that build.

## How to play

1. Select **Start test**, click/tap the reaction area, or press Space or Enter.
2. Wait for the red shape to become green after a random 2–5 seconds.
3. Click/tap the reaction area or press Space/Enter immediately.
4. Read your rounded millisecond result and choose **Play again**.

Early input ends the round without recording it. Switching away from the window interrupts an active round so hidden-tab delays do not affect statistics. Reset statistics opens a confirmation dialog; cancel keeps your data.

## Architecture and project structure

```text
index.html                     Semantic controls, status and statistics
src/main.js                    Input and module coordination
src/game/reactionTimer.js      Independent, dependency-injected state machine
src/graphics/scene.js          Three.js rendering and resource lifecycle
src/storage/statistics.js     Validated versioned local persistence
src/ui/interface.js           Text, control and statistics updates
src/styles/styles.css         Responsive Midnight Velocity design
tests/*.test.js               Deterministic gameplay and persistence tests
tests/browser/game.spec.js    Browser integration checks
vite.config.js                Relative assets for static hosting
.github/workflows/pages.yml   Verification and GitHub Pages deployment
```

The state machine follows `idle → waiting → ready → completed`. Input during waiting produces `early`. Losing visibility or window focus produces `interrupted`. Early, completed and interrupted rounds can restart. Every restart, early input, interruption and disposal cancels pending timers and frames. A generation token rejects callbacks belonging to old rounds. Only ready-state input can produce a result; subsequent input cannot record the same result again.

Gameplay knows nothing about Three.js or the DOM. The coordinator publishes each transition to the interface and renderer, and records only completed attempts. Local Storage stores version, completed count, precise total and personal best, keeping storage constant in size. Reads validate the schema and aggregate consistency; invalid records are discarded. Failed storage access degrades to in-memory statistics with an on-screen notice.

## Graphics and accessibility

Three.js uses a low-complexity flat-shaded icosahedron, shared torus geometry, restrained edge lines, ambient light, directional light and an accent point light. Rotation and floating movement use elapsed delta time. The ready state immediately sets the material color and renders, without an interpolated color transition or decorative motion in the measurement window. Completed rounds have a subtle scale pulse. Pixel ratio is capped at 1.75. ResizeObserver updates camera aspect and renderer size. Hidden documents stop the animation loop; teardown disposes geometry, materials, renderer and listeners.

The semantic reaction button supports mouse, touch, keyboard and assistive-technology activation. Text accompanies every color state; a polite live region announces changes. Focus is visible, controls remain usable at narrow widths, and a native modal handles reset confirmation. Reduced-motion preference stops decorative animation, including when the preference changes during a visit. Canvas content is decorative and hidden from assistive technology. If WebGL is unavailable or its context is lost, an HTML/CSS signal keeps the full game playable. Google Fonts load Space Grotesk and Inter; system fonts remain available offline.

## Timing limitations

`setTimeout` schedules only the randomized wait. A separate requestAnimationFrame callback activates the ready state, reads `performance.now()` and synchronously updates text and the 3D/fallback signal before the browser paints. Input reads `performance.now()` again; rounded results are for display only. Rendering time, display refresh, browser scheduling, operating-system load, assistive-technology announcements and input-device latency affect perceived results. This is a casual visual reaction test, not millisecond-perfect measurement or a clinical instrument. There is no upper reaction timeout; long valid reactions remain valid.

## Automated verification

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Unit tests cover initialization, random-delay endpoints, frame-coordinated readiness, fractional timing, early input, duplicate result prevention, stale callbacks, restart, timer/frame cleanup, interruption, best/average/count, persistence, reset, malformed data and denied storage.

Chromium integration tests cover mouse and touch gameplay, keyboard controls, early input, result display, reload persistence, reset cancel/confirm, reduced-motion rendering, Three.js canvas initialization, visible state changes, mobile resizing, WebGL initialization failure, context loss, blocked storage and document hiding. Pixel comparisons verify rendering changes, not calibrated color accuracy. Automated touch is emulation rather than a physical touchscreen.

Manual release checklist (not implied by automated passes):

- [ ] Test Safari, Firefox, Edge and physical iOS/Android devices.
- [ ] Check desktop, tablet and phone in portrait/landscape, including 200% zoom.
- [ ] Play with mouse, touch, keyboard and a screen reader; inspect live announcements and focus return from the reset dialog.
- [ ] Inspect lighting, signal clarity, completion pulse and resizing on real GPUs.
- [ ] Confirm OS reduced-motion changes stop rotation, floating and completion animation.
- [ ] Check background-tab interruption, unavailable WebGL/storage, and offline font fallback.
- [ ] Validate the hosted URL and relative assets after deployment.

## Static hosting: GitHub Pages

The production build contains only static assets. `base: './'` allows project-subdirectory hosting without hardcoding a repository name.

1. Push this project to a GitHub repository whose default branch is `main` (or adjust the workflow branch).
2. In repository Settings → Pages, select **GitHub Actions** as the build source.
3. The included workflow installs locked dependencies, runs unit and Chromium tests, builds, uploads `dist/` and deploys through the Pages environment.

Build command: `npm run build`. Output directory: `dist`. No secrets or server environment variables are required. Hosting has not been provisioned or deployed by creating these files. The workflow itself requires execution on GitHub to verify hosting permissions and the published URL.

## Scope and remaining validation

Statistics belong to this browser/origin and may be removed by browser data clearing. Private browsing may not persist data. Screen-reader announcement timing cannot match the visual cue exactly. Cross-browser, real-device and physical latency validation remain manual. No features beyond the requested single reaction test are included. Future work should prioritize that validation and accessibility feedback before considering feature additions.
