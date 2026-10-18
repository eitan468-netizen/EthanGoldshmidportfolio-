# Ethan Goldshmid, UX/UI portfolio

Static site: plain HTML, CSS and vanilla JS. No build step, no dependencies, no backend.
Open `index.html` in a browser, or serve the folder with any static host (Netlify, Vercel, Cloudflare Pages, S3, GitHub Pages).

    npx serve .        # local preview

## Pages
| File | Page | Styles |
|---|---|---|
| index.html | Home / selected work | base.css |
| about.html | About, timeline, flip cards, CV download | base.css |
| contact.html | Contact, copy-to-clipboard email and phone | base.css |
| fleetflow.html | Fleet case study (BMW M skin) | base.css + bmw.css |
| mindanchor.html | MyMind case study (Airbnb skin) | base.css + airbnb.css |
| govclear.html | GovLife case study (Apple skin, standalone) | apple.css |

Shared behaviour is in `app.js` (theme, scroll, page transitions, nav indicator, flip cards, copy buttons).
Assets: `portrait.jpg`, `Ethan-Goldshmid-CV.pdf`. Fonts come from Google Fonts (Montserrat, Inter) via `<link>` in each page head.
`legacy-unused/` holds old stylesheets no page loads. Safe to delete.

## Behaviour contracts (please keep)
- **Theme** changes only when the sun/moon toggle is clicked. Default is light, system setting is ignored on purpose. The choice is saved in localStorage, sessionStorage and window.name, and internal links carry `?t=dark|light`, so it survives navigation even where storage is blocked (iframes, previews). Head script in each page sets `data-theme` before paint.
- **Scroll**: every page opens at the top (scroll restoration is manual, hashes are stripped, and non-user scrolls are reset for the first seconds). Anchors clicked later still scroll smoothly.
- Internal navigation uses a short fade (app.js). Download links and non-HTML links are excluded.
- Custom cursors are intentionally removed (native cursor only).

## Things worth reviewing / known gaps
- Project pages are concept case studies; copy, metrics and the Fleet logo are placeholders to finalise.
- Each project has its own device and before/after pattern: Fleet = in-car console + studio monitor + vertical scan-wipe; MyMind = iPhone + tablet + horizontal divider; GovLife = MacBook + browser window + auto-switching segmented toggle.
- Fleet and MyMind include pan/zoom boards (data architecture, user flow) built with inline SVG + small inline scripts at the bottom of each page.
- Animated prototypes (fleet map, GovLife laptop loop, MyMind slider) are pure CSS/SMIL, no video files. `prefers-reduced-motion` is respected.
- CSS is split per skin with some duplicated rules; a consolidation pass into one token file would be a good refactor.
- Add real meta/OG tags, favicon, sitemap and a contact form backend if wanted (the form currently confirms in place, no network call).
- Link QA: all internal links, buttons, theme toggle and CV download were click-tested with Playwright; no overflow at 375, 768, 1280 px.
