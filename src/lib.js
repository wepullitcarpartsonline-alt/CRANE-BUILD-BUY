import { useEffect, useState } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

// Mirrors the CSS tokens for SVG math (single committed night palette)
export const C = {
  bg: '#0b131c', panel: '#15222f', line: '#283a4c', ink: '#edf0ea', muted: '#95a6b4',
  sodium: '#ffb547', corten: '#e2683f', steel: '#62a3d6', moss: '#8fb877', go: '#5fd08f',
  dot: '#3c4f62', hill1: '#17283a', hill2: '#112030', ground: '#1b2126',
}

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
export const mix = (a, b, t) => {
  const A = hex(a), B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`
}
export function rng(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => ((s = (s * 16807) % 2147483647), (s - 1) / 2147483646)
}

// Scroll progress of an element as React state (0..1)
export function useLocalProgress(ref, offset = ['start start', 'end end']) {
  const { scrollYProgress } = useScroll({ target: ref, offset })
  const [p, setP] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', setP)
  useEffect(() => { setP(scrollYProgress.get()) }, [scrollYProgress])
  return [p, scrollYProgress]
}
