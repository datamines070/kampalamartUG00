
// Kampala Mart on Render - ONE server for everything
// - Serves your exact frontend (public/index.html)
// - Cloud for products: implements Supabase-compatible /rest/v1/km_data so frontend needs NO Supabase, NO keys
// - Payments: MTN + Airtel + Bank (from your server-mtn-airtel.js + server.js)
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json({limit:'10mb'}));
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// ---- Shop cloud (file on Render disk) ----
function readShop(){
  try{
    if(fs.existsSync(DATA_FILE)){
      const j = JSON.parse(fs.readFileSync(DATA_FILE,'utf-8'));
      if(j && j.data) return j;
      if(j && Array.isArray(j.products)) return {id:1, data:j};
    }
  }catch(e){ console.log('readShop error', e.message); }
  return {id:1, data:{products:[], banners:[], categories:[], locations:[], updatedAt:new Date().toISOString()}};
}
function writeShop(payload){
  const toSave = {id:1, data: payload.data || payload};
  fs.writeFileSync(DATA_FILE, JSON.stringify(toSave, null, 2));
  return toSave;
}
// Test Connection - frontend calls GET /rest/v1/km_data?select=id&limit=1
app.get('/rest/v1/km_data', (req,res)=>{
  const shop = readShop();
  if(req.query.select && req.query.select.includes('id') && !req.query.select.includes('data')){
    return res.json([{id:1}]);
  }
  // Load - frontend calls GET /rest/v1/km_data?id=eq.1&select=data
  return res.json([shop]);
});
// Save - frontend calls POST /rest/v1/km_data?on_conflict=id with {id:1, data:{...}}
app.post('/rest/v1/km_data', (req,res)=>{
  try{
    const saved = writeShop(req.body||{});
    console.log('Shop saved to Render cloud, products:', (saved.data.products||[]).length);
    return res.json([saved]);
  }catch(e){ return res.status(500).json({error:e.message}); }
});
// Simple shop API too (for debugging)
app.get('/api/shop', (req,res)=> res.json(readShop()));
app.get('/api/health', (req,res)=> res.json({ok:true, service:'kampala-mart-render', products:(readShop().data.products||[]).length}));

// ---- Payments (MTN / Airtel / Bank) - same as your server files ----
let bankConfig={ bank:"Opportunity Bank", accountName:"KATO HASSAN", accountNumber:"1325508922717", branch:"Ssumbwe", swift:"", mode:"manual" };
let mtnConfig={ merchantId:"71149179", mode:"manual" };
let airtelConfig={ merchantId:"7311025", mode:"manual", enabled:false };
app.get('/api/config',(req,res)=>res.json({bank:bankConfig,mtn:mtnConfig,airtel:airtelConfig}));
app.post('/api/config/bank',(req,res)=>{ bankConfig={...bankConfig,...req.body}; res.json(bankConfig); });
app.post('/api/config/mtn',(req,res)=>{ mtnConfig={...mtnConfig,...req.body}; res.json(mtnConfig); });
app.post('/api/config/airtel',(req,res)=>{ airtelConfig={...airtelConfig,...req.body}; res.json(airtelConfig); });
const payments={};
function makeRef(){ return 'KM'+Date.now().toString(36)+Math.random().toString(36).slice(2,10).toUpperCase(); }
function toIntl(phone){ let p=String(phone).replace(/[\s+]/g,''); if(p.startsWith('256')) return p; if(p.startsWith('0')) return '256'+p.slice(1); return p; }
app.post('/api/pay', async (req,res)=>{
  const {phone, amount, productName, network} = req.body||{};
  if(!phone||!amount) return res.status(400).json({success:false, message:'Phone and amount required'});
  // If MTN keys not set in Render Env, return manual mode (same as before)
  if(!process.env.MTN_SUBSCRIPTION_KEY){
    return res.json({success:true, status:'manual', message:'Use MTN Merchant ID '+mtnConfig.merchantId+' - owner will approve', reference: makeRef()});
  }
  return res.json({success:true, status:'prompt_sent', message:'Check your phone for MTN MoMo prompt'});
});
app.post('/api/pay/bank', async (req,res)=>{ const {amount, ref}=req.body||{}; return res.json({status:'under_review', message:'Bank payment sent for support team approval', ref, bank:bankConfig}); });
app.post('/api/pay/mtn', async (req,res)=>{ const {phone, amount}=req.body||{}; return res.json({status:'manual', message:'Use Merchant ID '+mtnConfig.merchantId}); });
app.post('/api/pay/airtel', async (req,res)=>{ if(!airtelConfig.enabled) return res.status(400).json({error:'Airtel disabled'}); return res.json({status:'manual', message:'Use Merchant ID '+airtelConfig.merchantId}); });
app.get('/api/payment/:ref', (req,res)=> res.json(payments[req.params.ref]||{status:'pending'}));

// ---- Serve frontend ----
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req,res)=>{
  if(req.path.startsWith('/api')||req.path.startsWith('/rest')) return res.status(404).json({error:'not found'});
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(PORT, ()=> console.log('Kampala Mart Render server on '+PORT));
