import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { C, clamp, useLocalProgress } from './lib.js'

const STEPS = [
  { k: 'The yard', pay: 'Fenced · lit · gated', center: 'one gate', body: 'A graveled yard with pads, containers, load lanes and a market row. Three kinds of people are about to share it, and each one makes the yard better for the other two.' },
  { k: 'The contractor', pay: 'Open pad $185/mo · Container $325/mo', center: '+ contractors', body: 'Rents a pad, keeps materials and iron behind the gate, and stages jobs from here. Buys from the wholesaler forty feet away instead of losing a morning driving to town. On Saturday, the customers walk right up to the truck.' },
  { k: 'The wholesaler', pay: 'Vendor slot $75/weekend', center: '+ wholesalers', body: 'Takes a slot with no storefront lease. Sells to the trades all week and to the public on the weekend. Learns what moves, comes back with better stock, and grabs a bigger spot.' },
  { k: 'The family', pay: 'Free entry · contractor pricing', center: '+ the town', body: 'Comes for the food trucks and the music. Finds windows and paint at contractor prices. Asks the seller a question, gets introduced to a contractor, and walks out with a job lined up.' },
  { k: 'Every side feeds the next', pay: 'One address, three sides', center: 'three sides, one lot', body: 'A family talks with three contractors, grabs paint samples, catches a crown molding class, and signs before they leave. The contractors they met could become one crew for the job. Better weekends bring more vendors, and more vendors make better weekends.' },
]

function Node({ x, y, w, label, sub, on, color }) {
  return (
    <motion.g animate={{ opacity: on ? 1 : 0.16 }} transition={{ duration: 0.45 }}>
      <rect x={x - w / 2} y={y - 36} width={w} height="72" rx="6" fill={C.panel} stroke={on ? color : C.line} strokeWidth="2" />
      <text x={x} y={y + 2} textAnchor="middle" className="node-t">{label}</text>
      <text x={x} y={y + 24} textAnchor="middle" className="svg-label">{sub}</text>
    </motion.g>
  )
}

function Flow({ d, on, color, label, lx, ly, anchor = 'middle' }) {
  return (
    <motion.g animate={{ opacity: on ? 1 : 0.08 }} transition={{ duration: 0.45 }}>
      <path d={d} className="flow" stroke={color} markerEnd={`url(#m-${color === C.corten ? 'c' : 's'})`} />
      <text x={lx} y={ly} textAnchor={anchor} className="svg-label" style={{ fill: color, fontWeight: 600 }}>{label}</text>
    </motion.g>
  )
}

export default function Market() {
  const ref = useRef(null)
  const [p] = useLocalProgress(ref)
  const step = Math.min(STEPS.length - 1, Math.floor(clamp(p * 1.05) * STEPS.length))
  const has = (n) => step >= n

  return (
    <section ref={ref} className="pin" style={{ '--steps': STEPS.length }} id="market" data-chapter="Three sides">
      <div className="pin-inner market">
        <div className="market-copy">
          <div className="eyebrow mono">04 <b>/</b> The three-sided market</div>
          <h2>One address.<br />Three sides.</h2>
          <div className="stage-card" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
                <div className="stage-top"><span className="mono stage-tag">{STEPS[step].pay}</span></div>
                <h3>{STEPS[step].k}</h3>
                <p>{STEPS[step].body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="dots-nav" aria-hidden="true">
            {STEPS.map((_, i) => <span key={i} className={i <= step ? 'on' : ''} />)}
          </div>
        </div>

        <div className="market-vis">
          <svg viewBox="0 0 640 580" role="img" aria-label="Contractors and wholesalers pay the yard for space. Wholesalers sell materials to contractors and inventory to the public. The public brings weekend traffic and hires contractors for jobs.">
            <defs>
              <marker id="m-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill={C.corten} /></marker>
              <marker id="m-s" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill={C.steel} /></marker>
              <radialGradient id="yardglow"><stop offset="0" stopColor={C.sodium} stopOpacity=".35" /><stop offset="1" stopColor={C.sodium} stopOpacity="0" /></radialGradient>
            </defs>

            <motion.circle cx="320" cy="296" r="190" fill="url(#yardglow)" animate={{ opacity: step === 4 ? 1 : step > 0 ? 0.4 : 0.15 }} transition={{ duration: 0.6 }} />

            <Flow d="M320 114 L320 226" on={has(1)} color={C.corten} label="pad + container rent" lx={334} ly={176} anchor="start" />
            <Flow d="M150 458 L240 364" on={has(2)} color={C.corten} label="vendor slots" lx={180} ly={392} anchor="end" />
            <Flow d="M44 456 C 8 300, 60 140, 210 86" on={has(2)} color={C.steel} label="materials" lx={34} ly={270} anchor="start" />
            <Flow d="M490 458 L400 364" on={has(3)} color={C.steel} label="weekend traffic" lx={462} ly={392} anchor="start" />
            <Flow d="M596 456 C 632 300, 580 140, 430 86" on={has(3)} color={C.steel} label="jobs" lx={606} ly={270} anchor="end" />
            <Flow d="M230 494 L406 494" on={has(3)} color={C.steel} label="inventory" lx={318} ly={482} />

            <g>
              <rect x="210" y="234" width="220" height="124" rx="6" fill={C.ink} />
              <text x="320" y="282" textAnchor="middle" className="node-t" style={{ fill: C.bg, fontSize: 24 }}>BUBs COMMONS</text>
              <text x="320" y="316" textAnchor="middle" className="svg-label" style={{ fill: C.bg }}>{STEPS[step].center}</text>
            </g>

            <Node x={320} y={76} w={220} label="CONTRACTORS" sub="List 1 · any trade" on={has(1)} color={C.corten} />
            <Node x={120} y={494} w={210} label="WHOLESALERS" sub="List 2 · inventory" on={has(2)} color={C.steel} />
            <Node x={520} y={494} w={210} label="LOCAL PUBLIC" sub="weekend shoppers" on={has(3)} color={C.sodium} />
          </svg>
        </div>
      </div>
    </section>
  )
}
