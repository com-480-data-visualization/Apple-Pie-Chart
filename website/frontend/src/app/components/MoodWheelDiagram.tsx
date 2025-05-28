import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface MoodWheelDiagramProps {
  onMoodChange?: (mood: { x: number; y: number; sector: number; angle: number }) => void;
}

// Define an interface for our sector data structure
interface SectorData {
  index: number;
  startAngle: number;
  endAngle: number;
  label: string;
  color: string;
}

const MoodWheelDiagram: React.FC<MoodWheelDiagramProps> = ({ onMoodChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const svgSize = 400;
  const center = svgSize / 2;
  const radius = svgSize / 2 * 0.8;
  const buttonRadius = 8;

  // Stable config object - moved outside useEffect, include in deps if it were to change
  const config = {
    mainAxisStrokeColor: '#B0B0B0',
    diagonalStrokeColor: '#EAEAEA',
    circleStrokeColor: '#4A90E2',
    textColor: '#333',
    sectorColors: [
      '#FFD1DC', '#E1F5FE', '#FFE4B5', '#D8BFD8',
      '#FFB6C1', '#ADD8E6', '#F5F5DC', '#E6E6FA'
    ],
    sectorLabels: [
      'Energetic/Joyful', 'Excited/Surprised', 'Agitated/Angry', 'Heavy/Majestic',
      'Dark/Depressed', 'Tragic/Yearning', 'Dreamy/Sentimental', 'Calm/Relaxed'
    ]
  };

  const sectorData: SectorData[] = d3.range(8).map((i: number): SectorData => {
    return {
      index: i,
      startAngle: i * (Math.PI / 4),       // e.g., Sector 0: 0, Sector 1: PI/4
      endAngle: (i + 1) * (Math.PI / 4),   // e.g., Sector 0: PI/4, Sector 1: PI/2
      label: config.sectorLabels[i],
      color: config.sectorColors[i]
    };
  });

  // These are effectively states managed by D3 interactions within the useEffect hook.
  // We use a ref to store them if we need to access their latest value outside D3 callbacks
  // but for this setup, they are mostly scoped to the D3 logic.
  const currentAngleRadRef = useRef(Math.PI / 8);
  const currentSectorIndexRef = useRef(0);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const container = svg.append('g').attr('class', 'wheel-container');

    const arcGenerator = d3.arc<SectorData>()
      .innerRadius(0)
      .outerRadius(radius)
      .startAngle((d: SectorData) => d.startAngle)
      .endAngle((d: SectorData) => d.endAngle);

    const sectorPaths = container.selectAll<SVGPathElement, SectorData>('.sector')
      .data(sectorData)
      .enter()
      .append('path')
      .attr('class', 'sector')
      .attr('d', arcGenerator)
      .attr('transform', `translate(${center},${center})`)
      .attr('fill', 'transparent') // Initial fill, updated in updatePosition
      .attr('stroke', config.diagonalStrokeColor)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.2); // Initial opacity

    // Main axes
    container.append('line').attr('x1', 20).attr('y1', center).attr('x2', svgSize - 20).attr('y2', center).attr('stroke', config.mainAxisStrokeColor).attr('stroke-width', 1.5);
    container.append('line').attr('x1', center).attr('y1', 20).attr('x2', center).attr('y2', svgSize - 20).attr('stroke', config.mainAxisStrokeColor).attr('stroke-width', 1.5);
    container.append('circle').attr('cx', center).attr('cy', center).attr('r', radius).attr('fill', 'none').attr('stroke', config.circleStrokeColor).attr('stroke-width', 2);

    const dragButton = container.append('circle')
      .attr('class', 'mood-button')
      .attr('r', buttonRadius)
      .attr('fill', config.circleStrokeColor)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'grab');

    const activeLabelText = container.append('text')
      .attr('class', 'active-sector-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', config.textColor)
      .style('pointer-events', 'none');

    // Axis labels
    container.append('text').attr('x', center).attr('y', 15).attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', '600').attr('fill', config.textColor).text('Arousal+');
    container.append('text').attr('x', center).attr('y', svgSize - 5).attr('text-anchor', 'middle').attr('font-size', '13px').attr('font-weight', '600').attr('fill', config.textColor).text('Arousal-');
    container.append('text').attr('x', svgSize - 5).attr('y', center + 5).attr('text-anchor', 'end').attr('font-size', '13px').attr('font-weight', '600').attr('fill', config.textColor).text('Valence+');
    container.append('text').attr('x', 15).attr('y', center + 5).attr('text-anchor', 'start').attr('font-size', '13px').attr('font-weight', '600').attr('fill', config.textColor).text('Valence-');

    function updateVisuals(newAngle: number) {
      currentAngleRadRef.current = newAngle;
      currentSectorIndexRef.current = Math.floor(newAngle / (Math.PI / 4)) % 8;

      const buttonX = center + Math.cos(newAngle) * radius;
      const buttonY = center - Math.sin(newAngle) * radius; // SVG Y is inverted
      dragButton.attr('cx', buttonX).attr('cy', buttonY);

      sectorPaths
        .attr('fill', (d: SectorData) => d.index === currentSectorIndexRef.current ? d.color : 'transparent')
        .attr('opacity', (d: SectorData) => d.index === currentSectorIndexRef.current ? 0.5 : 0.2);

      if (currentSectorIndexRef.current >= 0 && config.sectorLabels[currentSectorIndexRef.current]) {
        const labelAngle = currentSectorIndexRef.current * (Math.PI / 4) + (Math.PI / 8); // Midpoint of sector
        const labelX = center + Math.cos(labelAngle) * (radius * 0.65);
        const labelY = center - Math.sin(labelAngle) * (radius * 0.65); // SVG Y inverted
        activeLabelText
          .attr('x', labelX)
          .attr('y', labelY)
          .text(config.sectorLabels[currentSectorIndexRef.current]);
      } else {
        activeLabelText.text(''); // Clear label if somehow out of bounds
      }

      if (onMoodChange) {
        const x = Math.cos(newAngle);
        const y = Math.sin(newAngle); // Math positive Y is Arousal+
        onMoodChange({
          x,
          y,
          sector: currentSectorIndexRef.current,
          angle: newAngle * 180 / Math.PI
        });
      }
    }

    // Type for 'this' in D3 drag event handlers
    type DraggedElement = SVGCircleElement;

    const dragBehavior = d3.drag<SVGCircleElement, unknown, SVGCircleElement>()
      .on('start', function (this: DraggedElement, event: d3.D3DragEvent<DraggedElement, unknown, SVGCircleElement>) {
        d3.select(this).style('cursor', 'grabbing');
      })
      .on('drag', function (this: DraggedElement, event: d3.D3DragEvent<DraggedElement, unknown, SVGCircleElement>) {
        const ptr = d3.pointer(event, container.node() as SVGGElement);
        const dx = ptr[0] - center;
        const dy = ptr[1] - center;
        let newCalculatedAngle = Math.atan2(-dy, dx);
        if (newCalculatedAngle < 0) newCalculatedAngle += 2 * Math.PI;
        updateVisuals(newCalculatedAngle);
      })
      .on('end', function (this: DraggedElement) { // event is not used here, so can be omitted from signature
        d3.select(this).style('cursor', 'grab');
      });

    dragButton.call(dragBehavior);

    // Initial setup
    updateVisuals(currentAngleRadRef.current);

    // SVG attributes
    svg.attr('width', svgSize).attr('height', svgSize).style('font-family', 'Helvetica, Arial, sans-serif');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMoodChange, config, sectorData]); // Added config and sectorData to dependency array

  return <svg ref={svgRef}></svg>;
};

export default MoodWheelDiagram; 