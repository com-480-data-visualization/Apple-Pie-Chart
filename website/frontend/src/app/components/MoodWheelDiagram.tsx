'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import styles from './MoodWheelDiagram.module.css';


interface MoodWheelDiagramProps {
  onMoodChange?: (mood: { x: number; y: number; sector: number; angle: number }) => void;
  onSectorHover?: (sector: number | null) => void;
  highlightedSector?: number;   // 由父组件控制高亮
}

interface SectorData {
  index: number;
  startAngle: number;
  endAngle: number;
  label: string;
  color: string;
}

const MoodWheelDiagram: React.FC<MoodWheelDiagramProps> = ({
  onMoodChange,
  onSectorHover,
  highlightedSector = 0,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedSector, setSelectedSector] = useState<number>(highlightedSector);

  /* ---------- 轮盘配置 ---------- */
  const svgSize = 420;  // 增加SVG尺寸以容纳标签
  const center  = svgSize / 2;
  const radius  = svgSize * 0.32;  // 调整半径比例

  const colors = [
    '#FCD34D', // Energetic / Joyful
    '#FB923C', // Excited / Surprised
    '#EF4444', // Agitated / Angry
    '#B91C1C', // Heavy/Majestic
    '#3B82F6', // Dark/Depressed
    '#6B7280', // Tragic / Yearning
    '#10B981', // Dreamy / Sentimental
    '#A855F7', // Calm / Relaxed
  ];

  const labels = [
    'Energetic/Joyful',
    'Excited/Surprised',
    'Agitated/Angry',
    'Heavy/Majestic',
    'Dark/Depressed',
    'Tragic/Yearning',
    'Dreamy/Sentimental',
    'Calm/Relaxed',
  ];

  const offset =  Math.PI / 2;   // 顺时针再转 90°（= π/2 rad）
  const CCW = -1;                // 方向：-1 = 逆时针, 1 = 顺时针
  const sectors: SectorData[] = d3.range(8).map(i => ({
    index: i,
    startAngle: offset + i       * CCW * (Math.PI / 4),
    endAngle:   offset + (i + 1) * CCW * (Math.PI / 4),
    label : labels[i],
    color : colors[i],
  }));

  /* ---------- 绘制 ---------- */
  useEffect(() => {
    if (!svgRef.current) return;

    // const svg = d3.select(svgRef.current).attr('width', svgSize).attr('height', svgSize);
    const margin = 80;  // Allow space for labels and axes
    svg.attr('width', svgSize)
      .attr('height', svgSize)
      .attr('viewBox', `${-margin} ${-margin} ${svgSize + margin * 2} ${svgSize + margin * 2}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    /* 渐变 */
    const defs = svg.append('defs');
    sectors.forEach(s => {
      const g = defs.append('radialGradient')
        .attr('id', `grad-${s.index}`)
        .attr('cx', '50%').attr('cy', '50%').attr('r', '70%');

      g.append('stop').attr('offset', '0%')  .attr('stop-color', s.color).attr('stop-opacity', .9);
      g.append('stop').attr('offset', '100%').attr('stop-color', d3.color(s.color)!.darker(.4).toString()).attr('stop-opacity', .7);
    });

    /* 阴影 */
    defs.append('filter')
      .attr('id', 'shadow')
      .append('feDropShadow')
      .attr('dx', 0).attr('dy', 2).attr('stdDeviation', 4).attr('flood-color', '#000').attr('flood-opacity', .15);

    // const container = svg.append('g').attr('transform', `translate(${center},${center})`);
    const container = svg.append('g').attr('transform', `translate(${svgSize / 2},${svgSize / 2})`);

    /* 弧生成器 */
    const arc = d3.arc<SectorData>()
      .innerRadius(22)
      .outerRadius(radius)
      .startAngle(d => d.startAngle)
      .endAngle  (d => d.endAngle);

    /* ---------- 扇形 ---------- */
    const hoverTimer: {t: NodeJS.Timeout|null} = { t: null };
    let lastHoveredSector: number | null = null;
    let lastHoverTime = 0;

    const paths = container.selectAll('path')
      .data(sectors)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => `url(#grad-${d.index})`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('pointer-events', 'visibleFill')
      .attr('opacity', d => d.index === selectedSector ? 1 : .72)
      .style('cursor', 'pointer')
      .style('filter', d => d.index === selectedSector ? 'url(#shadow)' : 'none')
      /* --- Hover: 仅调透明度，不再 scale，防抖 60 ms + 0↔7 特殊处理 --- */
      .on('mouseenter', function (_, d){
        const currentTime = Date.now();
        const isWrapAroundJitter = (lastHoveredSector === 0 && d.index === 7) || 
                                   (lastHoveredSector === 7 && d.index === 0);
        
        // 如果是 0↔7 之间的快速切换（80ms内），则忽略
        if (isWrapAroundJitter && (currentTime - lastHoverTime) < 80) {
          return;
        }
        
        if (hoverTimer.t) clearTimeout(hoverTimer.t);
        hoverTimer.t = setTimeout(()=>{
          d3.select(this).attr('opacity', .9);
          onSectorHover?.(d.index);
          lastHoveredSector = d.index;
          lastHoverTime = Date.now();
        }, 60);
      })
      .on('mouseleave', function (_, d){
        if (hoverTimer.t) clearTimeout(hoverTimer.t);
        hoverTimer.t = setTimeout(()=>{
          if (d.index !== selectedSector) d3.select(this).attr('opacity', .72);
          onSectorHover?.(null);
          lastHoveredSector = null;
        }, 60);
      })
      /* --- Click 选中 --- */
      .on('click', (_, d) => {
        setSelectedSector(d.index);
        paths
          .attr('opacity', p => p.index === d.index ? 1 : .72)
          .style('filter', p => p.index === d.index ? 'url(#shadow)' : 'none');

        /* 通知父组件 */
        if (onMoodChange){
          const mid = d.startAngle + (d.endAngle - d.startAngle) / 2;
          onMoodChange({ x: Math.cos(mid), y: Math.sin(mid), sector: d.index, angle: mid * 180 / Math.PI });
        }
      });

    /* 坐标轴 + 中心圆 + 标签 */
    // 更明显的坐标轴线
    container.append('circle').attr('r', radius).attr('fill','none').attr('stroke','#CBD5E1').attr('stroke-width',1.2);
    
    // 水平轴线 (Valence轴)
    container.append('line')
      .attr('x1', -radius - 60)
      .attr('x2', radius + 60)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');
    
    // 垂直轴线 (Arousal轴)
    container.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -radius - 60)
      .attr('y2', radius + 60)
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');
    
    container.append('circle').attr('r',18).attr('fill','#fff').attr('stroke','#64748B').attr('stroke-width',2).style('filter','url(#shadow)');

    /* 坐标轴标签 */
    // Valence+ (右侧)
    container.append('rect')
      .attr('x', radius + 15)
      .attr('y', -12)
      .attr('width', 70)
      .attr('height', 24)
      .attr('fill', '#E0E7FF')
      .attr('stroke', '#6366F1')
      .attr('stroke-width', 1)
      .attr('rx', 4);
    
    container.append('text')
      .attr('x', radius + 50)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1E293B')
      .text('Valence+');

    // Valence- (左侧)
    container.append('rect')
      .attr('x', -radius - 85)
      .attr('y', -12)
      .attr('width', 70)
      .attr('height', 24)
      .attr('fill', '#FEE2E2')
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 1)
      .attr('rx', 4);
    
    container.append('text')
      .attr('x', -radius - 50)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1E293B')
      .text('Valence-');

    // Arousal+ (上方)
    container.append('rect')
      .attr('x', -35)
      .attr('y', -radius - 40)
      .attr('width', 70)
      .attr('height', 24)
      .attr('fill', '#DCFCE7')
      .attr('stroke', '#22C55E')
      .attr('stroke-width', 1)
      .attr('rx', 4);
    
    container.append('text')
      .attr('x', 0)
      .attr('y', -radius - 24)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1E293B')
      .text('Arousal+');

    // Arousal- (下方)
    container.append('rect')
      .attr('x', -35)
      .attr('y', radius + 16)
      .attr('width', 70)
      .attr('height', 24)
      .attr('fill', '#F3F4F6')
      .attr('stroke', '#6B7280')
      .attr('stroke-width', 1)
      .attr('rx', 4);
    
    container.append('text')
      .attr('x', 0)
      .attr('y', radius + 32)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1E293B')
      .text('Arousal-');
  }, [selectedSector, onMoodChange, onSectorHover]);

  /* 当父组件传入新的 highlightedSector 时同步 */
  useEffect(()=> setSelectedSector(highlightedSector), [highlightedSector]);

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
      <svg ref={svgRef}/>
    </div>
  );
};

export default MoodWheelDiagram;