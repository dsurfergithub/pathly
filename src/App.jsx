import { useState, useRef, useMemo } from 'react'

const ICON_OPTIONS = ['✦','◈','◎','⊕','⟡','△','□','○','◇','✿','⬡','♾','⌘','✺','❋','⍟','⬢','✤','⊞','◉','⬟','✳','⊛','⊜','⊝','⋈','⊗','⊘','⊙']
const COLOR_SWATCHES = ['#7EC8A0','#F0A050','#A58FD8','#F06680','#60B8D4','#E8D060','#B0C860','#D48090','#80B8E0','#C8A070']

const DEFAULT_PURPOSES = [
  { id: 'soul',      label: 'Alma',       icon: '✦', color: '#7EC8A0', weight: 1 },
  { id: 'income',    label: 'Ingreso',    icon: '◈', color: '#F0A050', weight: 1 },
  { id: 'curiosity', label: 'Curiosidad', icon: '◎', color: '#A58FD8', weight: 1 },
]

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const styles = `
.root{max-width:480px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;}
.header{padding:1.5rem 1.5rem 0.75rem;display:flex;align-items:center;justify-content:space-between;}
.logo{font-family:'Fraunces',serif;font-weight:700;font-size:1.6rem;letter-spacing:-0.03em;}
.logo em{font-style:italic;color:var(--accent);}
.pill{font-size:0.63rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);background:var(--s2);padding:4px 10px;border-radius:20px;}
.nav{display:flex;padding:0 1.5rem;border-bottom:1px solid var(--border);overflow-x:auto;gap:0;}
.nav::-webkit-scrollbar{display:none;}
.nt{font-size:0.7rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;padding:0.7rem 0.7rem;color:var(--muted);border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.2s;white-space:nowrap;flex-shrink:0;}
.nt.on{color:var(--text);border-bottom-color:var(--accent);}
.bdg{background:var(--s3);color:var(--text2);font-size:0.6rem;padding:1px 5px;border-radius:8px;margin-left:3px;}
.content{flex:1;padding:1.25rem 1.5rem 2rem;overflow-y:auto;}
@keyframes sIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
.ctitle{font-family:'Fraunces',serif;font-size:1.35rem;font-weight:500;line-height:1.25;margin-bottom:0.3rem;}
.csub{font-size:0.82rem;color:var(--text2);line-height:1.55;margin-bottom:1.2rem;}
.irow{display:flex;gap:0.5rem;margin-bottom:1rem;}
.inp{flex:1;background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:0.75rem 1rem;font-family:'Instrument Sans',sans-serif;font-size:0.875rem;color:var(--text);outline:none;transition:border-color 0.2s;}
.inp:focus{border-color:var(--accent);}
.inp::placeholder{color:var(--muted);}
.ab{background:var(--accent);color:#0D0F0E;border:none;border-radius:10px;width:44px;height:44px;font-size:1.3rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity 0.15s,transform 0.1s;flex-shrink:0;}
.ab:hover{opacity:0.85;}
.ab:active{transform:scale(0.93);}
.alist{display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1.75rem;}
.ac{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:0.7rem 0.875rem;display:flex;align-items:center;justify-content:space-between;font-size:0.875rem;animation:sIn 0.2s ease;}
.xb{background:none;border:none;color:var(--muted);cursor:pointer;font-size:1rem;padding-left:0.75rem;transition:color 0.15s;}
.xb:hover{color:#F06680;}
.sb{width:100%;background:var(--accent);color:#0D0F0E;border:none;border-radius:12px;padding:0.9rem;font-family:'Instrument Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;transition:opacity 0.15s,transform 0.1s;}
.sb:hover{opacity:0.88;}
.sb:active{transform:scale(0.98);}
.empty{text-align:center;color:var(--muted);font-size:0.875rem;padding:2rem 0;line-height:1.6;}
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
.sw-wrap{flex:1;display:flex;flex-direction:column;align-items:center;padding:1rem 1.5rem 1.5rem;}
.pg{font-size:0.68rem;font-weight:600;letter-spacing:0.1em;color:var(--muted);align-self:flex-end;margin-bottom:1.2rem;}
.stk{width:100%;position:relative;height:240px;margin-bottom:1.5rem;}
.card{position:absolute;width:100%;background:var(--s2);border-radius:18px;border:1px solid var(--border);padding:1.75rem 1.5rem;user-select:none;cursor:grab;display:flex;flex-direction:column;justify-content:center;min-height:200px;}
.card.dg{cursor:grabbing;}
@keyframes swL{to{transform:translateX(-150%) rotate(-18deg);opacity:0;}}
@keyframes swR{to{transform:translateX(150%) rotate(18deg);opacity:0;}}
@keyframes swU{to{transform:translateY(-110%) scale(0.88);opacity:0;}}
.card.al{animation:swL 0.32s ease forwards;}
.card.ar{animation:swR 0.32s ease forwards;}
.card.au{animation:swU 0.32s ease forwards;}
.card.aa{animation:swU 0.32s ease forwards;}
.clbl{font-size:0.6rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:0.6rem;}
.ctxt{font-family:'Fraunces',serif;font-size:1.15rem;font-weight:500;line-height:1.4;color:var(--text);}
.chnt{font-size:0.72rem;color:var(--muted);margin-top:1rem;font-style:italic;}
.ind{position:absolute;font-size:0.63rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:3px 10px;border-radius:20px;opacity:0;transition:opacity 0.12s;pointer-events:none;border:1px solid;}
.ind.show{opacity:1;}
.ctrls{display:flex;flex-direction:column;gap:0.45rem;width:100%;}
.crow{display:flex;gap:0.45rem;justify-content:center;}
.cb{border:1px solid var(--border);background:var(--s2);border-radius:10px;padding:0.5rem 0.75rem;font-size:0.67rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;gap:0.3rem;justify-content:center;transition:all 0.15s;flex:1;font-family:'Instrument Sans',sans-serif;}
.cb:hover{transform:scale(1.03);}
.cb:active{transform:scale(0.97);}
.aib{border:1px dashed var(--border);background:transparent;border-radius:10px;padding:0.38rem 1rem;font-size:0.68rem;font-style:italic;color:var(--muted);cursor:pointer;transition:all 0.15s;align-self:center;font-family:'Instrument Sans',sans-serif;}
.aib:hover{color:var(--text2);border-color:var(--muted);}
@keyframes fIn{from{opacity:0;}to{opacity:1;}}
@keyframes bIn{0%{transform:scale(0.2);opacity:0;}50%{transform:scale(1.2);}70%{transform:scale(0.92);}100%{transform:scale(1);opacity:1;}}
.done-overlay{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg);z-index:100;animation:fIn 0.35s ease;}
.done-icon{font-size:3.5rem;margin-bottom:1rem;animation:bIn 0.5s cubic-bezier(0.36,0.07,0.19,0.97);}
.done-title{font-family:'Fraunces',serif;font-size:1.5rem;font-weight:500;margin-bottom:0.4rem;}
.done-sub{font-size:0.85rem;color:var(--text2);margin-bottom:1.75rem;text-align:center;max-width:260px;line-height:1.55;}
.done-btn{background:var(--accent);color:#0D0F0E;border:none;border-radius:12px;padding:0.8rem 1.75rem;font-family:'Instrument Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;transition:opacity 0.15s;}
.done-btn:hover{opacity:0.85;}
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
.ttm{font-size:0.7rem;color:var(--muted);font-style:italic;white-space:nowrap;}
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
.ht{font-family:'Fraunces',serif;font-size:1.2rem;font-weight:500;margin-bottom:0.3rem;}
.hs{font-size:0.82rem;color:var(--text2);line-height:1.5;margin-bottom:1.2rem;}
.ai-notice{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:1.25rem;text-align:center;}
.ai-notice-icon{font-size:2rem;margin-bottom:0.75rem;}
.ai-notice-title{font-family:'Fraunces',serif;font-size:1rem;font-weight:500;margin-bottom:0.4rem;}
.ai-notice-sub{font-size:0.8rem;color:var(--text2);line-height:1.6;}
.ai-notice-code{background:var(--s3);border-radius:6px;padding:0.5rem 0.75rem;font-family:monospace;font-size:0.75rem;color:var(--accent);margin-top:0.75rem;text-align:left;word-break:break-all;}
.hi{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:0.75rem;animation:sIn 0.2s ease;}
.hd{font-size:0.63rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:0.45rem;}
.hsu{display:flex;gap:0.35rem;flex-wrap:wrap;margin-bottom:0.6rem;}
.htg{font-size:0.68rem;font-weight:500;padding:3px 8px;border-radius:6px;}
.hax{font-size:0.77rem;color:var(--text2);line-height:1.6;}
.har{display:flex;align-items:center;gap:0.35rem;margin-bottom:0.2rem;}
.hdt{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
`

export default function App() {
  const [purposes, setPurposes]       = useState(DEFAULT_PURPOSES)
  const [editingP, setEditingP]       = useState(null)
  const [phase, setPhase]             = useState('capture')
  const [tab, setTab]                 = useState('capture')
  const [input, setInput]             = useState('')
  const [actions, setActions]         = useState([
    'Lanzar Pathly en Product Hunt',
    'Aprender diseño tipográfico',
    'Escribir artículo sobre mi proyecto',
  ])
  const [queue, setQueue]             = useState([])
  const [idx, setIdx]                 = useState(0)
  const [anim, setAnim]               = useState(null)
  const [indicator, setIndicator]     = useState(null)
  const [classified, setClassified]   = useState({})
  const [showDone, setShowDone]       = useState(false)
  const [checked, setChecked]         = useState({})
  const [dashOpinion, setDashOpinion] = useState(null)
  const [sessions, setSessions]       = useState([])

  const drag = useRef({ sx: 0, sy: 0, on: false })
  const cardRef = useRef(null)

  const cfw = useMemo(() => {
    const o = {}
    purposes.forEach(p => { o[p.id] = classified[p.id] || [] })
    o.ai = classified.ai || []
    return o
  }, [purposes, classified])

  const allItems = useMemo(() =>
    Object.entries(cfw).flatMap(([k, arr]) =>
      arr.map(a => ({ action: a, pid: k }))
    ), [cfw])

  const totalCount     = allItems.length
  const completedCount = allItems.filter((_, i) => checked[`i${i}`]).length
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const addAction = () => {
    const v = input.trim()
    if (!v) return
    setActions(p => [...p, v])
    setInput('')
  }

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
      actions: [...actions],
      classified: { ...classified },
      purposes: purposes.map(p => ({ ...p }))
    }, ...prev])
    setPhase('results')
    setTab('tracker')
  }

  const onMD = (e) => {
    const t = e.touches?.[0] || e
    drag.current = { sx: t.clientX, sy: t.clientY, on: true }
  }
  const onMM = (e) => {
    if (!drag.current.on || !cardRef.current) return
    const t = e.touches?.[0] || e
    const dx = t.clientX - drag.current.sx
    const dy = t.clientY - drag.current.sy
    cardRef.current.style.transform = `translate(${dx}px,${dy}px) rotate(${dx * 0.07}deg)`
    if (Math.abs(dx) > Math.abs(dy)) setIndicator(dx > 35 ? 'r' : dx < -35 ? 'l' : null)
    else setIndicator(dy < -35 ? 'u' : null)
  }
  const onMU = (e) => {
    if (!drag.current.on) return
    drag.current.on = false
    if (cardRef.current) cardRef.current.style.transform = ''
    const t = e.changedTouches?.[0] || e
    const dx = t.clientX - drag.current.sx
    const dy = t.clientY - drag.current.sy
    if (Math.abs(dx) > 75) classify(dx > 0 ? (purposes[1]?.id || 'ai') : (purposes[2]?.id || 'ai'))
    else if (dy < -75) classify(purposes[0]?.id || 'ai')
    else setIndicator(null)
  }

  const updateP = (id, f, v) => setPurposes(prev => prev.map(p => p.id === id ? { ...p, [f]: v } : p))
  const addP    = () => {
    const id = `c${Date.now()}`
    setPurposes(prev => [...prev, { id, label: 'Nuevo', icon: '◇', color: '#80B8E0', weight: 1 }])
    setEditingP(id)
  }
  const removeP = (id) => {
    setPurposes(prev => prev.filter(p => p.id !== id))
    if (editingP === id) setEditingP(null)
  }

  const purposeCounts = useMemo(() => {
    const o = {}
    purposes.forEach(p => { o[p.id] = cfw[p.id]?.length || 0 })
    return o
  }, [purposes, cfw])

  const maxCount = Math.max(...Object.values(purposeCounts), 1)

  const dirs = useMemo(() => [
    purposes[0] && { ...purposes[0], pos: 'u', arrow: '↑' },
    purposes[1] && { ...purposes[1], pos: 'r', arrow: '→' },
    purposes[2] && { ...purposes[2], pos: 'l', arrow: '←' },
  ].filter(Boolean), [purposes])

  const extraDirs = purposes.slice(3)

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
          <div className="pill">
            {phase === 'capture' ? 'Captura' : phase === 'swipe' ? 'Clasifica' : 'Resultados'}
          </div>
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
                {t.label}
                {t.count ? <span className="bdg">{t.count}</span> : null}
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
              <input
                className="inp"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAction()}
                placeholder="Una acción o idea…"
              />
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
              ? <button className="sb" onClick={startSwipe}>
                  Clasificar {actions.length} acción{actions.length !== 1 ? 'es' : ''} →
                </button>
              : <div className="empty">Añade al menos una acción para comenzar.</div>
            }

            <div className="stl">Tus propósitos</div>
            {purposes.map(p => (
              <div key={p.id}>
                <div className={`prow ${editingP === p.id ? 'ed' : ''}`}
                  onClick={() => setEditingP(editingP === p.id ? null : p.id)}>
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
                    <input className="epi" value={p.label}
                      onChange={e => updateP(p.id, 'label', e.target.value)}
                      placeholder="Nombre del propósito…" />
                    <div className="epl">Icono</div>
                    <div className="ig">
                      {ICON_OPTIONS.map(ic => (
                        <button key={ic} className={`io ${p.icon === ic ? 'sel' : ''}`}
                          onClick={() => updateP(p.id, 'icon', ic)}>{ic}</button>
                      ))}
                    </div>
                    <div className="epl">Color</div>
                    <div className="cr">
                      {COLOR_SWATCHES.map(c => (
                        <div key={c} className={`co ${p.color === c ? 'sel' : ''}`}
                          style={{ background: c }} onClick={() => updateP(p.id, 'color', c)} />
                      ))}
                    </div>
                    <div className="wr">
                      <div className="wl">Peso</div>
                      <div className="wbs">
                        {[1, 2, 3].map(w => (
                          <button key={w} className={`wb ${p.weight === w ? 'sel' : ''}`}
                            onClick={() => updateP(p.id, 'weight', w)}>{w}</button>
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
            <div className="pg">{idx + 1} / {queue.length}</div>
            <div className="stk">
              {idx + 1 < queue.length && (
                <div className="card" style={{ transform: 'scale(0.95) translateY(10px)', opacity: 0.3, zIndex: 0 }} />
              )}
              <div
                className={`card ${anim ? `a${anim[0]}` : ''}`}
                style={{ zIndex: 1 }}
                ref={cardRef}
                onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
                onTouchStart={onMD} onTouchMove={onMM} onTouchEnd={onMU}
              >
                {dirs.map(d => (
                  <div key={d.id}
                    className={`ind ${indicator === d.pos ? 'show' : ''}`}
                    style={{
                      color: d.color, borderColor: d.color, background: d.color + '14',
                      ...(d.pos === 'u'
                        ? { top: '0.75rem', left: '50%', transform: 'translateX(-50%)' }
                        : d.pos === 'r'
                        ? { right: '1rem', top: '1.25rem' }
                        : { left: '1rem', top: '1.25rem' })
                    }}>
                    {d.icon} {d.label}
                  </div>
                ))}
                <div className="clbl">Acción {idx + 1}</div>
                <div className="ctxt">{queue[idx]}</div>
                <div className="chnt">Desliza o usa los botones</div>
              </div>
            </div>
            <div className="ctrls">
              <div className="crow">
                {dirs.map(d => (
                  <button key={d.id} className="cb"
                    style={{ color: d.color, borderColor: d.color + '55' }}
                    onClick={() => classify(d.id)}>
                    {d.arrow} {d.icon} {d.label}
                    {d.weight > 1 && <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>×{d.weight}</span>}
                  </button>
                ))}
              </div>
              {extraDirs.length > 0 && (
                <div className="crow">
                  {extraDirs.map(d => (
                    <button key={d.id} className="cb"
                      style={{ color: d.color, borderColor: d.color + '55' }}
                      onClick={() => classify(d.id)}>
                      {d.icon} {d.label}
                      {d.weight > 1 && <span style={{ fontSize: '0.58rem', opacity: 0.65 }}>×{d.weight}</span>}
                    </button>
                  ))}
                </div>
              )}
              <button className="aib" onClick={() => classify('ai')}>mantener · IA decide</button>
            </div>
          </div>
        )}

        {/* ── TRACKER ── */}
        {phase === 'results' && tab === 'tracker' && (
          <div className="content">
            {totalCount === 0 && (
              <div className="empty">Sin acciones clasificadas.<br />Ve a Captura para empezar.</div>
            )}
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
                        <div className="ck"
                          style={{ borderColor: done ? p.color : undefined, background: done ? p.color + '22' : undefined }}>
                          {done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke={p.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
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
                { label: 'Completadas', val: completedCount, sub: `de ${totalCount} acciones`,  color: 'var(--accent)' },
                { label: 'Progreso',    val: `${pct}%`,      sub: 'del total clasificado',       color: '#7EC8A0' },
                { label: 'Pendientes',  val: totalCount - completedCount, sub: 'por completar', color: '#F0A050' },
                { label: 'Sesiones',    val: sessions.length, sub: 'en el historial',            color: 'var(--muted)' },
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
                  <div className="btr">
                    <div className="bf" style={{ width: `${((purposeCounts[p.id] || 0) / maxCount) * 100}%`, background: p.color }} />
                  </div>
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
              <button className="ghost-btn" onClick={() => setDashOpinion('Conecta tu API Key de Gemini en src/App.jsx para activar esta función. El prompt ya está preparado en el Hangar IA.')}>
                ✦ Pedir opinión a la IA →
              </button>
            )}
          </div>
        )}

        {/* ── HANGAR IA ── */}
        {phase === 'results' && tab === 'hangar' && (
          <div className="content">
            <div className="ht">Hangar de la IA</div>
            <div className="hs">
              Aquí se conectará Gemini 2.0 Flash para analizar tus acciones con tus propósitos y pesos personalizados.
            </div>
            <div className="ai-notice">
              <div className="ai-notice-icon">⟡</div>
              <div className="ai-notice-title">Lista para conectar</div>
              <div className="ai-notice-sub">
                El prompt está preparado. Solo necesitas añadir tu API Key de Google AI Studio en una variable de entorno de Vercel.
              </div>
              <div className="ai-notice-code">
                VITE_GEMINI_KEY=tu_api_key_aquí
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div className="bt" style={{ marginBottom: '0.5rem' }}>Prompt que se enviará</div>
              <div style={{ background: 'var(--s3)', borderRadius: '10px', padding: '0.875rem 1rem', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text2)', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', border: '1px dashed var(--border)' }}>
{`Analiza estas acciones considerando los propósitos del usuario.

Propósitos (peso 1=normal, 2=importante, 3=crítico):
${purposes.map(p => `- ${p.label} (peso ${p.weight})`).join('\n')}

Responde SOLO en JSON:
[{"action":"...","purposes":[...],"time":"...","reasoning":"..."}]

Acciones:
${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`}
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab === 'history' && (
          <div className="content">
            {sessions.length === 0
              ? <div className="empty">Aquí aparecerán tus sesiones de clasificación.<br />Cada swipe completado queda registrado.</div>
              : sessions.map(s => (
                <div className="hi" key={s.id}>
                  <div className="hd">{formatDate(s.ts)}</div>
                  <div className="hsu">
                    {s.purposes.map(p => {
                      const cnt = (s.classified[p.id] || []).length
                      if (!cnt) return null
                      return (
                        <span key={p.id} className="htg" style={{ background: p.color + '18', color: p.color }}>
                          {p.icon} {p.label} · {cnt}
                        </span>
                      )
                    })}
                    {(s.classified['ai'] || []).length > 0 && (
                      <span className="htg" style={{ background: 'rgba(90,102,96,0.15)', color: 'var(--muted)' }}>
                        ⊕ IA · {s.classified['ai'].length}
                      </span>
                    )}
                  </div>
                  <div className="hax">
                    {s.actions.slice(0, 4).map((a, i) => {
                      const pid = Object.entries(s.classified).find(([, arr]) => arr.includes(a))?.[0]
                      const p   = s.purposes.find(x => x.id === pid)
                      return (
                        <div className="har" key={i}>
                          <div className="hdt" style={{ background: p?.color || 'var(--muted)' }} />
                          <span style={{ color: 'var(--text2)', fontSize: '0.77rem' }}>{a}</span>
                        </div>
                      )
                    })}
                    {s.actions.length > 4 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                        +{s.actions.length - 4} más…
                      </div>
                    )}
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
