// src/app/components/KeyPuzzleDistribution.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
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

// 定义不同的可视化模式
type VisualizationMode = 'hexagon' | 'rose'

const KeyPuzzleDistribution: React.FC<KeyPuzzleProps> = ({
  counts,
  title,
  width = 640,  // 设置为和两个图表总宽度相近
  height = 320
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [mode, setMode] = useState<VisualizationMode>('rose')

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 10, right: 10, bottom: 35, left: 10 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const data = ORDER.map(k => ({ key: k, count: counts[k] ?? 0 }))
    const maxCount = d3.max(data, d => d.count) || 1

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 色彩映射：major 调用暖色，minor 调用冷色
    const colorScale = (key: string, count: number) => {
      const intensity = count / maxCount
      if (key.includes('major')) {
        return d3.interpolateWarm(0.3 + intensity * 0.6)
      } else {
        return d3.interpolateCool(0.3 + intensity * 0.6)
      }
    }

    switch (mode) {
      case 'hexagon':
        renderHexagonGrid(g, data, innerW, innerH, maxCount, colorScale)
        break
      case 'rose':
        renderRoseDiagram(g, data, innerW, innerH, maxCount, colorScale)
        break
    }

    // 不显示标题，节省空间
    // svg.append('text')
    //    .attr('x', width / 2)
    //    .attr('y', 20)
    //    .attr('text-anchor', 'middle')
    //    .attr('font-weight', 600)
    //    .attr('font-size', 14)
    //    .text(title)

    // 添加模式切换按钮
    const buttonGroup = svg.append('g')
      .attr('transform', `translate(10, ${height - 30})`)

    const modes: VisualizationMode[] = ['hexagon', 'rose']
    const buttonWidth = 60
    
    modes.forEach((m, i) => {
      const button = buttonGroup.append('g')
        .attr('transform', `translate(${i * (buttonWidth + 5)}, 0)`)
        .style('cursor', 'pointer')
        .on('click', () => setMode(m))

      button.append('rect')
        .attr('width', buttonWidth)
        .attr('height', 20)
        .attr('rx', 10)
        .attr('fill', mode === m ? '#3b82f6' : '#e5e7eb')
        .attr('stroke', '#d1d5db')

      button.append('text')
        .attr('x', buttonWidth / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', mode === m ? 'white' : '#374151')
        .text(m.charAt(0).toUpperCase() + m.slice(1))
    })

  }, [counts, width, height, title, mode])

  return <svg ref={svgRef} />
}

// 蜂窝网格布局
function renderHexagonGrid(g: any, data: any[], width: number, height: number, maxCount: number, colorScale: any) {
  const hexRadius = Math.min(width / 10, height / 6)
  const hexWidth = hexRadius * Math.sqrt(3)
  const hexHeight = hexRadius * 2

  data.forEach((d, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    
    const x = col * hexWidth * 0.75 + hexWidth / 2 + width * 0.05
    const y = row * hexHeight * 0.87 + hexHeight / 2 + (col % 2) * hexHeight * 0.43 + height * 0.05

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

// 圆形包装布局已移除

// 删除拼图布局函数
// renderPuzzlePieces function removed

// 玫瑰图布局 - 铺满整个容器
function renderRoseDiagram(g: any, data: any[], width: number, height: number, maxCount: number, colorScale: any) {
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) / 2.5  // 增大半径，更好地利用空间

  const angleScale = d3.scaleLinear()
    .domain([0, data.length])
    .range([0, 2 * Math.PI])

  const radiusScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([30, maxRadius])  // 增大内外半径

  data.forEach((d, i) => {
    const angle = angleScale(i)
    const radius = radiusScale(d.count)
    const angleWidth = (2 * Math.PI) / data.length

    const arc = d3.arc()
      .innerRadius(20)  // 稍微增大内半径
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

    // 标签放在扇形外侧，增加距离以适应更大的图表
    const labelRadius = radius + 25
    const labelX = centerX + labelRadius * Math.cos(angle - Math.PI / 2)
    const labelY = centerY + labelRadius * Math.sin(angle - Math.PI / 2)

    g.append('text')
      .attr('x', labelX)
      .attr('y', labelY + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)  // 稍微增大字体
      .attr('fill', '#374151')
      .attr('font-weight', 500)
      .text(d.key.replace(' major', '').replace(' minor', 'm'))
  })
}

export default KeyPuzzleDistribution