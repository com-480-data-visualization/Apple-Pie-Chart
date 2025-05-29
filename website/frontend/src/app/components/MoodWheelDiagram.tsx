'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

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
  const svgSize = 340;
  const center  = svgSize / 2;
  const radius  = svgSize * 0.38;

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

    const svg = d3.select(svgRef.current).attr('width', svgSize).attr('height', svgSize);
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

    const container = svg.append('g').attr('transform', `translate(${center},${center})`);

    /* 弧生成器 */
    const arc = d3.arc<SectorData>()
      .innerRadius(22)
      .outerRadius(radius)
      .startAngle(d => d.startAngle)
      .endAngle  (d => d.endAngle);

    /* ---------- 扇形 ---------- */
    const hoverTimer: {t: NodeJS.Timeout|null} = { t: null };

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
      /* --- Hover: 仅调透明度，不再 scale，防抖 60 ms --- */
      .on('mouseenter', function (_, d){
        if (hoverTimer.t) clearTimeout(hoverTimer.t);
        hoverTimer.t = setTimeout(()=>{
          d3.select(this).attr('opacity', .9);
          onSectorHover?.(d.index);
        }, 60);
      })
      .on('mouseleave', function (_, d){
        if (hoverTimer.t) clearTimeout(hoverTimer.t);
        hoverTimer.t = setTimeout(()=>{
          if (d.index !== selectedSector) d3.select(this).attr('opacity', .72);
          onSectorHover?.(null);
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

    /* 坐标轴 + 中心圆 */
    container.append('circle').attr('r', radius).attr('fill','none').attr('stroke','#CBD5E1').attr('stroke-width',1.2);
    container.append('line').attr('x1',-radius).attr('x2', radius).attr('stroke','#CBD5E1');
    container.append('line').attr('y1',-radius).attr('y2', radius).attr('stroke','#CBD5E1');
    container.append('circle').attr('r',18).attr('fill','#fff').attr('stroke','#64748B').attr('stroke-width',2).style('filter','url(#shadow)');
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
