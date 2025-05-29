import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface MoodWheelDiagramProps {
  onMoodChange?: (mood: { x: number; y: number; sector: number; angle: number }) => void;
  onSectorHover?: (sector: number | null) => void;
  highlightedSector?: number;
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
  highlightedSector 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentSector, setCurrentSector] = useState(0);
  const svgSize = 400;
  const center = svgSize / 2;
  const radius = svgSize / 2 * 0.85;

  const config = {
    mainAxisStrokeColor: '#E2E8F0',
    circleStrokeColor: '#64748B',
    textColor: '#1E293B',
    sectorColors: [
      '#FCD34D', // 0: Energetic/Joyful - 温暖金黄
      '#FB923C', // 1: Excited/Surprised - 活力橙色
      '#EF4444', // 2: Agitated/Tense - 紧张红色
      '#B91C1C', // 3: Anxious/Angry - 深红愤怒
      '#3B82F6', // 4: Sad/Depressed - 忧郁蓝色
      '#6B7280', // 5: Gloomy/Tired - 灰色疲惫
      '#10B981', // 6: Calm/Relaxed - 宁静绿色
      '#A855F7'  // 7: Content/Serene - 紫色宁静
    ],
    sectorLabels: [
      'Energetic/Joyful', 'Excited/Surprised', 'Agitated/Tense', 'Anxious/Angry',
      'Sad/Depressed', 'Gloomy/Tired', 'Calm/Relaxed', 'Content/Serene'
    ]
  };

  const sectorData: SectorData[] = d3.range(8).map((i: number): SectorData => ({
    index: i,
    startAngle: i * (Math.PI / 4),
    endAngle: (i + 1) * (Math.PI / 4),
    label: config.sectorLabels[i],
    color: config.sectorColors[i]
  }));

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 创建渐变定义
    const defs = svg.append('defs');
    
    // 为每个扇形创建渐变
    sectorData.forEach((sector, i) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${i}`)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '70%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', sector.color)
        .attr('stop-opacity', 0.9);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.color(sector.color)?.darker(0.3)?.toString() || sector.color)
        .attr('stop-opacity', 0.7);
    });

    // 创建阴影滤镜
    const filter = defs.append('filter')
      .attr('id', 'drop-shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 4)
      .attr('flood-color', '#000000')
      .attr('flood-opacity', 0.15);

    const container = svg.append('g').attr('class', 'wheel-container');

    // 创建弧形生成器
    const arcGenerator = d3.arc<SectorData>()
      .innerRadius(20) // 内半径，创建环形效果
      .outerRadius(radius)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .cornerRadius(3); // 圆角

    // 绘制扇形
    const sectorPaths = container.selectAll<SVGPathElement, SectorData>('.sector')
      .data(sectorData)
      .enter()
      .append('path')
      .attr('class', 'sector')
      .attr('d', arcGenerator)
      .attr('transform', `translate(${center},${center})`)
      .attr('fill', (d, i) => `url(#gradient-${i})`)
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .attr('opacity', (d, i) => i === currentSector ? 1 : 0.7)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)')
      .style('filter', (d, i) => i === currentSector ? 'url(#drop-shadow)' : 'none')
      .on('mouseenter', function(event, d) {
        if (d.index !== currentSector) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.9)
            .style('transform', `translate(${center}px,${center}px) scale(1.05)`);
          
          onSectorHover?.(d.index);
        }
      })
      .on('mouseleave', function(event, d) {
        if (d.index !== currentSector) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.7)
            .style('transform', `translate(${center}px,${center}px) scale(1)`);
          
          onSectorHover?.(null);
        }
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        setCurrentSector(d.index);
        
        // 更新所有扇形样式
        sectorPaths
          .transition()
          .duration(300)
          .attr('opacity', (_, i) => i === d.index ? 1 : 0.7)
          .style('filter', (_, i) => i === d.index ? 'url(#drop-shadow)' : 'none')
          .style('transform', (_, i) => 
            i === d.index 
              ? `translate(${center}px,${center}px) scale(1.08)` 
              : `translate(${center}px,${center}px) scale(1)`
          );

        // 通知父组件
        if (onMoodChange) {
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          const x = Math.cos(midAngle);
          const y = Math.sin(midAngle);
          onMoodChange({
            x,
            y,
            sector: d.index,
            angle: midAngle * 180 / Math.PI
          });
        }
      });

    // 绘制中心圆
    container.append('circle')
      .attr('cx', center)
      .attr('cy', center)
      .attr('r', 18)
      .attr('fill', '#FFFFFF')
      .attr('stroke', config.circleStrokeColor)
      .attr('stroke-width', 2)
      .style('filter', 'url(#drop-shadow)');

    // 绘制坐标轴（更细致）
    const axisGroup = container.append('g').attr('class', 'axes');
    
    // 主轴线
    axisGroup.append('line')
      .attr('x1', center - radius + 10)
      .attr('y1', center)
      .attr('x2', center + radius - 10)
      .attr('y2', center)
      .attr('stroke', config.mainAxisStrokeColor)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.8);
    
    axisGroup.append('line')
      .attr('x1', center)
      .attr('y1', center - radius + 10)
      .attr('x2', center)
      .attr('y2', center + radius - 10)
      .attr('stroke', config.mainAxisStrokeColor)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.8);

    // 轴标签（更美观的字体）
    const labelGroup = container.append('g').attr('class', 'labels');
    
    labelGroup.append('text')
      .attr('x', center)
      .attr('y', center - radius - 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', config.textColor)
      .attr('opacity', 0.8)
      .text('Arousal+');
    
    labelGroup.append('text')
      .attr('x', center)
      .attr('y', center + radius + 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', config.textColor)
      .attr('opacity', 0.8)
      .text('Arousal-');
    
    labelGroup.append('text')
      .attr('x', center + radius + 15)
      .attr('y', center + 5)
      .attr('text-anchor', 'start')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', config.textColor)
      .attr('opacity', 0.8)
      .text('Valence+');
    
    labelGroup.append('text')
      .attr('x', center - radius - 15)
      .attr('y', center + 5)
      .attr('text-anchor', 'end')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', config.textColor)
      .attr('opacity', 0.8)
      .text('Valence-');

    // 初始化选中状态
    sectorPaths
      .filter((_, i) => i === currentSector)
      .style('filter', 'url(#drop-shadow)')
      .style('transform', `translate(${center}px,${center}px) scale(1.08)`);

    // 触发初始回调
    if (onMoodChange) {
      const initialSector = sectorData[currentSector];
      const midAngle = initialSector.startAngle + (initialSector.endAngle - initialSector.startAngle) / 2;
      const x = Math.cos(midAngle);
      const y = Math.sin(midAngle);
      onMoodChange({
        x,
        y,
        sector: currentSector,
        angle: midAngle * 180 / Math.PI
      });
    }

    svg.attr('width', svgSize).attr('height', svgSize);

  }, [currentSector, onMoodChange, onSectorHover]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    }}>
      <svg ref={svgRef} style={{ borderRadius: '50%' }}></svg>
    </div>
  );
};

export default MoodWheelDiagram;