KAMPALA MART - RENDER - NO ERRORS + APPROVAL MESSAGE
==================================================
HOSTING: Render (https://kampalamartug.onrender.com)
CLOUD: Render built-in (server data.json) - NO Supabase, NO Firebase, NO SQL

WHAT WAS FIXED:
- package.json at ROOT (fixes ENOENT package.json)
- server.js at ROOT (fixes Cannot find module server.js)
- public/index.html inside public/ (fixes ENOENT public/index.html)
- server.js is forgiving: checks public/index.html AND root index.html
- Cloud = Render origin (window.location.origin) - no keys to paste

APPROVAL MESSAGE - HOW IT WORKS:
- Buyer taps Sell -> fills product -> Publish
- Product goes to PENDING (not live yet)
- Owner gets message in 3 ways:
  1. Banner on site: orange bar at top "New product waiting for approval - Approve Now"
  2. Owner Panel -> Approvals -> shows pending count + list
  3. If owner tapped Allow for notifications, phone/laptop shows status-bar notification even if site closed
- Owner taps Approve Now -> Approvals -> Approve -> product goes LIVE for all buyers
- If owner taps Reject, product is removed.

TO ENABLE PHONE/LAPTOP MESSAGE:
- On phone/laptop, open Render link -> Owner Panel -> tap "Enable Approval Messages" -> Allow
- Or when browser asks "Show notifications?" -> Allow
- OneSignal: Site URL must be https://kampalamartug.onrender.com

DEPLOY:
1. Extract ZIP
2. GitHub -> repo kampala-mart -> Delete all old files -> Add file -> Upload files -> drag ALL files from INSIDE extracted folder (package.json, server.js, render.yaml, data.json, public/) -> Commit
3. Check: GitHub must show package.json + server.js at TOP, and public/ folder with index.html inside
4. Render -> Manual Deploy -> wait for Live
5. Open https://kampalamartug.onrender.com -> must show shop, no red ENOENT

TEST APPROVAL:
1. On phone, Sell -> upload test product "Test Phone" -> Publish
2. On laptop (or same phone, Owner Panel) -> you must see orange banner + Approvals shows 1 pending
3. Tap Approve -> open site in Incognito -> test product must show
