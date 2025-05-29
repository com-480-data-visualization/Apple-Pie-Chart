'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface GainDistributionProps {
  data: number[]
  title: string
  width?: number
  height?: number
}

const GainDistribution: React.FC<GainDistributionProps> = ({ 
  data, 
  title, 
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

    // 计算统计信息
    const mean = d3.mean(data) || 0
    const median = d3.median(data) || 0
    const extent = d3.extent(data) as [number, number]

    // 创建直方图数据
    const histogram = d3.histogram()
      .domain(extent)
      .thresholds(20) // 20个桶

    const bins = histogram(data)

    // 创建比例尺
    const xScale = d3.scaleLinear()
      .domain(extent)
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
      .range([innerHeight, 0])

    // 绘制直方图柱子
    g.selectAll('.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.x0 || 0))
      .attr('y', d => yScale(d.length))
      .attr('width', d => Math.max(0, xScale(d.x1 || 0) - xScale(d.x0 || 0) - 1))
      .attr('height', d => innerHeight - yScale(d.length))
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.7)
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        // 鼠标悬停效果
        d3.select(this).attr('fill-opacity', 0.9)
        
        // 显示工具提示
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
        tooltip.html(`Range: ${d.x0?.toFixed(2)} - ${d.x1?.toFixed(2)}<br/>Count: ${d.length}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill-opacity', 0.7)
        d3.selectAll('.tooltip').remove()
      })

    // 添加密度曲线
    const kde = kernelDensityEstimator(kernelEpanechnikov(0.5), xScale.ticks(100))
    const density = kde(data)

    const line = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1] * data.length * (extent[1] - extent[0]) / 20))
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

    // 添加X轴
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('Gain')

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
      .text(`Mean: ${mean.toFixed(2)}`)

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
      .text(`Median: ${median.toFixed(2)}`)

  }, [data, width, height])

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

export default GainDistribution