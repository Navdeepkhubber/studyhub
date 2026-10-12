# Study Hub

A personal learning platform with 72 ordered study blocks covering 593 roadmap checkpoints, a DSA tracker (Striver A2Z + NeetCode), AI engineering practice, skills, career and degree planning. Study block dates adapt to the learner’s available hours, so a dense block can span more than one calendar week.
Built with the same stack as [navdeep.dev](https://navdeep.dev) (React 19, strict TypeScript, Vite 6, lucide-react) in its own repo,
with its own look: the original Study Compass theme (teal, mint, navy; Manrope + DM Sans), in light and dark.

## Quick start

```bash
npm ci
npm run dev                 # http://127.0.0.1:5173
npm test                    # unit tests
npm run e2e                 # browser tests against the real production build
npm run build               # production build into dist/
```

## Visibility

The site is **not password-protected**: anyone who has the URL can open it and read its content.
Search engines are asked not to index it (`noindex` meta tag, `robots.txt`, and `public/_headers` for hosts that read it),
and your progress never leaves your browser. Don't link to the subdomain from navdeep.dev if you want it to stay out of sight.
Passphrase encryption was built and then removed; it can be added back later.

## Deploy to a subdomain

Static site with clean paths (`/plan`, `/week-3`). The build also writes `dist/404.html` (a copy of the app shell) so deep links and refreshes work on GitHub Pages; hosts that fall back to `index.html` work as-is. Old `#plan`-style links are redirected automatically.

1. Host build command: `npm ci && npm run build`, output directory: `dist`.
2. Point a DNS record for your subdomain (for example `study`) at the host.
3. Use a separate hosting project from navdeep.dev (do not reuse its `.openai/hosting.json` `project_id`).

## GitHub Pages option

The repository includes `.github/workflows/pages.yml`. On each push to `main`, GitHub Actions installs dependencies, checks the curriculum, runs unit tests, builds the app, and deploys `dist/` to GitHub Pages. The app is built for a root-level domain such as `https://study.navdeep.dev/` (Vite `base` is `/`). It will not load from a `https://<owner>.github.io/<repo>/` project URL.

1. Create a GitHub repository and push this source to its `main` branch. On GitHub Free, Pages requires a public repository; a Pages website is publicly accessible even if a paid plan permits a private source repository.
2. In the repository's **Settings → Pages**, choose **GitHub Actions** as the build source. Wait for the workflow to deploy and test the `github.io` URL before changing DNS.
3. Add `study.navdeep.dev` under **Settings → Pages → Custom domain**. In Cloudflare DNS, set a `study` CNAME to `<owner>.github.io` (without the repository path), then enable **Enforce HTTPS** when GitHub offers it. Set the Cloudflare record to **DNS only** unless the provider explicitly supports proxying.
4. Export a Study Hub backup from the old address and restore it on the new address. Browser local storage does not move across origins.

The earlier Sites deployment remains available until the GitHub Pages address has been verified. Remove its pending custom-domain binding before pointing DNS at GitHub.

## Keeping your progress safe

Progress lives in your browser's `localStorage` (key `study-compass-v2`, unchanged, so old Study Compass backups restore here).

- **Backup reminder** on Today if you have never backed up, or not for 14 days.
- **Auto-save to a file** (Chrome/Edge on a computer): pick a file in a Google Drive/OneDrive/Dropbox folder for a private, always-current copy.
- **Durable storage** is requested so the browser doesn't clean it up; Settings shows the status.
- **Restore** shows your current progress next to the backup's before replacing anything, and keeps a snapshot so you can **undo**.
- **Multiple tabs** stay in sync; an idle tab never overwrites newer work.

## Follow the weekly plan

Open the current study block from Today or Weekly plan. Each checkpoint gives a reading, a practice source, a focused source search when a broad documentation page opens, and a concrete action. The suggested study days divide estimated work across the available hours in Settings. DSA uses the daily problem goal on 1–4 scheduled practice days per calendar week (about 25 minutes per problem). The schedule warns when that goal cannot fit the chosen hour target; extra practice days add time. Estimates guide pacing; they are not course-duration guarantees. The 72 blocks may take more than 72 calendar weeks.

A week can store a link to a private Notion page. Copy the generated note outline into Notion, complete the linked study and practice, and paste the page link back into Study Hub. Notion content stays in Notion; Study Hub saves only the URL in the browser and in backups. The final weekly checkmark unlocks after the exact checkpoints, selected bridge, scheduled portfolio criteria, and evidence are complete.

DSA practice and due revisions appear in each block and share progress with the DSA tracker. Portfolio criteria appear in selected blocks and share checkmarks with the Career page. Completed topics enter a recall queue after three days, then recur at increasing intervals when remembered.

## Resource precision

Every one of the 593 Atlas checkpoints now has its own resource entry in `src/data/study-resources.json`: a selected reading, a practice source, and an action. Broader checkpoints include additional readings for their named concepts, such as the Azure design patterns and the statistics papers. The 66 group mappings remain as a fallback for future curriculum changes; the current plan does not use them. The curriculum check fails if a scheduled checkpoint lacks a topic-specific entry. `npm run check:links` audits external URL health; external documentation can still move, and an accessible course overview may require choosing its named lesson.

## DSA data

| File | What it is |
| --- | --- |
| `src/data/dsa/a2z.base.json` | 477 A2Z/pattern items with video, LeetCode, GfG, Code360 links (input) |
| `src/data/dsa/a2z.json` | Generated: base + takeUforward article and practice links |
| `src/data/dsa/neetcode.json` | Generated from `neetcode-gh/leetcode`: NeetCode 150 / Blind 75 / 420 problems, 18 patterns |
| `src/data/dsa/tuf-overrides.json` | Written by `npm run links:tuf`: dead links dropped, moved ones resolved |

Problems in both A2Z and NeetCode (same LeetCode slug) share one done tick, note and revision schedule.
takeUforward articles moved to `takeuforward.org/blogs/data-structure-and-algorithm/<slug>`; 235 topics link there.
Striver's numbered series (G-xx, DP-xx) get links once `npm run links:tuf` resolves them (run locally or via the weekly workflow).
The live A2Z sheet has 495 topics; this tracker has 477 (new topics must be added to `a2z.base.json` by hand).

## Topic atlas

`src/data/roadmaps.ts` maps the 13 roadmap PDFs to groups in `roadmap.json` (method documented in the file; edit freely).

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` / `build` / `preview` | Develop, production build, serve `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | Playwright tests: every page, DSA, backups, offline, two tabs, mobile, axe accessibility (light + dark) |
| `npm run check:data` | Integrity checks on bundled data |
| `npm run check:links` | Checks curriculum links, writes `link-report.md` (`-- --strict` fails on broken links) |
| `npm run links:tuf` then `npm run data:dsa` | Verify/resolve takeUforward links, rebuild DSA data |

## Automation

- **CI** (`.github/workflows/ci.yml`): data checks, unit tests, and the full browser suite on every push.
- **Weekly link check** (`.github/workflows/links.yml`): opens a PR when takeUforward links change and an issue
  (kept up to date, not duplicated) when curriculum links break. Network outages don't raise false alarms.

## Updating "last checked" dates

`src/data/sources.ts` records when external content was last checked. Pages show the date and flag it after 180 days.
