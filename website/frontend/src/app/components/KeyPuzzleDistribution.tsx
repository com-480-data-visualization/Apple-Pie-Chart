// src/app/components/KeyPuzzleDistribution.tsx
'use client'

import React, { useEffect, useRef, useMemo, useState } from 'react'
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
] as const

const COLS = 6   // 6 列 × 4 行 = 24 调
const ROWS = 4

const KeyPuzzleDistribution: React.FC<KeyPuzzleProps> = ({
  counts,
  title,
  width = 800,
  height = 400
}) => {
  const hexagonRef = useRef<SVGSVGElement>(null)
  const roseRef = useRef<SVGSVGElement>(null)
  
  // 添加响应式状态
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width <= 768)
      setIsTablet(width > 768 && width <= 1200)
    }
    
    if (typeof window !== 'undefined') {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
      return () => window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // 使用 useMemo 优化数据处理
  const processedData = useMemo(() => {
    const data = ORDER.map(k => ({ key: k, count: counts[k] ?? 0 }))
    const maxCount = d3.max(data, d => d.count) || 1
    return { data, maxCount }
  }, [counts])

  // 色彩映射函数
  const getColor = useMemo(() => {
    return (key: string, count: number, maxCount: number) => {
      const intensity = count / maxCount
      if (key.includes('major')) {
        return d3.interpolateWarm(0.3 + intensity * 0.6)
      } else {
        return d3.interpolateCool(0.3 + intensity * 0.6)
      }
    }
  }, [])

  useEffect(() => {
    // 添加检查确保在浏览器环境中运行
    if (typeof window === 'undefined') return
    
    const { data, maxCount } = processedData
    
    // 渲染图表
    renderHexagonChart(hexagonRef.current, data, maxCount, getColor, isMobile, isTablet)
    renderRoseChart(roseRef.current, data, maxCount, getColor, isMobile, isTablet)

  }, [processedData, getColor, isMobile, isTablet])

  // 响应式容器样式
  const containerStyle = {
    display: 'flex',
    gap: isMobile ? '1rem' : '2rem',
    justifyContent: 'center',
    alignItems: 'stretch',
    maxWidth: '100%',
    overflow: 'hidden',
    padding: isMobile ? '0.5rem' : '1rem',
    flexDirection: isMobile ? 'column' : 'row'
  } as const

  // 响应式卡片样式
  const cardStyle = {
    flex: '1 1 0',
    background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
    padding: isMobile ? '1rem' : '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    minWidth: '0',
    display: 'flex',
    flexDirection: 'column',
    aspectRatio: '1 / 1',
    maxWidth: isMobile ? '100%' : '450px',
    margin: '0 auto'
  } as const

  return (
    <div style={containerStyle}>
      {/* Hexagon Chart */}
      <div style={cardStyle}>
        <h3 style={{ 
          margin: '0 0 1rem 0',
          textAlign: 'center',
          fontSize: isMobile ? '1rem' : '1.2rem',
          fontWeight: '600',
          color: '#1E293B',
          flexShrink: 0
        }}>
          Hexagon View
        </h3>
        <div style={{ 
          flex: '1',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <svg 
            ref={hexagonRef} 
            style={{ 
              maxWidth: '100%', 
              height: '100%',
              aspectRatio: '1 / 1'
            }}
          />
        </div>
      </div>

      {/* Rose Chart */}
      <div style={cardStyle}>
        <h3 style={{ 
          margin: '0 0 1rem 0',
          textAlign: 'center',
          fontSize: isMobile ? '1rem' : '1.2rem',
          fontWeight: '600',
          color: '#1E293B',
          flexShrink: 0
        }}>
          Rose View
        </h3>
        <div style={{ 
          flex: '1',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <svg 
            ref={roseRef} 
            style={{ 
              maxWidth: '100%', 
              height: '100%',
              aspectRatio: '1 / 1'
            }}
          />
        </div>
      </div>
    </div>
  )
}

// 渲染Hexagon图表 - 添加响应式参数
function renderHexagonChart(
  svgElement: SVGSVGElement | null, 
  data: Array<{ key: string; count: number }>, 
  maxCount: number, 
  colorScale: (key: string, count: number, maxCount: number) => string,
  isMobile: boolean = false,
  isTablet: boolean = false
) {
  if (!svgElement || typeof window === 'undefined') return

  // 响应式尺寸
  const width = isMobile ? 300 : isTablet ? 350 : 420
  const height = isMobile ? 300 : isTablet ? 350 : 350
  
  const svg = d3.select(svgElement)
  svg.selectAll('*').remove()

  const margin = { 
    top: isMobile ? 10 : 15, 
    right: isMobile ? 10 : 15, 
    bottom: isMobile ? 10 : 15, 
    left: isMobile ? 10 : 15 
  }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const g = svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 响应式六边形大小
  const baseSize = isMobile ? 9 : isTablet ? 10 : 11
  const hexRadius = Math.min(innerW / baseSize, innerH / (ROWS + 2))
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
    
    // 创建六边形路径
    const hexagonPath = createHexagonPath(0, 0, size)

    g.append('path')
      .attr('d', hexagonPath)
      .attr('transform', `translate(${x}, ${y})`)
      .attr('fill', colorScale(d.key, d.count, maxCount))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', isMobile ? 1.5 : 2)
      .attr('opacity', 0.9)

    // 响应式标签
    const fontSize = Math.max(
      isMobile ? 6 : 8, 
      size * (isMobile ? 0.2 : 0.25)
    )
    
    g.append('text')
      .attr('x', x)
      .attr('y', y + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', fontSize)
      .attr('fill', 'white')
      .attr('font-weight', 600)
      .text(d.key.replace(' major', '').replace(' minor', 'm'))
  })
}

// 渲染Rose图表 - 添加响应式参数
function renderRoseChart(
  svgElement: SVGSVGElement | null, 
  data: Array<{ key: string; count: number }>, 
  maxCount: number, 
  colorScale: (key: string, count: number, maxCount: number) => string,
  isMobile: boolean = false,
  isTablet: boolean = false
) {
  if (!svgElement || typeof window === 'undefined') return

  // 响应式尺寸
  const width = isMobile ? 300 : isTablet ? 350 : 420
  const height = isMobile ? 300 : isTablet ? 350 : 350
  
  const svg = d3.select(svgElement)
  svg.selectAll('*').remove()

  const margin = { 
    top: isMobile ? 10 : 15, 
    right: isMobile ? 10 : 15, 
    bottom: isMobile ? 10 : 15, 
    left: isMobile ? 10 : 15 
  }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const g = svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const centerX = innerW / 2
  const centerY = innerH / 2
  const maxRadius = Math.min(innerW, innerH) / (isMobile ? 3 : 2.5)

  const angleScale = d3.scaleLinear()
    .domain([0, data.length])
    .range([0, 2 * Math.PI])

  const radiusScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([isMobile ? 20 : 30, maxRadius])

  data.forEach((d, i) => {
    const angle = angleScale(i)
    const radius = radiusScale(d.count)
    const angleWidth = (2 * Math.PI) / data.length

    const arc = d3.arc<any>()
      .innerRadius(isMobile ? 15 : 20)
      .outerRadius(radius)
      .startAngle(angle - angleWidth / 2)
      .endAngle(angle + angleWidth / 2)

    const pathData = arc(null)
    
    if (pathData) {
      g.append('path')
        .attr('d', pathData)
        .attr('transform', `translate(${centerX}, ${centerY})`)
        .attr('fill', colorScale(d.key, d.count, maxCount))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', isMobile ? 1 : 1.5)
        .attr('opacity', 0.85)
    }

    // 响应式标签
    const labelRadius = radius + (isMobile ? 15 : 25)
    const labelX = centerX + labelRadius * Math.cos(angle - Math.PI / 2)
    const labelY = centerY + labelRadius * Math.sin(angle - Math.PI / 2)

    g.append('text')
      .attr('x', labelX)
      .attr('y', labelY + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', isMobile ? 8 : 10)
      .attr('fill', '#374151')
      .attr('font-weight', 500)
      .text(d.key.replace(' major', '').replace(' minor', 'm'))
  })
}

// 创建六边形路径的辅助函数
function createHexagonPath(centerX: number, centerY: number, radius: number): string {
  const points: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    points.push([x, y])
  }
  
  return `M ${points.map(p => p.join(',')).join(' L ')} Z`
}

export default KeyPuzzleDistribution