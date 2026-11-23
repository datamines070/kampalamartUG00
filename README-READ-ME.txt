KAMPALA MART - RENDER FINAL - CANNOT FAIL ON public/index.html
=============================================================
WHAT IS DIFFERENT IN THIS ZIP:
- index.html is in TWO places: at ROOT and in public/
- manifest.json, sw.js, icons also in TWO places: root + public/
- server.js is NEW and FORGIVING: it checks public/index.html FIRST, then index.html at root
  Even if GitHub drops the public/ folder, site still shows from root index.html.
- package.json at ROOT, server.js at ROOT, render.yaml, data.json

HOW TO UPLOAD (GitHub web always drops folders, so this ZIP fixes that):
1. Extract this ZIP
2. GitHub -> repo kampalamart-UGA (the one Render uses, datamines070/kampalamartUGA)
3. Delete all old files
4. Add file -> Upload files -> drag ALL files from INSIDE extracted folder
   You will see: package.json, server.js, render.yaml, data.json, index.html, manifest.json, sw.js, icon-192.png, icon-512.png, public/
   Drag them ALL. If public/ folder gets dropped by GitHub, DON'T WORRY - index.html at root will still work.
5. Commit
6. Check GitHub main page: you MUST see index.html + package.json + server.js at TOP. If you see that, you are DONE - even without public/ folder, site will work.
7. Render -> Manual Deploy -> wait for Live
8. Open https://kampalamart-uga.onrender.com -> must show shop, NO red ENOENT

APPROVAL MESSAGE:
- Buyer uploads -> PENDING -> Owner sees orange banner + Approvals count + status-bar message if Allow tapped
- Owner Approvals -> Approve -> product goes LIVE
