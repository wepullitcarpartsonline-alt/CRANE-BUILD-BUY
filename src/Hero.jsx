import { useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { C, rng } from './lib.js'

const POLES = [180, 700, 1254]

function Container({ x, y, w = 250, color, label }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="92" fill={color} />
      <rect x={x} y={y} width={w} height="92" fill="url(#corr)" />
      <rect x={x} y={y} width={w} height="7" fill="#000" fillOpacity=".22" />
      <rect x={x + w - 34} y={y + 14} width="4" height="64" fill="#000" fillOpacity=".25" />
      <rect x={x + w - 22} y={y + 14} width="4" height="64" fill="#000" fillOpacity=".25" />
      <text x={x + 20} y={y + 60} className="stencil" fontSize="32">{label}</text>
    </g>
  )
}

// one work light on the crane jib; switches on in sequence with scroll
function Bulb({ x, i, p }) {
  const o = useTransform(p, [0.4 + i * 0.012, 0.43 + i * 0.012], [0, 1])
  return (
    <motion.g style={{ opacity: o }}>
      <circle cx={x} cy="176" r="7" fill={C.sodium} fillOpacity=".25" />
      <circle cx={x} cy="176" r="2.6" fill="#ffe2a8" />
    </motion.g>
  )
}

// lattice section between two x positions at a given top/bottom
function Truss({ x1, x2, y1, y2, step = 22, color }) {
  const pts = []
  for (let x = x1; x < x2; x += step) pts.push(`M${x} ${y2} L${Math.min(x + step / 2, x2)} ${y1} L${Math.min(x + step, x2)} ${y2}`)
  return (
    <g stroke={color} fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y1} strokeWidth="3" />
      <line x1={x1} y1={y2} x2={x2} y2={y2} strokeWidth="3" />
      <path d={pts.join(' ')} strokeWidth="1.6" />
    </g>
  )
}

function Tent({ x, color }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M0 404 L55 372 L110 404Z" fill={color} />
      <rect x="0" y="404" width="110" height="12" fill={color} />
      <path d="M0 416 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8" fill="none" stroke={color} strokeWidth="3" />
      <rect x="4" y="416" width="4" height="62" fill="#0e151c" />
      <rect x="102" y="416" width="4" height="62" fill="#0e151c" />
      <rect x="14" y="446" width="82" height="32" fill="#26313b" />
      <rect x="22" y="436" width="18" height="10" fill={C.muted} fillOpacity=".5" />
      <rect x="46" y="432" width="22" height="14" fill={C.muted} fillOpacity=".35" />
    </g>
  )
}

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const sunY = useTransform(p, [0, 0.7], [0, 260])
  const night = useTransform(p, [0.05, 0.6], [0, 1])
  const lights = useTransform(p, [0.28, 0.42], [0, 1])
  const flicker = useTransform(p, [0.28, 0.31, 0.33, 0.36, 0.42], [0, 0.8, 0.2, 0.9, 1])
  const stars = useTransform(p, [0.3, 0.75], [0, 1])
  const copyY = useTransform(p, [0, 1], [0, -120])
  const copyO = useTransform(p, [0.45, 0.8], [1, 0.15])
  const sceneY = useTransform(p, [0, 1], [0, -40])

  // crane: trolley runs in along the jib, then lowers the load onto the stack
  const [pv, setPv] = useState(0)
  useMotionValueEvent(p, 'change', setPv)
  const k = (a, b) => Math.min(1, Math.max(0, (pv - a) / (b - a)))
  const sm = (t) => t * t * (3 - 2 * t)
  const tx = 1290 + (1010 - 1290) * sm(k(0.04, 0.36))
  const ctop = 212 + (290 - 212) * sm(k(0.34, 0.58))
  const beacon = useTransform(p, [0.08, 0.4], [0.35, 1])
  const spot = `M${tx - 7} 184 L${tx + 7} 184 L${tx + 150} ${ctop + 4} L${tx - 150} ${ctop + 4}Z`
  const bulbs = Array.from({ length: 13 }, (_, i) => 1430 - i * 42)

  const starList = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 90 }, () => ({ x: r() * 1600, y: r() * 520, s: 0.6 + r() * 1.6, o: 0.3 + r() * 0.7 }))
  }, [])

  const words = [['BUBs'], ['Build', '&', 'Buy'], ['Contractor', 'Commons']]

  return (
    <header ref={ref} className="hero" id="top" data-chapter="The yard">
      <div className="hero-pin">
        <div className="sky" />
        <motion.div className="sky-night" style={{ opacity: night }} />
        <motion.svg className="stars" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMin slice" style={{ opacity: stars }} aria-hidden="true">
          {starList.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={C.ink} fillOpacity={s.o} />)}
        </motion.svg>

        <motion.div className="hero-copy wrap" style={{ y: copyY, opacity: copyO }}>
          <div className="eyebrow mono">Est. 2026 <b>/</b> Businesses Unifying Business</div>
          <h1 aria-label="BUBs Build & Buy, Contractor Commons">
            {words.map((line, li) => (
              <span className={`line ${li === 0 ? 'brand' : li === 1 ? 'hot' : 'sub'}`} key={li} aria-hidden="true">
                {line.map((w, wi) => (
                  <span className="mask" key={wi}>
                    <motion.span
                      initial={{ y: '105%' }}
                      animate={{ y: '0%' }}
                      transition={{ duration: 0.9, delay: 0.15 + li * 0.18 + wi * 0.06, ease: [0.2, 0.7, 0.1, 1] }}
                    >{w}</motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p className="lede" initial={{ opacity: 0.001, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
            BUBs is a contractor-yard and public marketplace designed to serve the trades in a new way. It provides contractors, builders, and vendors with a secure operational base during the week, then converts into an active weekend marketplace where businesses can sell, connect, and reach the public directly.
          </motion.p>
          <div className="chips">
            <span className="chip next mono"><i />Concept design</span>
          </div>
        </motion.div>

        <motion.svg className="scene" viewBox="0 0 1600 640" preserveAspectRatio="xMaxYMax slice" style={{ y: sceneY }} role="img"
          aria-label="A gravel storage yard at dusk: stacked shipping containers, a work trailer, market tents, and floodlights that switch on as the sun sets">
          <defs>
            <pattern id="corr" width="14" height="10" patternUnits="userSpaceOnUse"><rect width="7" height="10" fill="#000" fillOpacity=".14" /></pattern>
            <radialGradient id="sunglow"><stop offset="0" stopColor="#ffd28a" stopOpacity=".9" /><stop offset=".35" stopColor="#ff9a4d" stopOpacity=".45" /><stop offset="1" stopColor="#ff7a3d" stopOpacity="0" /></radialGradient>
            <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.sodium} stopOpacity=".55" /><stop offset="1" stopColor={C.sodium} stopOpacity="0.04" /></linearGradient>
            <radialGradient id="pool"><stop offset="0" stopColor={C.sodium} stopOpacity=".42" /><stop offset="1" stopColor={C.sodium} stopOpacity="0" /></radialGradient>
          </defs>

          <motion.g style={{ y: sunY }}>
            <circle cx="1000" cy="250" r="230" fill="url(#sunglow)" />
            <circle cx="1000" cy="250" r="74" fill="#ffc46b" />
          </motion.g>

          <path d="M0 330 C200 282 380 302 560 288 C760 272 900 312 1100 294 C1300 278 1450 302 1600 286 L1600 640 L0 640Z" fill={C.hill1} />
          <path d="M0 402 C260 362 520 392 800 374 C1080 358 1340 394 1600 372 L1600 640 L0 640Z" fill={C.hill2} />

          <g stroke="#3a4753" strokeWidth="2">
            <line x1="0" y1="440" x2="1600" y2="440" />
            <line x1="0" y1="456" x2="1600" y2="456" />
            {Array.from({ length: 17 }, (_, i) => <line key={i} x1={i * 100} y1="428" x2={i * 100} y2="480" strokeWidth="3" />)}
          </g>

          <rect x="0" y="476" width="1600" height="164" fill={C.ground} />
          <rect x="0" y="476" width="1600" height="3" fill="#2a3138" />
          {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={(i * 211) % 1600} cy={490 + ((i * 53) % 140)} r={1 + (i % 3) * 0.6} fill="#2c343b" />)}

          {POLES.map((x) => (
            <motion.ellipse key={x} cx={x} cy="560" rx="260" ry="60" fill="url(#pool)" style={{ opacity: lights }} />
          ))}

          {/* tower crane — stands at the back right, jib reaches left over the stack */}
          <g>
            <rect x="1428" y="470" width="44" height="10" fill="#2a333c" />
            <g stroke="#c9902c" fill="none">
              <line x1="1438" y1="470" x2="1438" y2="172" strokeWidth="3" />
              <line x1="1462" y1="470" x2="1462" y2="172" strokeWidth="3" />
              <path d={Array.from({ length: 14 }, (_, i) => `M1438 ${470 - i * 21.3} L1462 ${470 - (i + 0.5) * 21.3} L1438 ${470 - (i + 1) * 21.3}`).join(' ')} strokeWidth="1.6" />
            </g>
            <path d="M1438 162 L1450 128 L1462 162" fill="none" stroke="#c9902c" strokeWidth="3" />
            <line x1="1450" y1="130" x2="930" y2="162" stroke="#8a6a2e" strokeWidth="1.4" />
            <line x1="1450" y1="130" x2="1584" y2="162" stroke="#8a6a2e" strokeWidth="1.4" />
            <Truss x1={900} x2={1450} y1={162} y2={174} color="#d99a2b" />
            <Truss x1={1450} x2={1598} y1={162} y2={172} step={20} color="#d99a2b" />
            <rect x="1548" y="172" width="46" height="28" fill="#4a5058" />
            <rect x="1548" y="172" width="46" height="5" fill="#5c636c" />
            <rect x="1406" y="174" width="32" height="24" rx="2" fill="#c9902c" />
            <motion.rect x="1412" y="179" width="18" height="11" fill="#ffd27a" style={{ opacity: lights }} />
            {bulbs.map((x, i) => <Bulb key={x} x={x} i={i} p={p} />)}
            <motion.g style={{ opacity: beacon }}>
              {[[1450, 126], [902, 160], [1594, 160]].map(([x, y]) => (
                <g key={x} className="beacon">
                  <circle cx={x} cy={y} r="10" fill="#ff3b2f" fillOpacity=".28" />
                  <circle cx={x} cy={y} r="3.4" fill="#ff5a4a" />
                </g>
              ))}
            </motion.g>
          </g>

          <g transform="translate(560 446)">
            <rect x="0" y="0" width="110" height="34" fill="#2f3b46" />
            <rect x="0" y="0" width="110" height="6" fill="#3d4b58" />
            <line x1="110" y1="26" x2="146" y2="26" stroke="#2f3b46" strokeWidth="6" />
            <circle cx="30" cy="42" r="12" fill="#0d1318" /><circle cx="64" cy="42" r="12" fill="#0d1318" />
          </g>

          <Container x={760} y={384} color="#a8462a" label="BUBs 0001" />
          <Container x={1018} y={384} color="#33607f" label="BUBs 0002" />
          {/* trolley, cable, spotlight and the load */}
          <rect x={tx - 16} y="174" width="32" height="10" rx="2" fill="#2f3a44" />
          <motion.path d={spot} fill="url(#cone)" style={{ opacity: lights, mixBlendMode: 'screen' }} />
          <line x1={tx} y1="184" x2={tx} y2={ctop - 30} stroke="#1a2026" strokeWidth="2.5" />
          <g transform={`translate(${tx} ${ctop})`}>
            <rect x="-9" y="-34" width="18" height="14" rx="2" fill="#d99a2b" />
            <path d="M0 -20 L-118 0 M0 -20 L118 0" stroke="#1a2026" strokeWidth="1.8" fill="none" />
            <Container x={-140} y={0} w={280} color="#4f6a43" label="BUILD & BUY" />
          </g>

          <Tent x={1258} color={C.sodium} />
          <Tent x={1372} color={C.corten} />
          <Tent x={1486} color={C.steel} />
          <text x="1258" y="352" className="mono-svg" fontSize="16">WEEKEND MARKET</text>

          {POLES.map((x) => (
            <g key={x}>
              <rect x={x - 4} y="150" width="8" height="330" fill="#26313b" />
              <rect x={x - 26} y="142" width="52" height="14" rx="3" fill="#2f3c48" />
              <motion.rect x={x - 22} y="154" width="44" height="6" rx="2" fill={C.sodium} style={{ opacity: flicker }} />
              <motion.path d={`M${x - 22} 160 L${x + 22} 160 L${x + 190} 520 L${x - 190} 520Z`} fill="url(#cone)" style={{ opacity: flicker, mixBlendMode: 'screen' }} />
            </g>
          ))}
        </motion.svg>

        <div className="scroll-cue mono" aria-hidden="true"><span />Scroll to light the yard</div>
      </div>
    </header>
  )
}
