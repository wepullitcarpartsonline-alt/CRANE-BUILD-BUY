import { useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { C, clamp, ease, lerp, mix, rng, useLocalProgress } from './lib.js'

// Core market flywheel from the BUBs master blueprint:
// SPACE -> OPERATORS -> SUPPLY -> TRAFFIC -> SALES + JOBS -> PROOF -> DENSITY
export const STAGES = [
  { k: 'The yard', tag: 'Friday night', body: <>Gravel raked, lights on, gate locked. A <b>fenced, lit yard</b> with open pads, containers, load lanes and an empty market row waiting for morning.</> },
  { k: 'Vendors', tag: '6 a.m. load-in', body: <>Contractors are already on their pads. Wholesalers roll onto the <b>market row</b> with windows, doors, lumber, paint, tools and a couple of work trucks for sale.</> },
  { k: 'Atmosphere', tag: 'The heart of it', body: <><b>Food trucks</b> fire up. <b>Live music</b> starts. A <b>how-to class</b> sets up under a canopy. It stops feeling like a yard and starts feeling like a Saturday.</> },
  { k: 'Crowd', tag: '8 a.m. gates open', body: <>Free parking, free entry. <b>Families, homeowners, flippers and the trades</b> all walk the same rows.</> },
  { k: 'Conversations', tag: 'On the rows', body: <>A family talks with <b>three different contractors</b>, grabs paint samples, and stops to watch someone learn crown molding.</> },
  { k: 'Deals', tag: 'Signed at the market', body: <>They sign before lunch. The contractors they met <b>could become one crew</b> for the job. A vendor runs short-handed, and the business next door <b>could lend an employee for the day</b>.</> },
  { k: 'Next weekend', tag: 'Louder', body: <>The vendors who sold out tell other vendors. The families tell their neighbors. <b>Every Saturday the yard gets louder.</b></> },
]

const NC = 16, NW = 8, NP = 28, NN = 10
const TYPE_C = { c: C.corten, w: C.steel, p: C.sodium, n: C.moss }

const pad = (i) => ({ x: 420 + (i % 4) * 44, y: 92 + Math.floor(i / 4) * 44 })
const slot = (j) => ({ x: 240 + j * 44, y: 318 })
const aisle = (k) => ({ x: 228 + (k % 14) * 24, y: 404 + Math.floor(k / 14) * 28 })
const wait = (m) => ({ x: 138 - (m % 2) * 26, y: 290 + Math.floor(m / 2) * 28 })

function build() {
  const r = rng(7)
  const dots = []
  const out = () => ({ sx: 22 + r() * 116, sy: 50 + r() * 420 })
  for (let i = 0; i < NC; i++) dots.push({ t: 'c', i, d: r(), ...out() })
  for (let i = 0; i < NW; i++) dots.push({ t: 'w', i, d: r(), ...out() })
  for (let i = 0; i < NP; i++) dots.push({ t: 'p', i, d: r(), ...out() })
  for (let i = 0; i < NN; i++) dots.push({ t: 'n', i, d: r(), ...out() })
  return dots
}

// public shopper k: k<16 buys from wholesaler k>>1; 16..23 hires contractor (k-16)*2
const sold = (k) => k < 24
const hiredC = (i) => i % 2 === 0
function dotAt(stage, d) {
  const S = { c: 0, ring: 0, chk: 0, o: 1, x: d.sx, y: d.sy }
  if (d.t === 'n') {
    if (stage < 6) return { ...S, o: 0, x: wait(d.i).x - 60, y: wait(d.i).y }
    return { ...S, ...wait(d.i), c: 1 }
  }
  if (d.t === 'p') {
    if (stage < 3) return { ...S, o: 0.18 }
    return { ...S, ...aisle(d.i), c: 1, chk: stage >= 5 && sold(d.i) ? 1 : 0 }
  }
  if (stage < 1) return S
  const pos = d.t === 'c' ? pad(d.i) : slot(d.i)
  const ring = d.t === 'w' && stage >= 2 ? 1 : 0
  const chk = stage >= 5 && (d.t === 'w' || hiredC(d.i)) ? 1 : 0
  return { ...S, ...pos, c: 1, ring, chk }
}

export default function LeadFlow() {
  const ref = useRef(null)
  const [p] = useLocalProgress(ref)
  const dots = useMemo(build, [])
  const last = STAGES.length - 1
  const s = clamp(p * 1.08 - 0.02) * last
  const i0 = Math.min(last - 1, Math.floor(s))
  const t = ease(clamp((s - i0 - 0.18) / 0.64))
  const active = Math.round(s)
  const ov = (k) => clamp(1 - Math.abs(s - k) * 1.9)
  const from = (k) => clamp((s - k + 0.5) / 0.5)

  const placed = dots.map((d) => {
    const A = dotAt(i0, d), B = dotAt(i0 + 1, d)
    const tt = clamp(t * 1.5 - d.d * 0.5)
    return { t: d.t, i: d.i, x: lerp(A.x, B.x, tt), y: lerp(A.y, B.y, tt), c: lerp(A.c, B.c, tt), ring: lerp(A.ring, B.ring, tt), chk: lerp(A.chk, B.chk, tt), o: lerp(A.o, B.o, tt) }
  })
  const byType = (ty) => placed.filter((d) => d.t === ty)
  const P = byType('p'), W = byType('w'), Cc = byType('c')
  const lineO = from(4) * (1 - clamp((s - 5.4) / 0.6) * 0.65)
  const yardO = 0.4 + 0.6 * Math.max(ov(0), 0.0)

  return (
    <section ref={ref} className="pin" style={{ '--steps': STAGES.length }} id="engine" data-chapter="Flywheel">
      <div className="pin-inner engine">
        <div className="engine-copy">
          <div className="eyebrow mono">02 <b>/</b> How a weekend works</div>
          <h2 className="engine-h">Not a storage yard.<br />An experience.</h2>
          <div className="stage-card" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
                <div className="stage-top">
                  <span className="mono stage-n">{String(active + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}</span>
                  <span className="mono stage-tag">{STAGES[active].tag}</span>
                </div>
                <h3>{STAGES[active].k}</h3>
                <p>{STAGES[active].body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <ol className="stepper" aria-label="Flywheel stages">
            {STAGES.map((st, k) => (
              <li key={st.k} className={k < active ? 'done' : k === active ? 'on' : ''}><span>{st.k}</span></li>
            ))}
          </ol>
          <div className="engine-stats">
            <div><b>24/7</b><span>gated access for tenants</span></div>
            <div><b>Mo-to-Mo</b><span>no long lease</span></div>
            <div><b>Sat–Sun</b><span>open market</span></div>
          </div>
        </div>

        <div className="engine-vis">
          <svg viewBox="0 0 600 520" role="img" aria-label={`Illustration of the yard at the ${STAGES[active].k} stage`}>
            {/* the yard: fence, gate, pads, market row */}
            <g opacity={yardO}>
              <path d="M170 380 L170 40 L584 40 L584 484 L170 484 L170 444" fill="none" stroke={C.muted} strokeWidth="2" strokeDasharray="6 5" />
              <line x1="170" y1="380" x2="170" y2="444" stroke={C.sodium} strokeWidth="3" strokeDasharray="2 6" />
              <text x="160" y="416" textAnchor="end" className="svg-label">Gate</text>
              {Array.from({ length: NC }, (_, i) => <rect key={i} x={pad(i).x - 18} y={pad(i).y - 18} width="36" height="36" rx="3" fill="none" stroke={C.line} />)}
              <text x="486" y="62" textAnchor="middle" className="svg-label">Pads + containers</text>
              {Array.from({ length: NW }, (_, j) => (
                <g key={j}>
                  <path d={`M${slot(j).x - 19} 300 L${slot(j).x} 288 L${slot(j).x + 19} 300Z`} fill="none" stroke={C.line} />
                  <rect x={slot(j).x - 19} y="300" width="38" height="34" fill="none" stroke={C.line} />
                </g>
              ))}
              <text x="394" y="278" textAnchor="middle" className="svg-label">Market row</text>
            </g>

            {/* atmosphere: food trucks, music, class tent — stays once it arrives */}
            <g style={{ opacity: from(2) }}>
              {[70, 120].map((y, k) => (
                <g key={y}>
                  <rect x="198" y={y} width="62" height="30" rx="3" fill={k ? C.corten : C.sodium} />
                  <rect x="260" y={y + 8} width="18" height="22" rx="2" fill={k ? C.corten : C.sodium} fillOpacity=".8" />
                  <rect x="208" y={y + 7} width="30" height="10" fill={C.bg} fillOpacity=".55" />
                  <circle cx="214" cy={y + 32} r="5" fill={C.bg} /><circle cx="262" cy={y + 32} r="5" fill={C.bg} />
                </g>
              ))}
              <text x="238" y="182" textAnchor="middle" className="svg-label" style={{ fill: C.sodium }}>Food trucks</text>
              <text x="338" y="100" textAnchor="middle" style={{ fill: C.sodium, fontSize: 30 }}>♪ ♫</text>
              <text x="338" y="126" textAnchor="middle" className="svg-label" style={{ fill: C.sodium }}>Live music</text>
              <path d="M300 214 L340 196 L380 214Z" fill={C.moss} />
              <rect x="300" y="214" width="80" height="26" fill={C.moss} fillOpacity=".35" stroke={C.moss} />
              <text x="340" y="232" textAnchor="middle" className="svg-label" style={{ fill: C.ink, fontSize: 11 }}>Class</text>
              <text x="340" y="258" textAnchor="middle" className="svg-label" style={{ fill: C.moss }}>How-to</text>
            </g>

            <g style={{ opacity: ov(1) }}>
              {Array.from({ length: NW }, (_, j) => (
                <g key={j}>
                  <rect x={slot(j).x - 15} y="338" width="10" height="8" fill={C.steel} fillOpacity=".6" />
                  <rect x={slot(j).x + 5} y="338" width="10" height="8" fill={C.steel} fillOpacity=".4" />
                </g>
              ))}
              <text x="394" y="372" textAnchor="middle" className="svg-label" style={{ fill: C.steel }}>Windows · lumber · paint · tools</text>
            </g>

            <g style={{ opacity: ov(3) }}>
              <text x="394" y="476" textAnchor="middle" className="svg-label" style={{ fill: C.sodium }}>Free parking · free entry</text>
            </g>

            {/* sales + jobs connectors */}
            <g opacity={lineO}>
              {P.map((d) => {
                if (d.i < 16) { const w = W[d.i >> 1]; return <line key={'s' + d.i} x1={d.x} y1={d.y} x2={w.x} y2={w.y} stroke={C.steel} strokeWidth="1.3" strokeOpacity=".7" /> }
                if (d.i < 24) { const c = Cc[(d.i - 16) * 2]; return <line key={'j' + d.i} x1={d.x} y1={d.y} x2={c.x} y2={c.y} stroke={C.corten} strokeWidth="1.3" strokeOpacity=".7" strokeDasharray="4 4" /> }
                return null
              })}
            </g>
            <g style={{ opacity: ov(4) }} className="svg-label">
              <line x1="196" y1="22" x2="220" y2="22" stroke={C.steel} strokeWidth="2" />
              <text x="226" y="27">paint samples</text>
              <line x1="380" y1="22" x2="404" y2="22" stroke={C.corten} strokeWidth="2" strokeDasharray="4 4" />
              <text x="410" y="27">talks w/ contractors</text>
            </g>

            <g style={{ opacity: ov(5) }}>
              <text x="377" y="27" textAnchor="middle" className="svg-label" style={{ fill: C.go }}>Deal signed · a crew forms</text>
            </g>

            <g style={{ opacity: ov(6) }}>
              <text x="74" y="270" textAnchor="middle" className="svg-label" style={{ fill: C.moss }}>More vendors</text>
              <text x="377" y="27" textAnchor="middle" className="svg-label" style={{ fill: C.moss }}>Every Saturday · louder</text>
            </g>

            {placed.map((d, i) => (
              <g key={i} transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`} opacity={d.o}>
                <circle r="11" fill="none" stroke={C.ink} strokeWidth="2" strokeOpacity={d.ring * 0.9} />
                <circle r={d.t === 'p' ? 6 : 7} fill={mix(C.dot, TYPE_C[d.t], d.c)} />
                <path d="M-3.2 0.2 L-1 2.6 L3.4 -2.4" fill="none" stroke={C.bg} strokeWidth="2" strokeLinecap="round" opacity={d.chk} />
              </g>
            ))}
          </svg>
          <div className="legend mono" aria-hidden="true">
            <span><i style={{ background: C.corten }} />Contractors</span>
            <span><i style={{ background: C.steel }} />Wholesalers</span>
            <span><i style={{ background: C.sodium }} />Public</span>
          </div>
        </div>
      </div>
    </section>
  )
}
