KAMPALA MART V67 - RENDER SHARED - PRODUCTS SHOW IN EVERY BROWSER
Fix: Shop now syncs to Render server /api/data on every save.
- Save in Browser A -> auto POST to Render server
- Open Browser B -> auto GET from Render server -> shows same products
- No Supabase, No Firebase, No SQL. Just Render server.
Deploy: Upload all files to GitHub repo kampalamartUGA -> Render Manual Deploy -> Open site.
Then: In browser where 456789 shows, open site, wait 5 sec (it auto-pushes to server), then hard-refresh other browser (Ctrl+Shift+R) - 456789 must appear there too.
