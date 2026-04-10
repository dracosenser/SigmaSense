// src/components/RadarChart.jsx
import { useMemo } from 'react'
import { CAT_COLORS, TOPICS, ratingColor } from '../data/topics'

export default function RadarChart({ ratings = {}, groups, size = 340 }) {
  const cx = size / 2
  const cy = size / 2 - 10
  const maxR = size * 0.37
  const N = groups.length
  const step = (Math.PI * 2) / N

  const getGroupRating = (ids) => {
    const vals = ids.map(id => ratings[id] || 1000)
    return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length)
  }

  const overall = useMemo(() => {
    const vals = TOPICS.map(t => ratings[t.id] || 1000)
    return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length)
  }, [ratings])

  // Grid rings
  const rings = [1,2,3,4,5].map(ring => {
    const r = maxR * (ring / 5)
    const pts = groups.map((_,i) => {
      const a = i * step - Math.PI / 2
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    }).join(' ')
    return { pts, r, rating: 500 + ring * 400 }
  })

  // Data polygon
  const dataPoints = groups.map((gr, i) => {
    const rt = getGroupRating(gr.ids)
    const frac = (rt - 500) / 2000
    const r = maxR * frac
    const a = i * step - Math.PI / 2
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), rt }
  })
  const dataPoly = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{overflow:'visible'}}>
      {/* Ring labels */}
      {rings.map((ring, i) => (
        <text key={i}
          x={cx + 4} y={cy - ring.r + 10}
          fill="rgba(0,240,255,0.2)"
          fontFamily="Share Tech Mono,monospace" fontSize="8">
          {ring.rating}
        </text>
      ))}

      {/* Grid rings */}
      {rings.map((ring, i) => (
        <polygon key={i}
          points={ring.pts}
          fill="none"
          stroke="rgba(0,240,255,0.07)"
          strokeWidth="1" />
      ))}

      {/* Axes */}
      {groups.map((_, i) => {
        const a = i * step - Math.PI / 2
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + maxR * Math.cos(a)}
            y2={cy + maxR * Math.sin(a)}
            stroke="rgba(0,240,255,0.1)"
            strokeWidth="1" />
        )
      })}

      {/* Data polygon fill */}
      <polygon
        points={dataPoly}
        fill="rgba(0,240,255,0.07)"
        stroke="none" />

      {/* Data polygon stroke */}
      <polygon
        points={dataPoly}
        fill="none"
        stroke="#00f0ff"
        strokeWidth="1.5"
        strokeLinejoin="round" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i}
          cx={p.x} cy={p.y} r="3.5"
          fill={ratingColor(p.rt)}
          stroke="#050a14"
          strokeWidth="1.5" />
      ))}

      {/* Labels */}
      {groups.map((gr, i) => {
        const a = i * step - Math.PI / 2
        const lr = maxR + 22
        const lx = cx + lr * Math.cos(a)
        const ly = cy + lr * Math.sin(a)
        const anchor = lx < cx - 8 ? 'end' : lx > cx + 8 ? 'start' : 'middle'
        const cat = TOPICS.find(t => t.id === gr.ids[0])?.cat || 'misc'
        const color = CAT_COLORS[cat] || '#00f0ff'
        return (
          <text key={i}
            x={lx} y={ly + 4}
            textAnchor={anchor}
            fill={color}
            fontFamily="Rajdhani,sans-serif"
            fontSize="11"
            fontWeight="700">
            {gr.l}
          </text>
        )
      })}

      {/* Center rating */}
      <text
        x={cx} y={cy - 4}
        textAnchor="middle"
        fill={ratingColor(overall)}
        fontFamily="Orbitron,sans-serif"
        fontSize="17"
        fontWeight="900">
        {overall}
      </text>
      <text
        x={cx} y={cy + 14}
        textAnchor="middle"
        fill="rgba(0,240,255,0.4)"
        fontFamily="Share Tech Mono,monospace"
        fontSize="8"
        letterSpacing="2">
        OVERALL
      </text>
    </svg>
  )
}
