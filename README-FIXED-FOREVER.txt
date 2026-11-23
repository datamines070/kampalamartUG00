KAMPALA MART V68 - RENDER FIXED FOREVER - ALL 5 CAUSES FIXED
1. Products: now sync ALL km_* keys to Render server on every save (not just km_db_v63)
2. Owner settings: km_ads_settings, km_banners, km_categories, km_locations, km_owner_notifs all sync too - no more disappearing on refresh
3. Approval: server stores pending products + ownerNotifs. Owner browser polls server every 4s, auto-reloads when new pending arrives - sees approval on any browser
4. Service Worker: V68 SW deletes ALL old caches and NEVER caches index.html or /api/data - new deploys show instantly
5. Render disk: server keeps IN-MEMORY store as source of truth + injects server data into page BEFORE React starts - first paint already shared, even if data.json wipes
Deploy: GitHub kampalamartUGA -> delete old -> upload ALL files -> Commit -> Render Manual Deploy -> Live
TEST: Browser A upload product -> wait 5s -> Browser B hard refresh (Ctrl+Shift+R) -> product + approval must show. Owner Panel: change WhatsApp/phone -> Save -> hard refresh -> setting must stay. Then open Incognito -> must still show.
