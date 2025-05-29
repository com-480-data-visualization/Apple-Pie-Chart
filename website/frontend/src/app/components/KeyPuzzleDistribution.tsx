// src/app/components/KeyPuzzleDistribution.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface KeyPuzzleProps {
  counts: Record<string, number>   // { "C major": 92, "A minor": 59, … }
  title: string
  width?: number
  height?: number
}

const ORDER = [
  'C major','G major','D major','A major','E major','B major',
  'F# major','C# major','Ab major','Eb major','Bb major','F major',
  'A minor','E minor','B minor','F# minor','C# minor','G# minor',
  'D# minor','A# minor','F minor','C minor','G minor','D minor'
]

const COLS = 6   // 6 列 × 4 行 = 24 调
const ROWS = 4

const KeyPuzzleDistribution: React.FC<KeyPuzzleProps> = ({
  counts,
  title,
  width = 800,  // 增加宽度以容纳两个图表
  height = 400
}) => {
  const hexagonRef = useRef<SVGSVGElement>(null)
  const roseRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const data = ORDER.map(k => ({ key: k, count: counts[k] ?? 0 }))
    const maxCount = d3.max(data, d => d.count) || 1

    // 色彩映射：major 调用暖色，minor 调用冷色
    const colorScale = (key: string, count: number) => {
      const intensity = count / maxCount
      if (key.includes('major')) {
        return d3.interpolateWarm(0.3 + intensity * 0.6)
      } else {
        return d3.interpolateCool(0.3 + intensity * 0.6)
      }
    }

    // 渲染Hexagon图表
    renderHexagonChart(hexagonRef.current, data, maxCount, colorScale)
    
    // 渲染Rose图表
    renderRoseChart(roseRef.current, data, maxCount, colorScale)

  }, [counts, width, height, title])

  return (
    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'stretch' }}>
      {/* Hexagon Chart */}
      <div style={{ 
        flex: '1 1 0', 
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        minWidth: '0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0',
          textAlign: 'center',
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#1E293B',
          flexShrink: '0'
        }}>
          Hexagon View
        </h3>
        <div style={{ 
          flex: '1',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <svg ref={hexagonRef} />
        </div>
      </div>

      {/* Rose Chart */}
      <div style={{ 
        flex: '1 1 0', 
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        minWidth: '0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0',
          textAlign: 'center',
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#1E293B',
          flexShrink: '0'
        }}>
          Rose View
        </h3>
        <div style={{ 
          flex: '1',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <svg ref={roseRef} />
        </div>
      </div>
    </div>
  )
}

// 渲染Hexagon图表
function renderHexagonChart(svgElement: SVGSVGElement | null, data: any[], maxCount: number, colorScale: any) {
  if (!svgElement) return

  const width = 420  // 增加宽度
  const height = 350 // 增加高度
  
  const svg = d3.select(svgElement)
  svg.selectAll('*').remove()

  const margin = { top: 15, right: 15, bottom: 15, left: 15 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const g = svg
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const hexRadius = Math.min(innerW / 11, innerH / 7)  // 调整大小比例
  const hexWidth = hexRadius * Math.sqrt(3)
  const hexHeight = hexRadius * 2

  // 计算网格总尺寸以便居中
  const gridWidth = (COLS - 1) * hexWidth * 0.75 + hexWidth
  const gridHeight = ROWS * hexHeight * 0.87
  
  const offsetX = (innerW - gridWidth) / 2
  const offsetY = (innerH - gridHeight) / 2

  data.forEach((d, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    
    const x = col * hexWidth * 0.75 + hexWidth / 2 + offsetX
    const y = row * hexHeight * 0.87 + hexHeight / 2 + (col % 2) * hexHeight * 0.43 + offsetY

    const size = Math.max(hexRadius * 0.4, hexRadius * Math.sqrt(d.count / maxCount))
    
    const hexagon = d3.geoPath().projection(d3.geoIdentity().scale(size))
    const hexagonData = {
      type: "Polygon",
      coordinates: [[
        [0, -1], [Math.sqrt(3)/2, -0.5], [Math.sqrt(3)/2, 0.5],
        [0, 1], [-Math.sqrt(3)/2, 0.5], [-Math.sqrt(3)/2, -0.5], [0, -1]
      ]]
    }

    g.append('path')
      .datum(hexagonData)
      .attr('d', hexagon)
      .attr('transform', `translate(${x}, ${y})`)
      .attr('fill', colorScale(d.key, d.count))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9)

    // 标签
    g.append('text')
      .attr('x', x)
      .attr('y', y + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', Math.max(8, size * 0.25))
      .attr('fill', 'white')
      .attr('font-weight', 600)
      .text(d.key.replace(' major', '').replace(' minor', 'm'))
  })
}

// 渲染Rose图表
function renderRoseChart(svgElement: SVGSVGElement | null, data: any[], maxCount: number, colorScale: any) {
  if (!svgElement) return

  const width = 420  // 增加宽度
  const height = 350 // 增加高度
  
  const svg = d3.select(svgElement)
  svg.selectAll('*').remove()

  const margin = { top: 15, right: 15, bottom: 15, left: 15 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const g = svg
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const centerX = innerW / 2
  const centerY = innerH / 2
  const maxRadius = Math.min(innerW, innerH) / 2.5  // 增大半径

  const angleScale = d3.scaleLinear()
    .domain([0, data.length])
    .range([0, 2 * Math.PI])

  const radiusScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([30, maxRadius])  // 增大内外半径范围

  data.forEach((d, i) => {
    const angle = angleScale(i)
    const radius = radiusScale(d.count)
    const angleWidth = (2 * Math.PI) / data.length

    const arc = d3.arc()
      .innerRadius(20)  // 增大内半径
      .outerRadius(radius)
      .startAngle(angle - angleWidth / 2)
      .endAngle(angle + angleWidth / 2)

    g.append('path')
      .attr('d', arc)
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .attr('fill', colorScale(d.key, d.count))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85)

    // 标签放在扇形外侧
    const labelRadius = radius + 25  // 增加标签距离
    const labelX = centerX + labelRadius * Math.cos(angle - Math.PI / 2)
    const labelY = centerY + labelRadius * Math.sin(angle - Math.PI / 2)

    g.append('text')
      .attr('x', labelX)
      .attr('y', labelY + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)  // 增大字体
      .attr('fill', '#374151')
      .attr('font-weight', 500)
      .text(d.key.replace(' major', '').replace(' minor', 'm'))
  })
}

export default KeyPuzzleDistribution