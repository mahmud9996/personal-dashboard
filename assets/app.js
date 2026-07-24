// personal-dashboard app.js — renders data/*.json into the dashboard (no external libs)
const DATA = {
  products: "data/products.json",
  learning: "data/learning.json",
  todos: "data/todos.json",
  activity: "data/activity.json"
};

function scoreColor(v){ return v>=70?"var(--emerald)":v>=45?"var(--amber)":"var(--rose)"; }
function esc(s){ return (s||"").replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

async function loadAll(){
  const out = {};
  for(const k in DATA){
    try { out[k] = await (await fetch(DATA[k])).json(); }
    catch(e){ out[k] = null; console.warn("load fail",k,e); }
  }
  return out;
}

function renderProducts(d){
  if(!d) return "<div class='card'>ডেটা লোড হয়নি</div>";
  let cards = d.candidates.map(c=>{
    const m = c.metrics;
    const bars = [
      ["Demand", m.demand],
      ["Margin", m.margin],
      ["Competition Ease", m.competition_ease],
      ["Trend", m.trend]
    ].map(([l,v])=>`
      <div class="bar-row"><div class="bar-label">${l}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${v}%;background:${scoreColor(v)}"></div></div>
      <div style="width:32px;text-align:right;color:var(--muted)">${v}</div></div>`).join("");
    return `<div class="card">
      <div class="card-head"><div class="dot ${c.trend==='up'?'emerald':c.trend==='down'?'rose':'amber'}"></div>
        <h3 style="font-size:14px">${esc(c.name)}</h3>
        <span class="pill ${c.trend}">${c.trend}</span></div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${esc(c.category)} • ৳${c.price_bdt} • margin: ${esc(c.margin_est)} • competition: ${esc(c.competition)}</div>
      ${bars}
      <div style="margin-top:10px;font-size:12px"><span style="color:var(--emerald)">✓</span> ${esc(c.why)}</div>
      <div style="margin-top:4px;font-size:12px"><span style="color:var(--rose)">⚠</span> ${esc(c.risk)}</div>
      <div style="margin-top:6px">${c.channels.map(ch=>`<span class="tag">${esc(ch)}</span>`).join("")}</div>
    </div>`;
  }).join("");

  // overview KPI + radar
  const avg = a => Math.round(a.reduce((x,y)=>x+y,0)/a.length);
  const demand = avg(d.candidates.map(c=>c.metrics.demand));
  const margin = avg(d.candidates.map(c=>c.metrics.margin));
  const kpis = `<div class="grid3">
    <div class="card"><div class="kpi">${d.candidates.length}</div><div class="kpi-sub">বেস্ট ক্যান্ডিডেট</div></div>
    <div class="card"><div class="kpi" style="color:var(--cyan)">${demand}</div><div class="kpi-sub">avg demand score</div></div>
    <div class="card"><div class="kpi" style="color:var(--emerald)">${margin}</div><div class="kpi-sub">avg margin score</div></div>
  </div>`;
  return `<div class="section-sub">রিসার্চ টপিক: ${esc(d.research_topic)} • আপডেট: ${esc(d.updated)}</div>${kpis}
    <div class="card" style="margin-top:14px"><div class="card-head"><div class="dot violet"></div><h3 style="font-size:13px">ক্যান্ডিডেট তুলনা — ভিজুয়াল অ্যানালেটিক্স</h3></div>
    ${d.candidates.map((c,i)=>radar(c,i)).join("")}
    <div class="legend" style="margin-top:8px">
      <div><span style="background:var(--cyan)"></span>Demand &nbsp; <span style="background:var(--emerald)"></span>Margin &nbsp; <span style="background:var(--amber)"></span>Competition Ease &nbsp; <span style="background:var(--violet)"></span>Trend</div>
    </div></div>
    ${cards}
    <div class="card" style="font-size:11px;color:var(--muted)">${esc(d.analytics_note)}</div>`;
}

function radar(c, i){
  const cx=90, cy=90, R=70;
  const axes=[["Demand",c.metrics.demand,"var(--cyan)"],["Margin",c.metrics.margin,"var(--emerald)"],["Comp Ease",c.metrics.competition_ease,"var(--amber)"],["Trend",c.metrics.trend,"var(--violet)"]];
  const step=(Math.PI*2)/axes.length;
  const poly = axes.map((a,idx)=>{ const v=a[1]/100; const ang=-Math.PI/2+idx*step; return [cx+Math.cos(ang)*R*v, cy+Math.sin(ang)*R*v]; })
    .map(p=>p.map(n=>n.toFixed(1)).join(",")).join(" ");
  const rings=[0.25,0.5,0.75,1].map(r=>`<circle cx="${cx}" cy="${cy}" r="${R*r}" fill="none" stroke="#1f2937" stroke-width="0.6"/>`).join("");
  const spokes = axes.map((a,idx)=>{ const ang=-Math.PI/2+idx*step; return `<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(ang)*R).toFixed(1)}" y2="${(cy+Math.sin(ang)*R).toFixed(1)}" stroke="#1f2937" stroke-width="0.6"/>`; }).join("");
  const labels = axes.map((a,idx)=>{ const ang=-Math.PI/2+idx*step; const lx=cx+Math.cos(ang)*(R+15), ly=cy+Math.sin(ang)*(R+15); return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="#94a3b8" font-size="9" text-anchor="middle">${a[0]}</text><text x="${lx.toFixed(1)}" y="${(ly+10).toFixed(1)}" fill="${a[2]}" font-size="9" text-anchor="middle">${a[1]}</text>`; }).join("");
  return `<div style="display:inline-block;margin:6px 10px"><svg width="180" height="180" viewBox="0 0 180 180">
    ${rings}${spokes}
    <polygon points="${poly}" fill="rgba(34,211,238,0.18)" stroke="#22d3ee" stroke-width="1.4"/>
    ${axes.map((a,idx)=>{ const v=a[1]/100; const ang=-Math.PI/2+idx*step; const px=cx+Math.cos(ang)*R*v, py=cy+Math.sin(ang)*R*v; return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.2" fill="${a[2]}"/>`; }).join("")}
    ${labels}</svg><div style="text-align:center;font-size:11px;color:var(--text)">${esc(c.name)}</div></div>`;
}

function renderLearning(d){
  if(!d) return "<div class='card'>ডেটা লোড হয়নি</div>";
  const stColor = s=> s==='done'?"var(--emerald)":s==='learning'?"var(--cyan)":s==='planned'?"var(--amber)":"var(--muted)";
  const items = d.items.map(it=>`
    <div class="card">
      <div class="card-head"><div class="dot ${''}" style="background:${stColor(it.status)}"></div>
        <h3 style="font-size:13px">${esc(it.tech)}</h3>
        <span class="pill" style="background:rgba(148,163,184,.12);color:${stColor(it.status)}">${esc(it.status)}</span></div>
      <div class="bar-row"><div class="bar-label">progress</div>
        <div class="bar-track"><div class="bar-fill" style="width:${it.progress}%;background:${stColor(it.status)}"></div></div>
        <div style="width:32px;text-align:right;color:var(--muted)">${it.progress}%</div></div>
      <div style="font-size:12px;color:var(--muted);margin-top:6px">${esc(it.note)}</div>
      ${it.resources.length?`<div style="margin-top:6px">${it.resources.map(r=>`<span class="tag">${esc(r)}</span>`).join("")}</div>`:""}
    </div>`).join("");
  return `<div class="section-sub">আপডেট: ${esc(d.updated)}</div><div class="grid2">${items}</div>`;
}

function renderTodos(d){
  if(!d) return "<div class='card'>ডেটা লোড হয়নি</div>";
  const items = d.items.map(t=>`
    <div class="todo-item">
      <div class="todo-check ${t.done?'todo-done':''}">${t.done?'✓':''}</div>
      <div style="flex:1">
        <div style="${t.done?'text-decoration:line-through;color:var(--muted)':''}">${esc(t.task)}</div>
        <div style="font-size:11px" class="prio-${t.priority==='high'?'high':t.priority==='medium'?'medium':'low'}">${t.priority}${t.due?' • due '+esc(t.due):''}</div>
      </div>
    </div>`).join("");
  const open = d.items.filter(t=>!t.done).length;
  return `<div class="section-sub">আপডেট: ${esc(d.updated)} • ওপেন: ${open}/${d.items.length}</div><div class="card">${items}</div>`;
}

function renderActivity(d){
  if(!d) return "<div class='card'>ডেটা লোড হয়নি</div>";
  const items = d.entries.map(e=>`
    <div class="log-entry">
      <div class="when">${esc(e.date)}</div>
      <div style="margin-top:3px"><b style="color:var(--cyan)">কী:</b> ${esc(e.what)}</div>
      <div class="log-a"><span style="color:var(--muted)">কীভাবে:</span> ${esc(e.how)}</div>
      <div class="log-a"><span style="color:var(--muted)">কোথায়:</span> ${esc(e.where)}</div>
      <div class="log-q">✗ ব্যর্থ: ${esc(e.why_failed)}</div>
      <div class="log-a"><b>✓ ঠিক করেছি:</b> ${esc(e.fixed)}</div>
    </div>`).join("");
  return `<div class="section-sub">আপডেট: ${esc(d.updated)} • Hermes কী করেছে, কীভাবে, কোথায়, কেন ব্যর্থ ও কীভাবে ঠিক করেছে</div><div class="card">${items}</div>`;
}

function show(tab){
  document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));
  document.querySelectorAll("nav button").forEach(b=>b.classList.remove("active"));
  document.getElementById("sec-"+tab).classList.add("active");
  document.querySelector(`nav button[data-t="${tab}"]`).classList.add("active");
}

(async function(){
  const d = await loadAll();
  document.getElementById("sec-products").innerHTML = renderProducts(d.products);
  document.getElementById("sec-learning").innerHTML = renderLearning(d.learning);
  document.getElementById("sec-todos").innerHTML = renderTodos(d.todos);
  document.getElementById("sec-activity").innerHTML = renderActivity(d.activity);
  show("products");
  window.__dash = d;
})();
