'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

// 导出常量供外部使用
export const Y_MAX_BPM = 180

interface BPMDistributionProps {
  data: number[]
  title: string
  color?: string
  width?: number
  height?: number
}

const BPMDistribution: React.FC<BPMDistributionProps> = ({ 
  data, 
  title, 
  color,
  width = 400, 
  height = 300 
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // 清除之前的图形

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // 创建主容器
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 使用传入的颜色或默认颜色
    const barColor = color ?? '#059669'
    const strokeColor = color ? d3.color(color)?.darker(0.5)?.toString() ?? color : '#047857'

    // 计算统计信息
    const mean = d3.mean(data) || 0
    const median = d3.median(data) || 0

    // 固定坐标轴范围
    const xDomain: [number, number] = [80, 200] // BPM 统一 80 → 200
    const yDomain: [number, number] = [0, Y_MAX_BPM]  // 固定 y 轴最大值

    // 创建直方图数据
    const histogram = d3.histogram()
      .domain(xDomain)
      .thresholds(25) // 25个桶（BPM通常范围更大）

    const bins = histogram(data)

    // 创建比例尺
    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0])

    // 绘制直方图柱子
    g.selectAll('.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.x0 || 0))
      .attr('y', d => yScale(Math.min(d.length, Y_MAX_BPM))) // 限制柱子高度
      .attr('width', d => Math.max(0, xScale(d.x1 || 0) - xScale(d.x0 || 0) - 1))
      .attr('height', d => innerHeight - yScale(Math.min(d.length, Y_MAX_BPM))) // 限制柱子高度
      .attr('fill', barColor)
      .attr('fill-opacity', 0.7)
      .attr('stroke', strokeColor)
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        // 鼠标悬停效果
        d3.select(this).attr('fill-opacity', 0.9)
        
        // 显示工具提示（显示真实数量）
        const tooltip = d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0)

        tooltip.transition().duration(200).style('opacity', 1)
        const countText = d.length > Y_MAX_BPM ? `${d.length} (exceeds limit)` : `${d.length}`
        tooltip.html(`Range: ${Math.round(d.x0 || 0)} - ${Math.round(d.x1 || 0)} BPM<br/>Count: ${countText}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill-opacity', 0.7)
        d3.selectAll('.tooltip').remove()
      })

    // 绘制超出提示箭头
    g.selectAll('.overflow-arrow')
      .data(bins.filter(d => d.length > Y_MAX_BPM))
      .enter()
      .append('path')
      .attr('class', 'overflow-arrow')
      .attr('d', 'M-4,-8 L0,0 L4,-8 Z') // 向上的三角形箭头
      .attr('transform', d => `translate(${xScale((d.x0 || 0) + (d.x1 || 0)) / 2}, ${yScale(Y_MAX_BPM) - 3})`)
      .attr('fill', '#dc2626')
      .attr('stroke', '#991b1b')
      .attr('stroke-width', 1)

    // 添加密度曲线
    const kde = kernelDensityEstimator(kernelEpanechnikov(2), xScale.ticks(100))
    const density = kde(data)

    const line = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1] * data.length * (xDomain[1] - xDomain[0]) / 25))
      .curve(d3.curveBasis)

    g.append('path')
      .datum(density)
      .attr('fill', 'none')
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 2)
      .attr('d', line)

    // 添加均值线
    g.append('line')
      .attr('x1', xScale(mean))
      .attr('x2', xScale(mean))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')

    // 添加中位数线
    g.append('line')
      .attr('x1', xScale(median))
      .attr('x2', xScale(median))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#16a34a')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')

    // 添加常见BPM范围的参考线
    const bpmRanges = [
      { value: 60, label: 'Slow', color: '#6b7280' },
      { value: 120, label: 'Moderate', color: '#6b7280' },
      { value: 180, label: 'Fast', color: '#6b7280' }
    ]

    bpmRanges.forEach(range => {
      if (range.value >= xDomain[0] && range.value <= xDomain[1]) {
        g.append('line')
          .attr('x1', xScale(range.value))
          .attr('x2', xScale(range.value))
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', range.color)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2,2')
          .attr('opacity', 0.5)

        g.append('text')
          .attr('x', xScale(range.value))
          .attr('y', -5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', range.color)
          .text(range.label)
      }
    })

    // 添加X轴
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}`))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('BPM (Beats Per Minute)')

    // 添加Y轴
    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('Frequency')

    // 添加图例
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 120}, 20)`)

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')

    legend.append('text')
      .attr('x', 20)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .text(`Mean: ${mean.toFixed(1)}`)

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('y1', 15)
      .attr('y2', 15)
      .attr('stroke', '#16a34a')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')

    legend.append('text')
      .attr('x', 20)
      .attr('y', 15)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .text(`Median: ${median.toFixed(1)}`)

  }, [data, width, height, color])

  // 核密度估计函数
  function kernelDensityEstimator(kernel: (v: number) => number, X: number[]) {
    return function(V: number[]) {
      return X.map(function(x) {
        return [x, d3.mean(V, function(v) { return kernel(x - v) }) || 0] as [number, number]
      })
    }
  }

  function kernelEpanechnikov(k: number) {
    return function(v: number) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0
    }
  }

  return (
    <div className="w-full flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default BPMDistribution