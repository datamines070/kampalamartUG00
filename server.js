const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json({limit:'10mb'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
// --- Cloud API: Render built-in data.json ---
const DATA_FILE = path.join(__dirname, 'data.json');
function readData(){
  try{
    var raw = fs.readFileSync(DATA_FILE, 'utf8');
    var j = JSON.parse(raw);
    if(j && j.data) return j.data;
    if(j && j.products) return j;
    return {products:[], banners:[], categories:[], locations:[], ownerNotifs:[]};
  }catch(e){ return {products:[], banners:[], categories:[], locations:[], ownerNotifs:[]}; }
}
function writeData(d){
  try{ fs.writeFileSync(DATA_FILE, JSON.stringify({id:1, data:d}, null, 2)); return true; }catch(e){ return false; }
}
app.get('/api/data', (req,res)=>{ res.json(readData()); });
app.post('/api/data', (req,res)=>{
  var d = req.body && req.body.data ? req.body.data : req.body;
  if(!d) return res.status(400).json({error:'no data'});
  writeData(d);
  res.json({ok:true});
});
app.get('/rest/v1/km_data', (req,res)=>{ res.json([{id:1, data: readData()}]); });
app.post('/rest/v1/km_data', (req,res)=>{
  var d = req.body && req.body.data ? req.body.data : req.body;
  if(d) writeData(d);
  res.json({ok:true});
});
// --- Serve frontend - FORGIVING: tries public/index.html, then root index.html ---
app.get('*', (req,res)=>{
  if(req.path.startsWith('/api') || req.path.startsWith('/rest')) return res.status(404).json({error:'not found'});
  var p1 = path.join(__dirname, 'public', 'index.html');
  var p2 = path.join(__dirname, 'index.html');
  if(fs.existsSync(p1)) return res.sendFile(p1);
  if(fs.existsSync(p2)) return res.sendFile(p2);
  // Last resort: list what files ARE there so user can see what's missing
  var files = [];
  try{ files = fs.readdirSync(__dirname); }catch(e){}
  var pub = [];
  try{ pub = fs.readdirSync(path.join(__dirname,'public')); }catch(e){}
  res.send('<h1>Kampala Mart is Live - Server is running</h1><p>index.html not found in public/ or root. Root files: '+files.join(', ')+'</p><p>public/ files: '+pub.join(', ')+'</p><p>Upload index.html to GitHub root AND to public/ folder.</p>');
});
app.listen(PORT, ()=>{ console.log('Kampala Mart Render server on ' + PORT); });
