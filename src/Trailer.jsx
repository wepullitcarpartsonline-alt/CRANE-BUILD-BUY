import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { clamp, useLocalProgress } from './lib.js'

// Weekly operating rhythm from the master blueprint: one property, different modes of use
const STEPS = [
  { k: 'Every day: tenants work the yard', body: 'Tenants have the gate code around the clock. Pull the trailer in, drop the load, stage the job, lock the gate behind you.' },
  { k: 'Weekdays: trade inside the fence', body: 'Contractors source materials and wholesalers sell surplus to the trades all week. Operators stage jobs and connect with each other.' },
  { k: 'Saturday: the gate opens', body: 'Same yard, different crowd. Food trucks out front, music going, wholesalers selling to the public at contractor pricing. 8a to 4p.' },
  { k: 'Sunday: second market day', body: 'Market runs 9a to 2p. Free parking and entry, cash or card. Vendors set their own prices.' },
  { k: 'Event weekends', body: 'Some weekends turn into something bigger: a home show, a trade expo, a nonprofit drive, a demo day where you try a new tool on the lot before it hits stores. Classes run every market day.' },
]
const COLS = ['Mon–Fri', 'Sat', 'Sun']

function blocksFor(step) {
  const b = [{ id: 'T', lane: 1, col: 1, span: 3, label: 'Tenants · 24/7', sub: 'store · stage · load out', tone: 'free' }]
  if (step >= 1) b.push({ id: 'W', lane: 2, col: 1, span: 1, label: 'Trade', sub: 'contractors buy from vendors', tone: 'trade' })
  if (step >= 2) b.push({ id: 'S', lane: 2, col: 2, span: 1, label: 'Market', sub: '8a–4p', tone: 'paid' })
  if (step >= 3) b.push({ id: 'U', lane: 2, col: 3, span: 1, label: 'Market', sub: '9a–2p', tone: 'paid' })
  if (step >= 4) b.push({ id: 'D', lane: 3, col: 2, span: 2, label: 'Expos · demo days', sub: 'classes · food trucks · music', tone: 'event' })
  return b
}

export default function Trailer() {
  const ref = useRef(null)
  const [p] = useLocalProgress(ref)
  const step = Math.min(STEPS.length - 1, Math.floor(clamp(p * 1.05) * STEPS.length))
  const blocks = blocksFor(step)

  return (
    <section ref={ref} className="pin" style={{ '--steps': STEPS.length }} id="trailer" data-chapter="The week">
      <div className="pin-inner trailer">
        <div className="trailer-copy">
          <div className="eyebrow mono">05 <b>/</b> Weekly rhythm</div>
          <h2>One property.<br />Different modes.</h2>
          <div className="stage-card" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
                <div className="stage-top"><span className="mono stage-n">A week at the yard · {step + 1} / {STEPS.length}</span></div>
                <h3>{STEPS[step].k}</h3>
                <p>{STEPS[step].body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="trailer-vis">
          <div className="board-scroll">
            <div className="board" role="img" aria-label={`Week board, step ${step + 1}: ${STEPS[step].k}`}>
              <div className="b-corner" />
              {COLS.map((d, i) => <div key={d} className="b-day mono" style={{ gridColumn: i + 2, gridRow: 1 }}>{d}</div>)}
              <div className="b-lane free" style={{ gridRow: 2 }}><b>Tenants</b><span className="mono">Contractors + vendors</span></div>
              <div className="b-lane paid" style={{ gridRow: 3 }}><b>Trade</b><span className="mono">Buying + selling</span></div>
              <div className="b-lane later" style={{ gridRow: 4 }}><b>Events</b><span className="mono">The experience</span></div>
              {[2, 3, 4].map((r) => COLS.map((d, i) => <div key={r + d} className="b-cell" style={{ gridColumn: i + 2, gridRow: r }} />))}
              {blocks.map((bk) => (
                <motion.div
                  layout
                  key={bk.id}
                  className={`blk ${bk.tone}`}
                  style={{ gridColumn: `${bk.col + 1} / span ${bk.span}`, gridRow: bk.lane + 1 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                >
                  <b>{bk.label}</b><span>{bk.sub}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="trailer-facts">
            <div><span className="mono">What moves</span><p>Windows, doors and millwork overruns. Lumber and jobsite surplus. Tools and shop iron. Trailers and work trucks.</p></div>
            <div><span className="mono">Rules</span><p>Load-in from 6a, no reserved rows. Leave the pad the way you found it.</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}
