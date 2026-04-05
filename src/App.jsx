import { useState, useRef, useMemo, useEffect } from 'react'

const ICON_OPTIONS = ['✦','◈','◎','⊕','⟡','△','□','○','◇','✿','⬡','♾','⌘','✺','❋','⍟','⬢','✤','⊞','◉','⬟','✳','⊛','⊜','⊝','⋈','⊗','⊘','⊙']
const COLOR_SWATCHES = ['#7EC8A0','#F0A050','#A58FD8','#F06680','#60B8D4','#E8D060','#B0C860','#D48090','#80B8E0','#C8A070']

const DEFAULT_PURPOSES = [
  { id: 'soul',      label: 'Alma',       icon: '✦', color: '#7EC8A0', weight: 1 },
  { id: 'income',    label: 'Ingreso',    icon: '◈', color: '#F0A050', weight: 1 },
  { id: 'curiosity', label: 'Curiosidad', icon: '◎', color: '#A58FD8', weight: 1 },
]

const LS_KEY = 'pathly_v2'

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const styles = `
/* ── Layout ── */
.root{max-width:480px;width:100%;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column;padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);}
/* ── Responsive ── */
@media(max-width:520px){.content{padding:1rem 1rem 2rem;}.header{padding:1.25rem 1rem 0.625rem;}.nav{padding:0 1rem;}.sw-wrap{padding:1rem 1rem 1.25rem;}}
@media(max-width:360px){.content{padding:0.75rem 0.75rem 1.5rem;}.header{padding:1rem 0.75rem 0.5rem;}.nav{padding:0 0.75rem;}.sw-wrap{padding:0.75rem 0.75rem 1rem;}.cb{font-size:0.62rem;padding:0.5rem 0.5rem;}}
/* ── Header ── */
.header{padding:1.5rem 1.5rem 0.75rem;display:flex;align-items:center;justify-content:space-between;}
.logo{font-family:'Fraunces',serif;font-weight:700;font-size:1.6rem;letter-spacing:-0.03em;}
.logo em{font-style:italic;color:var(--accent);}
.pill{font-size:0.63rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);background:var(--s2);padding:4px 10px;border-radius:20px;}
/* ── Nav ── */
.nav{display:flex;padding:0 1.5rem;border-bottom:1px solid var(--border);overflow-x:auto;gap:0;-webkit-overflow-scrolling:touch;}
.nav::-webkit-scrollbar{display:none;}
.nt{font-size:0.7rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;padding:0.7rem 0.7rem;color:var(--muted);border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.2s;white-space:nowrap;flex-shrink:0;}
.nt.on{color:var(--text);border-bottom-color:var(--accent);}
.bdg{background:var(--s3);color:var(--text2);font-size:0.6rem;padding:1px 5px;border-radius:8px;margin-left:3px;}
/* ── Content ── */
.content{flex:1;padding:1.25rem 1.5rem 2rem;overflow-y:auto;}
@keyframes sIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
/* ── Capture ── */
.ctitle{font-family:'Fraunces',serif;font-size:1.35rem;font-weight:500;line-height:1.25;margin-bottom:0.3rem;}
.csub{font-size:0.82rem;color:var(--text2);line-height:1.55;margin-bottom:1.2rem;}
.irow{display:flex;gap:0.5rem;margin-bottom:1rem;}
.inp{flex:1;background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:0.75rem 1rem;font-family:'Instrument Sans',sans-serif;font-size:0.875rem;color:var(--text);outline:none;transition:border-color 0.2s;}
.inp:focus{border-color:var(--accent);}
.inp::placeholder{color:var(--muted);}
.ab{background:var(--accent);color:#0D0F0E;border:none;border-radius:10px;width:48px;height:48px;font-size:1.3rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity 0.15s,transform 0.1s;flex-shrink:0;}
.ab:hover{opacity:0.85;}
.ab:active{transform:scale(0.93);}
.alist{display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1.75rem;}
.ac{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:0.7rem 0.875rem;display:flex;align-items:center;justify-content:space-between;font-size:0.875rem;animation:sIn 0.2s ease;}
.xb{background:none;border:none;color:var(--muted);cursor:pointer;font-size:1rem;padding-left:0.75rem;transition:color 0.15s;}
.xb:hover{color:#F06680;}
.sb{width:100%;background:var(--accent);color:#0D0F0E;border:none;border-radius:12px;padding:0.9rem;font-family:'Instrument Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;transition:opacity 0.15s,transform 0.1s;}
.sb:hover{opacity:0.88;}
.sb:active{transform:scale(0.98);}
.sb:disabled{opacity:0.45;cursor:not-allowed;}
.empty{text-align:center;color:var(--muted);font-size:0.875rem;padding:2rem 0;line-height:1.6;}
/* ── Purposes editor ── */
.stl{font-size:0.63rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:0.75rem;margin-top:1.5rem;}
.prow{background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:0.7rem 0.875rem;display:flex;align-items:center;gap:0.6rem;margin-bottom:0.4rem;cursor:pointer;transition:border-color 0.15s;}
.prow:hover{border-color:var(--muted);}
.prow.ed{border-color:var(--accent);}
.picon{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
.plbl{flex:1;font-size:0.875rem;font-weight:500;}
.pwb{font-size:0.63rem;font-weight:600;letter-spacing:0.06em;padding:2px 7px;border-radius:6px;border:1px solid var(--border);}
.ep{background:var(--s3);border-radius:10px;padding:0.875rem;margin-bottom:0.4rem;animation:sIn 0.15s ease;}
.epl{font-size:0.63rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:0.35rem;}
.epi{width:100%;background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:0.5rem 0.75rem;font-family:'Instrument Sans',sans-serif;font-size:0.875rem;color:var(--text);outline:none;margin-bottom:0.7rem;}
.epi:focus{border-color:var(--accent);}
.ig{display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:0.7rem;}
.io{width:32px;height:32px;border-radius:7px;border:1px solid var(--border);background:var(--s2);display:flex;align-items:center;justify-content:center;font-size:0.95rem;cursor:pointer;transition:all 0.12s;}
.io:hover{border-color:var(--muted);}
.io.sel{border-color:var(--accent);background:rgba(200,240,102,0.08);}
.cr{display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.7rem;}
.co{width:22px;height:22px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all 0.12s;}
.co.sel{border-color:var(--text);}
.wr{display:flex;align-items:center;gap:0.625rem;}
.wl{font-size:0.75rem;color:var(--text2);}
.wbs{display:flex;gap:0.3rem;}
.wb{width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--s2);color:var(--text2);cursor:pointer;font-size:0.8rem;display:flex;align-items:center;justify-content:center;transition:all 0.12s;}
.wb.sel{background:var(--accent);color:#0D0F0E;border-color:var(--accent);}
.apb{width:100%;background:transparent;border:1px dashed var(--border);border-radius:10px;padding:0.6rem;font-size:0.77rem;color:var(--muted);cursor:pointer;transition:all 0.15s;margin-top:0.25rem;font-family:'Instrument Sans',sans-serif;}
.apb:hover{border-color:var(--muted);color:var(--text2);}
/* ── Swipe ── */
.sw-wrap{flex:1;display:flex;flex-direction:column;align-items:center;padding:1rem 1.5rem 1.5rem;}
/* Progress bar swipe */
.sw-prog-bar{width:100%;height:4px;background:var(--s3);border-radius:2px;margin-bottom:1.25rem;overflow:hidden;}
.sw-prog-fill{height:100%;border-radius:2px;background:var(--accent);transition:width 0.3s ease;}
.stk{width:100%;position:relative;height:280px;margin-bottom:1.5rem;}
/* Card — overflow-y auto for long text */
.card{position:absolute;width:100%;background:var(--s2);border-radius:18px;border:1px solid var(--border);padding:1.75rem 1.5rem;user-select:none;cursor:grab;display:flex;flex-direction:column;justify-content:center;min-height:200px;max-height:280px;overflow-y:auto;}
.card.dg{cursor:grabbing;}
@keyframes swL{to{transform:translateX(-150%) rotate(-18deg);opacity:0;}}
@keyframes swR{to{transform:translateX(150%) rotate(18deg);opacity:0;}}
@keyframes swU{to{transform:translateY(-110%) scale(0.88);opacity:0;}}
.card.al{animation:swL 0.32s ease forwards;}
.card.ar{animation:swR 0.32s ease forwards;}
.card.au{animation:swU 0.32s ease forwards;}
.clbl{font-size:0.6rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:0.6rem;flex-shrink:0;}
.ctxt{font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;line-height:1.4;color:var(--text);}
.chnt{font-size:0.72rem;color:var(--muted);margin-top:1rem;font-style:italic;flex-shrink:0;}
.ind{position:absolute;font-size:0.63rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:3px 10px;border-radius:20px;opacity:0;transition:opacity 0.12s;pointer-events:none;border:1px solid;}
.ind.show{opacity:1;}
/* Controls — bigger buttons, flash feedback */
.ctrls{display:flex;flex-direction:column;gap:0.5rem;width:100%;}
.crow{display:flex;gap:0.5rem;justify-content:center;}
.cb{border:1px solid var(--border);background:var(--s2);border-radius:12px;padding:0.75rem 0.875rem;min-height:52px;font-size:0.72rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;gap:0.35rem;justify-content:center;transition:background 0.12s,transform 0.1s,border-color 0.12s;flex:1;font-family:'Instrument Sans',sans-serif;}
.cb:active{transform:scale(0.96);}
/* Done overlay */
@keyframes fIn{from{opacity:0;}to{opacity:1;}}
@keyframes bIn{0%{transform:scale(0.2);opacity:0;}50%{transform:scale(1.2);}70%{transform:scale(0.92);}100%{transform:scale(1);opacity:1;}}
.done-overlay{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg);z-index:100;animation:fIn 0.35s ease;}
.done-icon{font-size:3.5rem;margin-bottom:1rem;animation:bIn 0.5s cubic-bezier(0.36,0.07,0.19,0.97);}
.done-title{font-family:'Fraunces',serif;font-size:1.5rem;font-weight:500;margin-bottom:0.4rem;}
.done-sub{font-size:0.85rem;color:var(--text2);margin-bottom:1.75rem;text-align:center;max-width:260px;line-height:1.55;}
.done-btn{background:var(--accent);color:#0D0F0E;border:none;border-radius:12px;padding:0.8rem 1.75rem;font-family:'Instrument Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;transition:opacity 0.15s;}
.done-btn:hover{opacity:0.85;}
/* Tracker */
.tss{margin-bottom:1.5rem;}
.tsh{font-size:0.63rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:0.7rem;display:flex;align-items:center;gap:0.45rem;}
.sdot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.ti{background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.4rem;display:flex;align-items:center;gap:0.7rem;cursor:pointer;transition:background 0.15s;animation:sIn 0.2s ease;}
.ti:hover{background:var(--s3);}
.ti.done{opacity:0.5;}
.ck{width:20px;height:20px;border-radius:5px;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;}
.ti-text{font-size:0.875rem;flex:1;line-height:1.35;}
.ti.done .ti-text{text-decoration:line-through;color:var(--muted);}
.ptag{font-size:0.6rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;padding:2px 7px;border-radius:5px;}
/* Dashboard */
.mg{display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:1.1rem;}
.mc{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:0.9rem;}
.ml{font-size:0.6rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:0.3rem;}
.mv{font-family:'Fraunces',serif;font-size:1.75rem;font-weight:500;line-height:1;}
.ms{font-size:0.68rem;color:var(--text2);margin-top:0.2rem;}
.bs{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:0.9rem;margin-bottom:0.8rem;}
.bt{font-size:0.62rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:0.8rem;}
.br{display:flex;align-items:center;gap:0.6rem;margin-bottom:0.45rem;}
.bl{font-size:0.73rem;color:var(--text2);width:76px;flex-shrink:0;display:flex;align-items:center;gap:0.3rem;}
.btr{flex:1;height:6px;background:var(--s3);border-radius:3px;overflow:hidden;}
.bf{height:100%;border-radius:3px;transition:width 0.6s ease;}
.bn{font-size:0.73rem;font-weight:600;color:var(--text);width:14px;text-align:right;flex-shrink:0;}
.ao{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:0.9rem;margin-bottom:0.8rem;}
.aoh{display:flex;align-items:center;gap:0.45rem;margin-bottom:0.6rem;}
.aod{width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;}
.aot{font-size:0.62rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);}
.aotx{font-size:0.84rem;color:var(--text2);line-height:1.6;font-style:italic;}
.ghost-btn{width:100%;background:transparent;border:1px dashed var(--border);border-radius:10px;padding:0.75rem;font-size:0.77rem;color:var(--muted);font-style:italic;cursor:pointer;transition:all 0.15s;font-family:'Instrument Sans',sans-serif;}
.ghost-btn:hover{color:var(--text2);border-color:var(--muted);}
/* Hangar */
.ht{font-family:'Fraunces',serif;font-size:1.2rem;font-weight:500;margin-bottom:0.3rem;}
.hs{font-size:0.82rem;color:var(--text2);line-height:1.5;margin-bottom:1.2rem;}
.ai-card{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:0.875rem 1rem;margin-bottom:0.625rem;animation:sIn 0.25s ease;}
.act{font-size:0.9rem;font-weight:500;color:var(--text);margin-bottom:0.45rem;line-height:1.4;}
.acm{display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;}
.acti{font-size:0.7rem;color:var(--muted);margin-left:auto;font-style:italic;}
.acr{font-size:0.77rem;color:var(--text2);margin-top:0.45rem;line-height:1.55;border-top:1px solid var(--border);padding-top:0.45rem;font-style:italic;}
/* History */
.hi{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:0.75rem;animation:sIn 0.2s ease;}
.hd{font-size:0.63rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:0.45rem;}
.hsu{display:flex;gap:0.35rem;flex-wrap:wrap;margin-bottom:0.6rem;}
.htg{font-size:0.68rem;font-weight:500;padding:3px 8px;border-radius:6px;}
.hax{font-size:0.77rem;color:var(--text2);line-height:1.6;}
.har{display:flex;align-items:center;gap:0.35rem;margin-bottom:0.2rem;}
.hdt{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
`

export default function App() {
  // ── Load persisted state ──
  const saved = useMemo(() => loadState(), [])

  const [purposes, setPurposes]           = useState(saved?.purposes       || DEFAULT_PURPOSES)
  const [editingP, setEditingP]           = useState(null)
  const [phase, setPhase]                 = useState(saved?.phase          || 'capture')
  const [tab, setTab]                     = useState(saved?.tab            || 'capture')
  const [input, setInput]                 = useState('')
  const [actions, setActions]             = useState(saved?.actions        || ['Lanzar Pathly en Product Hunt', 'Aprender diseño tipográfico', 'Escribir artículo sobre mi proyecto'])
  const [queue, setQueue]                 = useState(saved?.queue          || [])
  const [idx, setIdx]                     = useState(saved?.idx            || 0)
  const [anim, setAnim]                   = useState(null)
  const [indicator, setIndicator]         = useState(null)
  const [classified, setClassified]       = useState(saved?.classified     || {})
  const [showDone, setShowDone]           = useState(false)
  const [checked, setChecked]             = useState(saved?.checked        || {})
  const [dashOpinion, setDashOpinion]     = useState(saved?.dashOpinion    || null)
  const [sessions, setSessions]           = useState(saved?.sessions       || [])
  const [hangarLoading, setHangarLoading] = useState(false)
  const [hangarResults, setHangarResults] = useState(saved?.hangarResults  || null)
  const [hangarError, setHangarError]     = useState(null)
  const [flashBtn, setFlashBtn]           = useState(null)

  const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY
  const drag = useRef({ sx: 0, sy: 0, on: false })
  const cardRef = useRef(null)

  // ── Persist to localStorage on every state change ──
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        purposes, phase, tab, actions, queue, idx,
        classified, checked, dashOpinion, sessions, hangarResults,
      }))
    } catch {}
  }, [purposes, phase, tab, actions, queue, idx, classified, checked, dashOpinion, sessions, hangarResults])

  // ── Gemini ──
  const callGemini = async (prompt) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    )
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  // ── Derived ──
  const cfw = useMemo(() => {
    const o = {}
    purposes.forEach(p => { o[p.id] = classified[p.id] || [] })
    o.ai = classified.ai || []
    return o
  }, [purposes, classified])

  const allItems = useMemo(() =>
    Object.entries(cfw).flatMap(([k, arr]) => arr.map(a => ({ action: a, pid: k }))),
    [cfw])

  const totalCount     = allItems.length
  const completedCount = allItems.filter((_, i) => checked[`i${i}`]).length
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const purposeCounts = useMemo(() => {
    const o = {}
    purposes.forEach(p => { o[p.id] = cfw[p.id]?.length || 0 })
    return o
  }, [purposes, cfw])
  const maxCount = Math.max(...Object.values(purposeCounts), 1)

  // ── Swipe directions — adapts to number of purposes ──
  // 1 purpose: only up; 2 purposes: up + right; 3+: up + right + left
  const dirs = useMemo(() => {
    const p = purposes
    if (p.length === 0) return []
    if (p.length === 1) return [{ ...p[0], pos: 'u', arrow: '↑' }]
    if (p.length === 2) return [
      { ...p[0], pos: 'u', arrow: '↑' },
      { ...p[1], pos: 'r', arrow: '→' },
    ]
    return [
      { ...p[0], pos: 'u', arrow: '↑' },
      { ...p[1], pos: 'r', arrow: '→' },
      { ...p[2], pos: 'l', arrow: '←' },
    ]
  }, [purposes])

  const extraDirs = purposes.slice(3)

  // ── Swipe gesture — also adapts to number of purposes ──
  const gestureDir = (dx, dy) => {
    const p = purposes
    if (p.length === 0) return null
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 75) return p.length >= 2 ? p[1].id : null
      if (dx < -75) return p.length >= 3 ? p[2].id : null
    } else if (dy < -75) {
      return p[0].id
    }
    return null
  }

  // ── Handlers ──
  const addAction = () => { const v = input.trim(); if (!v) return; setActions(p => [...p, v]); setInput('') }

  const startSwipe = () => {
    const o = {}
    purposes.forEach(p => { o[p.id] = [] })
    o.ai = []
    setClassified(o)
    setQueue([...actions])
    setIdx(0)
    setPhase('swipe')
  }

  const classify = (dir) => {
    if (idx >= queue.length) return
    const action = queue[idx]
    // Flash button feedback
    setFlashBtn(dir)
    setTimeout(() => setFlashBtn(null), 200)
    setAnim(dir)
    setTimeout(() => {
      setClassified(p => ({ ...p, [dir]: [...(p[dir] || []), action] }))
      setAnim(null)
      setIndicator(null)
      if (idx + 1 >= queue.length) setShowDone(true)
      else setIdx(i => i + 1)
    }, 320)
  }

  const finishSwipe = () => {
    setShowDone(false)
    setSessions(prev => [{
      id: Date.now(), ts: Date.now(),
      actions: [...actions], classified: { ...classified },
      purposes: purposes.map(p => ({ ...p }))
    }, ...prev])
    setPhase('results')
    setTab('tracker')
  }

  const onMD = (e) => { const t = e.touches?.[0] || e; drag.current = { sx: t.clientX, sy: t.clientY, on: true } }
  const onMM = (e) => {
    if (!drag.current.on || !cardRef.current) return
    const t = e.touches?.[0] || e
    const dx = t.clientX - drag.current.sx, dy = t.clientY - drag.current.sy
    cardRef.current.style.transform = `translate(${dx}px,${dy}px) rotate(${dx * 0.07}deg)`
    if (Math.abs(dx) > Math.abs(dy)) setIndicator(dx > 35 ? 'r' : dx < -35 ? 'l' : null)
    else setIndicator(dy < -35 ? 'u' : null)
  }
  const onMU = (e) => {
    if (!drag.current.on) return
    drag.current.on = false
    if (cardRef.current) cardRef.current.style.transform = ''
    const t = e.changedTouches?.[0] || e
    const dx = t.clientX - drag.current.sx, dy = t.clientY - drag.current.sy
    const dir = gestureDir(dx, dy)
    if (dir) classify(dir)
    else setIndicator(null)
  }

  const updateP = (id, f, v) => setPurposes(prev => prev.map(p => p.id === id ? { ...p, [f]: v } : p))
  const addP = () => {
    const id = `c${Date.now()}`
    setPurposes(prev => [...prev, { id, label: 'Nuevo', icon: '◇', color: '#80B8E0', weight: 1 }])
    setEditingP(id)
  }
  const removeP = (id) => { setPurposes(prev => prev.filter(p => p.id !== id)); if (editingP === id) setEditingP(null) }

  const exportBackup = () => {
    const data = { version: 2, exportedAt: new Date().toISOString(), purposes, actions, classified, checked, sessions, hangarResults }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pathly-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Swipe progress %
  const swipePct = queue.length > 0 ? Math.round((idx / queue.length) * 100) : 0

  return (
    <>
      <style>{styles}</style>
      <div className="root">

        {showDone && (
          <div className="done-overlay">
            <div className="done-icon">✦</div>
            <div className="done-title">Instinto registrado</div>
            <div className="done-sub">Sesión guardada en tu historial. Ahora exploremos el mapa.</div>
            <button className="done-btn" onClick={finishSwipe}>Ver resultados →</button>
          </div>
        )}

        <div className="header">
          <div className="logo">path<em>ly</em></div>
          <div className="pill">{phase === 'capture' ? 'Captura' : phase === 'swipe' ? 'Clasifica' : 'Resultados'}</div>
        </div>

        {phase !== 'swipe' && (
          <div className="nav">
            {[
              { id: 'capture',   label: 'Captura' },
              { id: 'tracker',   label: 'Tracker',   count: totalCount || undefined },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'hangar',    label: 'Hangar IA' },
              { id: 'history',   label: 'Historial', count: sessions.length || undefined },
            ].map(t => (
              <button key={t.id} className={`nt ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}{t.count ? <span className="bdg">{t.count}</span> : null}
              </button>
            ))}
          </div>
        )}

        {/* ── CAPTURE ── */}
        {tab === 'capture' && phase !== 'swipe' && (
          <div className="content">
            <div className="ctitle">¿Qué tienes en mente?</div>
            <div className="csub">Vuelca todo sin filtrar. Ya veremos qué vale la pena y cuándo.</div>
            <div className="irow">
              <input className="inp" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAction()} placeholder="Una acción o idea…" />
              <button className="ab" onClick={addAction}>+</button>
            </div>
            <div className="alist">
              {actions.map((a, i) => (
                <div className="ac" key={i}>
                  <span style={{ fontSize: '0.875rem' }}>{a}</span>
                  <button className="xb" onClick={() => setActions(p => p.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
            </div>
            {actions.length > 0
              ? <button className="sb" onClick={startSwipe}>Clasificar {actions.length} acción{actions.length !== 1 ? 'es' : ''} →</button>
              : <div className="empty">Añade al menos una acción para comenzar.</div>
            }

            <div className="stl">Tus propósitos</div>
            {purposes.map(p => (
              <div key={p.id}>
                <div className={`prow ${editingP === p.id ? 'ed' : ''}`} onClick={() => setEditingP(editingP === p.id ? null : p.id)}>
                  <div className="picon" style={{ background: p.color + '22' }}>
                    <span style={{ color: p.color, fontSize: '1.05rem' }}>{p.icon}</span>
                  </div>
                  <div className="plbl">{p.label}</div>
                  <div className="pwb" style={{ borderColor: p.color + '44', color: p.color }}>×{p.weight}</div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', paddingLeft: '0.5rem' }}
                    onClick={e => { e.stopPropagation(); removeP(p.id) }}>×</button>
                </div>
                {editingP === p.id && (
                  <div className="ep">
                    <div className="epl">Nombre</div>
                    <input className="epi" value={p.label} onChange={e => updateP(p.id, 'label', e.target.value)} placeholder="Nombre del propósito…" />
                    <div className="epl">Icono</div>
                    <div className="ig">
                      {ICON_OPTIONS.map(ic => (
                        <button key={ic} className={`io ${p.icon === ic ? 'sel' : ''}`} onClick={() => updateP(p.id, 'icon', ic)}>{ic}</button>
                      ))}
                    </div>
                    <div className="epl">Color</div>
                    <div className="cr">
                      {COLOR_SWATCHES.map(c => (
                        <div key={c} className={`co ${p.color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => updateP(p.id, 'color', c)} />
                      ))}
                    </div>
                    <div className="wr">
                      <div className="wl">Peso</div>
                      <div className="wbs">
                        {[1, 2, 3].map(w => (
                          <button key={w} className={`wb ${p.weight === w ? 'sel' : ''}`} onClick={() => updateP(p.id, 'weight', w)}>{w}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button className="apb" onClick={addP}>+ Añadir propósito</button>
          </div>
        )}

        {/* ── SWIPE ── */}
        {phase === 'swipe' && (
          <div className="sw-wrap">
            {/* Progress bar instead of text counter */}
            <div className="sw-prog-bar" style={{ alignSelf: 'stretch' }}>
              <div className="sw-prog-fill" style={{ width: `${swipePct}%` }} />
            </div>

            <div className="stk">
              {idx + 1 < queue.length && (
                <div className="card" style={{ transform: 'scale(0.95) translateY(10px)', opacity: 0.3, zIndex: 0 }} />
              )}
              <div
                className={`card ${anim ? `a${anim[0]}` : ''}`}
                style={{ zIndex: 1 }} ref={cardRef}
                onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
                onTouchStart={onMD} onTouchMove={onMM} onTouchEnd={onMU}
              >
                {dirs.map(d => (
                  <div key={d.id} className={`ind ${indicator === d.pos ? 'show' : ''}`}
                    style={{
                      color: d.color, borderColor: d.color, background: d.color + '14',
                      ...(d.pos === 'u' ? { top: '0.75rem', left: '50%', transform: 'translateX(-50%)' }
                        : d.pos === 'r' ? { right: '1rem', top: '1.25rem' }
                        : { left: '1rem', top: '1.25rem' })
                    }}>
                    {d.icon} {d.label}
                  </div>
                ))}
                <div className="clbl">Acción {idx + 1} de {queue.length}</div>
                <div className="ctxt">{queue[idx]}</div>
                <div className="chnt">Desliza o usa los botones</div>
              </div>
            </div>

            <div className="ctrls">
              <div className="crow">
                {dirs.map(d => {
                  const isFlash = flashBtn === d.id
                  return (
                    <button key={d.id} className="cb"
                      style={{
                        color: d.color,
                        borderColor: isFlash ? d.color : d.color + '55',
                        background: isFlash ? d.color + '22' : 'var(--s2)',
                      }}
                      onClick={() => classify(d.id)}>
                      {d.arrow} {d.icon} {d.label}
                      {d.weight > 1 && <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>×{d.weight}</span>}
                    </button>
                  )
                })}
              </div>
              {extraDirs.length > 0 && (
                <div className="crow">
                  {extraDirs.map(d => {
                    const isFlash = flashBtn === d.id
                    return (
                      <button key={d.id} className="cb"
                        style={{
                          color: d.color,
                          borderColor: isFlash ? d.color : d.color + '55',
                          background: isFlash ? d.color + '22' : 'var(--s2)',
                        }}
                        onClick={() => classify(d.id)}>
                        {d.icon} {d.label}
                        {d.weight > 1 && <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>×{d.weight}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TRACKER ── */}
        {phase === 'results' && tab === 'tracker' && (
          <div className="content">
            {totalCount === 0 && <div className="empty">Sin acciones clasificadas.<br />Ve a Captura para empezar.</div>}
            {[...purposes, { id: 'ai', label: 'IA decide', icon: '⊕', color: 'var(--muted)', weight: 1 }].map(p => {
              const items = cfw[p.id] || []
              if (!items.length) return null
              return (
                <div className="tss" key={p.id}>
                  <div className="tsh">
                    <div className="sdot" style={{ background: p.color }} />
                    <span style={{ color: p.color }}>{p.icon}</span> {p.label}
                    {p.weight > 1 && <span style={{ fontSize: '0.58rem', color: 'var(--muted)', marginLeft: '2px' }}>×{p.weight}</span>}
                  </div>
                  {items.map((item, i) => {
                    const gi = allItems.findIndex(a => a.action === item)
                    const done = !!checked[`i${gi}`]
                    return (
                      <div className={`ti ${done ? 'done' : ''}`} key={i}
                        onClick={() => setChecked(prev => ({ ...prev, [`i${gi}`]: !prev[`i${gi}`] }))}>
                        <div className="ck" style={{ borderColor: done ? p.color : undefined, background: done ? p.color + '22' : undefined }}>
                          {done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke={p.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="ti-text">{item}</div>
                          <div style={{ marginTop: '0.3rem' }}>
                            <span className="ptag" style={{ background: p.color + '18', color: p.color }}>{p.icon} {p.label}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {phase === 'results' && tab === 'dashboard' && (
          <div className="content">
            <div className="mg">
              {[
                { label: 'Completadas', val: completedCount, sub: `de ${totalCount} acciones`, color: 'var(--accent)' },
                { label: 'Progreso',    val: `${pct}%`,      sub: 'del total clasificado',      color: '#7EC8A0' },
                { label: 'Pendientes',  val: totalCount - completedCount, sub: 'por completar', color: '#F0A050' },
                { label: 'Sesiones',    val: sessions.length, sub: 'en el historial',           color: 'var(--muted)' },
              ].map(m => (
                <div className="mc" key={m.label}>
                  <div className="ml">{m.label}</div>
                  <div className="mv" style={{ color: m.color }}>{m.val}</div>
                  <div className="ms">{m.sub}</div>
                </div>
              ))}
            </div>
            <div className="bs">
              <div className="bt">Por propósito</div>
              {purposes.map(p => (
                <div className="br" key={p.id}>
                  <div className="bl"><span style={{ color: p.color }}>{p.icon}</span>{p.label}</div>
                  <div className="btr"><div className="bf" style={{ width: `${((purposeCounts[p.id] || 0) / maxCount) * 100}%`, background: p.color }} /></div>
                  <div className="bn">{purposeCounts[p.id] || 0}</div>
                </div>
              ))}
            </div>
            <div className="bs">
              <div className="bt">Avance general</div>
              <div style={{ height: '8px', background: 'var(--s3)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.2rem' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>0%</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 600 }}>{pct}%</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>100%</span>
              </div>
            </div>
            <div className="ao">
              <div className="aoh"><div className="aod" /><div className="aot">Opinión de la IA</div></div>
              {dashOpinion
                ? <div className="aotx">{dashOpinion}</div>
                : <div className="aotx" style={{ opacity: 0.4 }}>Disponible cuando conectes tu API Key de Gemini.</div>
              }
            </div>
            {!dashOpinion && (
              <button className="ghost-btn" onClick={async () => {
                try {
                  const prompt = `Eres un asistente de priorización. El usuario tiene ${totalCount} acciones, ha completado ${completedCount}. 
Propósitos (con peso): ${purposes.map(p => `${p.label} (×${p.weight})`).join(', ')}.
Distribución: ${purposes.map(p => `${p.label}: ${purposeCounts[p.id] || 0}`).join(', ')}.
Da una opinión honesta y concisa (2-3 frases) sobre su estado de priorización y qué podría mejorar.`
                  const raw = await callGemini(prompt)
                  setDashOpinion(raw.trim())
                } catch {
                  setDashOpinion('No se pudo conectar con Gemini. Revisa tu API Key.')
                }
              }}>✦ Pedir opinión a la IA →</button>
            )}
            {dashOpinion && (
              <button className="ghost-btn" style={{ marginTop: '0.5rem' }} onClick={() => setDashOpinion(null)}>↺ Nueva opinión</button>
            )}
          </div>
        )}

        {/* ── HANGAR IA ── */}
        {phase === 'results' && tab === 'hangar' && (
          <div className="content">
            <div className="ht">Hangar de la IA</div>
            <div className="hs">Gemini analiza todas tus acciones considerando tus propósitos y sus pesos.</div>
            {!hangarResults && (
              <button className="sb" disabled={hangarLoading} onClick={async () => {
                setHangarLoading(true)
                setHangarError(null)
                try {
                  const prompt = `Analiza estas acciones considerando los propósitos del usuario. Responde SOLO en JSON válido, sin texto adicional, sin bloques de código:
[{"action":"...","purposes":["etiqueta1"],"time":"...","reasoning":"..."}]

Propósitos disponibles (usa exactamente estas etiquetas en minúsculas, peso 1=normal 2=importante 3=crítico):
${purposes.map(p => `- "${p.label.toLowerCase()}" (peso ${p.weight})`).join('\n')}

Una acción puede tener uno o más propósitos. Acciones:
${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
                  const raw = await callGemini(prompt)
                  const clean = raw.replace(/```json|```/g, '').trim()
                  setHangarResults(JSON.parse(clean))
                } catch {
                  setHangarError('No se pudo obtener el análisis. Revisa tu API Key o inténtalo de nuevo.')
                } finally {
                  setHangarLoading(false)
                }
              }}>
                {hangarLoading ? '✦ Analizando…' : '✦ Analizar con Gemini'}
              </button>
            )}
            {hangarError && <div style={{ fontSize: '0.8rem', color: '#F06680', margin: '0.75rem 0', textAlign: 'center' }}>{hangarError}</div>}
            {hangarResults && (
              <>
                {hangarResults.map((r, i) => {
                  const mps = (r.purposes || []).map(ap => purposes.find(p => p.label.toLowerCase() === ap)).filter(Boolean)
                  return (
                    <div className="ai-card" key={i}>
                      <div className="act">{r.action}</div>
                      <div className="acm">
                        {mps.map(mp => (
                          <span key={mp.id} className="ptag" style={{ background: mp.color + '18', color: mp.color }}>{mp.icon} {mp.label} ×{mp.weight}</span>
                        ))}
                        <span className="acti">{r.time}</span>
                      </div>
                      <div className="acr">{r.reasoning}</div>
                    </div>
                  )
                })}
                <button className="ghost-btn" style={{ marginTop: '0.5rem' }} onClick={() => setHangarResults(null)}>↺ Regenerar análisis</button>
              </>
            )}
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab === 'history' && (
          <div className="content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <div className="ctitle" style={{ fontSize: '1.1rem' }}>Historial</div>
                <div className="csub" style={{ marginBottom: 0 }}>Cada sesión de clasificación completada.</div>
              </div>
              <button className="ghost-btn" style={{ width: 'auto', padding: '0.5rem 0.875rem', fontSize: '0.72rem', whiteSpace: 'nowrap', fontStyle: 'normal', marginLeft: '0.75rem' }}
                onClick={exportBackup}>↓ Backup</button>
            </div>
            {sessions.length === 0
              ? <div className="empty">Aquí aparecerán tus sesiones de clasificación.<br />Cada swipe completado queda registrado.</div>
              : sessions.map(s => (
                <div className="hi" key={s.id}>
                  <div className="hd">{formatDate(s.ts)}</div>
                  <div className="hsu">
                    {s.purposes.map(p => {
                      const cnt = (s.classified[p.id] || []).length
                      if (!cnt) return null
                      return <span key={p.id} className="htg" style={{ background: p.color + '18', color: p.color }}>{p.icon} {p.label} · {cnt}</span>
                    })}
                    {(s.classified['ai'] || []).length > 0 && (
                      <span className="htg" style={{ background: 'rgba(90,102,96,0.15)', color: 'var(--muted)' }}>⊕ IA · {s.classified['ai'].length}</span>
                    )}
                  </div>
                  <div className="hax">
                    {s.actions.slice(0, 4).map((a, i) => {
                      const pid = Object.entries(s.classified).find(([, arr]) => arr.includes(a))?.[0]
                      const p = s.purposes.find(x => x.id === pid)
                      return (
                        <div className="har" key={i}>
                          <div className="hdt" style={{ background: p?.color || 'var(--muted)' }} />
                          <span style={{ color: 'var(--text2)', fontSize: '0.77rem' }}>{a}</span>
                        </div>
                      )
                    })}
                    {s.actions.length > 4 && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>+{s.actions.length - 4} más…</div>}
                  </div>
                </div>
              ))
            }
          </div>
        )}

      </div>
    </>
  )
}
