import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { C, clamp, useLocalProgress } from './lib.js'
import Hero from './Hero.jsx'
import LeadFlow from './LeadFlow.jsx'
import Market from './Market.jsx'
import Trailer from './Trailer.jsx'

const CHAPTERS = [
  ['top', 'BUBs'], ['start', 'The idea'], ['engine', 'A weekend'], ['turn', 'The market'],
  ['market', 'Three sides'], ['trailer', 'The week'], ['network', 'The network'], ['flywheel', 'How BUBs grows'],
]

function Progress() {
  const { scrollYProgress } = useScroll()
  const x = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  return <motion.div className="progress" style={{ scaleX: x }} aria-hidden="true" />
}

function ChapterNav() {
  const [active, setActive] = useState('top')
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.45
      let cur = 'top'
      CHAPTERS.forEach(([id]) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= mid) cur = id
      })
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const go = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <nav className="chapnav" aria-label="Chapters">
      {CHAPTERS.map(([id, label]) => (
        <a key={id} href={`#${id}`} onClick={go(id)} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined}>
          <span className="lbl mono">{label}</span><i />
        </a>
      ))}
    </nav>
  )
}

function Reveal({ children, className, delay = 0, as = 'div' }) {
  const M = motion[as]
  return (
    <M className={className} initial={{ y: 28, opacity: 0.35 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.1, 1] }}>
      {children}
    </M>
  )
}

function Start() {
  const tiers = [
    ['Not', 'Self-storage', 'Storage is where gear goes to sit. Here it sits forty feet from the next buyer.', C.muted],
    ['Not', 'A supply store', 'No single category. Whatever came off a job Friday is on the row Saturday.', C.muted],
    ['Not', 'A strip mall', 'No storefront leases. Gravel, containers, canopies and one gate.', C.muted],
    ['It is', 'A contractor yard and a marketplace, behind one gate', 'A home base for the trades all week. A market for the whole town every weekend.', C.sodium],
  ]
  return (
    <section className="block" id="start">
      <div className="wrap split">
        <Reveal className="sec-head">
          <div className="eyebrow mono">01 <b>/</b> The idea</div>
          <h2>Nothing out there looks like this</h2>
          <p className="lede">Contractors have always had two choices: rent a storage spot where nothing happens, or drive across the county to buy what they need. We put the yard, the suppliers and the customers in the same place.</p>
          <p className="lede">Chain link with privacy screen, one controlled gate, pole lights and cameras on the drive. Compacted gravel built for loaded trucks, with room to back in a 40-footer. Open pads, 20- and 40-foot containers, and a market row with canopy slots.</p>
        </Reveal>
        <div className="tiers">
          <p className="mono label">What BUBs is</p>
          {tiers.map(([t, h, b, c], i) => (
            <Reveal className="tier" key={t} delay={i * 0.08}>
              <span className="mono" style={{ color: c }}>{t}</span>
              <div><strong>{h}</strong><span>{b}</span></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Turn() {
  const ref = useRef(null)
  const [p] = useLocalProgress(ref, ['start 0.85', 'end 0.55'])
  const words = 'Every yard rents space. Ours throws a market.'.split(' ')
  return (
    <section className="turn" id="turn" ref={ref}>
      <div className="wrap turn-grid">
        <div>
          <div className="eyebrow mono">03 <b>/</b> The market</div>
          <p className="turn-big" aria-label="Every yard rents space. Ours throws a market.">
            {words.map((w, i) => {
              const o = 0.18 + 0.82 * clamp(p * (words.length + 2) - i)
              const hot = i >= 4
              return <span key={i} aria-hidden="true" style={{ opacity: o, color: hot ? C.corten : undefined }}>{w} </span>
            })}
          </p>
        </div>
        <Reveal as="p" className="turn-body">
          Saturday morning the gate swings open. Music is playing, the food trucks are already serving, and the rows are full of windows, lumber, paint and tools at contractor prices. Someone is learning crown molding under a canopy. A family walks the yard, talks with three contractors, grabs paint samples, and leaves with a crew lined up for their kitchen. That is the whole idea: the market is the heart of BUBs.
        </Reveal>
      </div>
    </section>
  )
}

function Network() {
  const rows = [
    ['Crews', 'Teams that form on the spot', 'Picture a family that talks to three contractors at the market and signs before they leave. The framer, the electrician and the painter they met could become one crew for that job.', C.corten],
    ['Shared', 'A hand when you need one', 'A business short-handed on a pour could borrow someone from two pads down for the day. A tile setter might teach the Saturday class. Skills could move around the yard the way tools do.', C.steel],
    ['Remote', 'A new state, without the move', 'An out-of-state wholesaler could drop off inventory for the month and sell on the market row every weekend, reaching a whole new state without a storefront or a road trip.', C.sodium],
    ['Staffed', 'A tent that runs without you', 'If they cannot send anyone, a Twin Angel sponsee could work their tent, paid by the wholesaler, learning to sell and meeting the trades face to face.', C.moss],
    ['Food', 'A reason to stay', 'Food trucks and local kitchens could have a row of their own. A family that eats stays longer, and a longer visit leaves room for more conversations.', C.sodium],
  ]
  return (
    <section className="block" id="network">
      <div className="wrap split">
        <Reveal className="sec-head">
          <div className="eyebrow mono">06 <b>/</b> The network</div>
          <h2>What the yard could spark</h2>
          <p className="lede">This is the part we are most excited about. Put enough businesses behind one gate and things can happen that no single business could pull off alone. BUBs stands for Businesses Unifying Business, and this is what we hope the yard makes room for.</p>
        </Reveal>
        <div className="tiers">
          <p className="mono label">What it could make possible</p>
          {rows.map(([t, h, b, c], i) => (
            <Reveal className="tier" key={t} delay={i * 0.06}>
              <span className="mono" style={{ color: c }}>{t}</span>
              <div><strong>{h}</strong><span>{b}</span></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Flywheel() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rot = useTransform(scrollYProgress, [0, 1], [-70, 110])
  const counter = useTransform(rot, (v) => -v)
  const nodes = [
    ['Land', 'BUBs holds', -90], ['Operator', 'leases site', 0], ['Market', 'comes alive', 90], ['Next site', 'BUBs adds', 180],
  ]
  const R = 168
  return (
    <section className="block" id="flywheel" ref={ref}>
      <div className="wrap split center">
        <Reveal className="sec-head">
          <div className="eyebrow mono">07 <b>/</b> How BUBs grows</div>
          <h2>The land stays with us</h2>
          <p className="lede">BUBs Properties secures the land. A local operator leases the site and opens a BUBs with our playbook: the yard layout, the vendor lineup, the market-day run of show, the classes and events, the brand. The operator builds a business in their town. BUBs keeps the ground under it.</p>
          <p className="lede">That matters. We never sell the land, so every site stays part of BUBs. The site lease pays BUBs on top of the business itself. If an operator ever moves on, the yard and its market stay under the BUBs name and can reopen with someone new. Each new site grows two things at once: a portfolio of land, and a community of vendors, contractors and weekend crowds. Anyone can copy a fence or a Saturday market. Nobody can quickly copy a chain of yards that are already alive.</p>
          <div className="keep">
            <div><span className="mono">Same at every BUBs</span><ul><li>The name and the feel</li><li>Pads, containers, load lanes, market row</li><li>Vendor curation</li><li>Market-day run of show</li><li>Classes, expos, food trucks, music</li><li>Site lease with BUBs Properties</li></ul></div>
            <div><span className="mono">Made local</span><ul><li>Rents and vendor prices</li><li>What sells in that town</li><li>Market days and hours</li><li>Local trades and food trucks</li><li>The town's own events</li></ul></div>
          </div>
        </Reveal>
        <svg className="wheel" viewBox="0 0 460 460" role="img" aria-label="Loop: BUBs holds the land, a local operator leases the site, the market comes alive, BUBs adds the next site">
          <defs>
            <marker id="m-w" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill={C.sodium} /></marker>
          </defs>
          <motion.g style={{ rotate: rot, originX: '230px', originY: '230px', transformBox: 'view-box' }}>
            <circle cx="230" cy="230" r={R} fill="none" stroke={C.line} strokeWidth="2" />
            {[0, 1, 2, 3].map((q) => {
              const a0 = ((q * 90 - 90 + 24) * Math.PI) / 180, a1 = ((q * 90 - 90 + 66) * Math.PI) / 180
              return <path key={q} d={`M${230 + R * Math.cos(a0)} ${230 + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${230 + R * Math.cos(a1)} ${230 + R * Math.sin(a1)}`} fill="none" stroke={C.sodium} strokeWidth="3" markerEnd="url(#m-w)" />
            })}
            {nodes.map(([a, b, deg]) => {
              const r = (deg * Math.PI) / 180
              return (
                <g key={a} transform={`translate(${230 + R * Math.cos(r)} ${230 + R * Math.sin(r)})`}>
                  <motion.g style={{ rotate: counter }}>
                    <circle r="50" fill={C.panel} stroke={C.line} strokeWidth="2" />
                    <text y="-2" textAnchor="middle" className="wheel-t">{a}</text>
                    <text y="17" textAnchor="middle" className="svg-label" fill={C.muted}>{b}</text>
                  </motion.g>
                </g>
              )
            })}
          </motion.g>
          <text x="230" y="244" textAnchor="middle" className="wheel-c">BUBs</text>
        </svg>
      </div>
    </section>
  )
}

function Close() {
  return (
    <section className="close">
      <div className="wrap">
        <Reveal as="h2">Build here. <span>Buy here.</span></Reveal>
        <Reveal as="p" delay={0.1}>We combine infrastructure, commerce, visibility, and community into one physical destination — creating a place where the construction and trade economy can work, gather, and grow.</Reveal>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <Progress />
      <ChapterNav />
      <Hero />
      <main>
        <Start />
        <LeadFlow />
        <Turn />
        <Market />
        <Trailer />
        <Network />
        <Flywheel />
        <Close />
      </main>
      <footer>
        <div className="wrap mono">
          <span>© 2026 BUBs Trading Co. · Businesses Unifying Business · Est. 2026</span>
          <span>BUBs Build &amp; Buy · Contractor Commons · concept design</span>
        </div>
      </footer>
    </>
  )
}
