const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json({limit:'10mb'}));
app.use(function(req,res,next){ res.set('Cache-Control','no-store, no-cache, must-revalidate'); res.set('Pragma','no-cache'); next(); });
const DATA_FILE = path.join(__dirname, 'data.json');
// IN-MEMORY store - survives disk wipes while server is Live. This is the source of truth.
let MEMORY = {keys:{}, updatedAt:0, data:{products:[], banners:[], categories:[], locations:[], ownerNotifs:[]}};
try{
  if(fs.existsSync(DATA_FILE)){
    var raw = fs.readFileSync(DATA_FILE,'utf8');
    var j = JSON.parse(raw);
    if(j.keys) MEMORY.keys = j.keys;
    if(j.updatedAt) MEMORY.updatedAt = j.updatedAt;
    if(j.data) MEMORY.data = j.data;
    else if(j.keys && j.keys['km_db_v63']){ try{ MEMORY.data = JSON.parse(j.keys['km_db_v63']); }catch(e){} }
    console.log('Loaded data.json, updatedAt='+MEMORY.updatedAt);
  }
}catch(e){ console.log('data.json load err', e.message); }
function persist(){
  try{ fs.writeFileSync(DATA_FILE, JSON.stringify({keys:MEMORY.keys, updatedAt:MEMORY.updatedAt, data:MEMORY.data}, null, 2)); }catch(e){ console.log('persist err', e.message); }
}
function mergeIncoming(body){
  if(!body) return;
  var now = body.updatedAt || Date.now();
  // Accept {keys:{...}} (V68) OR {data:{products}} (legacy) OR raw {products}
  var incomingKeys = body.keys || null;
  if(incomingKeys){
    Object.keys(incomingKeys).forEach(function(k){ MEMORY.keys[k]=incomingKeys[k]; });
    // Keep MEMORY.data in sync for legacy GETs
    try{ if(incomingKeys['km_db_v63']){ MEMORY.data = JSON.parse(incomingKeys['km_db_v63']); } }catch(e){}
    if(body.data) MEMORY.data = body.data;
  } else if(body.data){
    MEMORY.data = body.data;
    MEMORY.keys['km_db_v63']=JSON.stringify(body.data);
  } else if(body.products){
    MEMORY.data = body;
    MEMORY.keys['km_db_v63']=JSON.stringify(body);
  }
  MEMORY.updatedAt = Math.max(MEMORY.updatedAt, now, Date.now());
  persist();
}
app.get('/api/data', function(req,res){ res.json({keys:MEMORY.keys, data:MEMORY.data, updatedAt:MEMORY.updatedAt}); });
app.post('/api/data', function(req,res){ mergeIncoming(req.body); res.json({ok:true, updatedAt:MEMORY.updatedAt, products:(MEMORY.data.products||[]).length}); });
app.get('/rest/v1/km_data', function(req,res){ res.json([{id:1, data:MEMORY.data, keys:MEMORY.keys}]); });
app.post('/rest/v1/km_data', function(req,res){ mergeIncoming(req.body); res.json({ok:true}); });
app.get('/api/health', function(req,res){ res.json({ok:true, updatedAt:MEMORY.updatedAt, products:(MEMORY.data.products||[]).length, keys:Object.keys(MEMORY.keys)}); });
// Serve frontend with SERVER DATA INJECTED before React starts - so first paint already has shared products/settings
function serveIndex(req,res){
  var p1 = path.join(__dirname,'public','index.html');
  var p2 = path.join(__dirname,'index.html');
  var file = fs.existsSync(p1)?p1:(fs.existsSync(p2)?p2:null);
  if(!file) return res.status(404).send('<h1>Kampala Mart is Live</h1><p>index.html not found. Upload index.html to GitHub root.</p>');
  try{
    var content = fs.readFileSync(file,'utf8');
    var inject = '<script>window.__SERVER_DB__=' + JSON.stringify({keys:MEMORY.keys, data:MEMORY.data}) + ';window.__SERVER_UPDATED_AT__=' + MEMORY.updatedAt + ';</script>';
    if(content.indexOf('</head>')!==-1) content = content.replace('</head>', inject + '</head>');
    else content = inject + content;
    res.set('Content-Type','text/html');
    res.send(content);
  }catch(e){ res.sendFile(file); }
}
app.get('/', serveIndex);
app.get('/index.html', serveIndex);
// Static for icons/manifest/sw - but NOT index.html (handled above)
app.use(express.static(path.join(__dirname,'public'), {index:false, maxAge:0}));
app.use(express.static(__dirname, {index:false, maxAge:0}));
app.get('*', function(req,res){
  if(req.path.indexOf('/api')===0 || req.path.indexOf('/rest')===0) return res.status(404).json({error:'not found'});
  return serveIndex(req,res);
});
app.listen(PORT, function(){ console.log('Kampala Mart Render server on '+PORT+' - V68 Fixed Forever'); });
