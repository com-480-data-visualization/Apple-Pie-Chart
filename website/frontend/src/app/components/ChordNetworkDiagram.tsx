import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Type definitions
interface ChordNode {
  id: string;
  root: string;
  quality: string;
  count: number;
  angle?: number;
  radius?: number;
  x?: number;
  y?: number;
}

interface ChordLink {
  source: string;
  target: string;
  count: number;
  prob: number;
}

interface ChordData {
  nodes: ChordNode[];
  links: ChordLink[];
}

interface RadialChordGraphProps {
  cultureId: string;
  width?: number;
  height?: number;
}

const RadialChordGraph: React.FC<RadialChordGraphProps> = ({ 
  cultureId,
  width = 800,
  height = 600 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<ChordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxEdges, setMaxEdges] = useState<number>(50);

  // Target design specifications
  const rootOrder = ["F", "C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#"];
  const qualityOrder = ["min7", "maj7", "min", "maj", "7"]; // outermost to innermost

  // Normalize enharmonic equivalents to match root order
  const normalizePitchClass = (root: string): string => {
    const enharmonicMap: Record<string, string> = {
      'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Db': 'C#', 'Eb': 'D#',
      'Fs': 'F#', 'Gs': 'G#', 'As': 'A#', 'Cs': 'C#', 'Ds': 'D#'
    };
    return enharmonicMap[root] || root;
  };

  const loadData = async (culture: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/data_circular/${culture}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load data for ${culture}. Status: ${response.status}`);
      }
      
      const jsonData: ChordData = await response.json();
      setData(jsonData);
    } catch (err) {
      console.error('Error fetching or parsing data:', err);
      setError(`Failed to load data for ${culture}. ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Provide fallback empty data
      setData({ 
        nodes: [{ id: "No Data", root: "C", quality: "maj", count: 1 }], 
        links: [] 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(cultureId);
  }, [cultureId]);

  useEffect(() => {
    if (!data || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 80;

    // Position nodes in radial layout
    const nodesWithPosition = data.nodes.map(node => {
      const normalizedRoot = normalizePitchClass(node.root);
      const pitchIndex = pitchClasses.indexOf(normalizedRoot);
      const angle = (pitchIndex / pitchClasses.length) * 2 * Math.PI - Math.PI / 2;
      
      const qualityIndex = qualityOrder.indexOf(node.quality);
      const qualityRadius = qualityIndex >= 0 ? 
        (qualityIndex + 1) / qualityOrder.length * maxRadius * 0.8 + maxRadius * 0.2 :
        maxRadius * 0.9;

      return {
        ...node,
        angle,
        radius: qualityRadius,
        x: centerX + Math.cos(angle) * qualityRadius,
        y: centerY + Math.sin(angle) * qualityRadius
      };
    });

    // Scales for visual encoding
    const maxCount = d3.max(data.nodes, d => d.count) || 1;
    const radiusScale = d3.scaleSqrt()
      .domain([0, maxCount])
      .range([3, 15]);

    const opacityScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([0.3, 1]);

    const maxProb = d3.max(data.links, d => d.prob) || 1;
    const linkOpacityScale = d3.scaleLinear()
      .domain([0, maxProb])
      .range([0.1, 0.8]);

    const linkWidthScale = d3.scaleLinear()
      .domain([0, maxProb])
      .range([0.5, 4]);

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "chord-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)");

    // Draw radial grid lines (pitch class arms)
    svg.append("g")
      .attr("class", "pitch-arms")
      .selectAll("line")
      .data(pitchClasses)
      .enter().append("line")
      .attr("x1", centerX)
      .attr("y1", centerY)
      .attr("x2", (d, i) => {
        const angle = (i / pitchClasses.length) * 2 * Math.PI - Math.PI / 2;
        return centerX + Math.cos(angle) * maxRadius;
      })
      .attr("y2", (d, i) => {
        const angle = (i / pitchClasses.length) * 2 * Math.PI - Math.PI / 2;
        return centerY + Math.sin(angle) * maxRadius;
      })
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    // Draw pitch class labels
    svg.append("g")
      .attr("class", "pitch-labels")
      .selectAll("text")
      .data(pitchClasses)
      .enter().append("text")
      .attr("x", (d, i) => {
        const angle = (i / pitchClasses.length) * 2 * Math.PI - Math.PI / 2;
        return centerX + Math.cos(angle) * (maxRadius + 25);
      })
      .attr("y", (d, i) => {
        const angle = (i / pitchClasses.length) * 2 * Math.PI - Math.PI / 2;
        return centerY + Math.sin(angle) * (maxRadius + 25);
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .text(d => d);

    // Draw quality rings as reference
    svg.append("g")
      .attr("class", "quality-rings")
      .selectAll("circle")
      .data(qualityOrder.slice(0, 5))
      .enter().append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", (d, i) => (i + 1) / 5 * maxRadius * 0.8 + maxRadius * 0.2)
      .attr("fill", "none")
      .attr("stroke", "#f0f0f0")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "1,3");

    // Draw links
    const linkElements = svg.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(data.links)
      .enter().append("path")
      .attr("d", d => {
        const sourceNode = nodesWithPosition.find(n => n.id === d.source);
        const targetNode = nodesWithPosition.find(n => n.id === d.target);
        
        if (!sourceNode || !targetNode) return "";

        // Create curved path
        const dx = targetNode.x! - sourceNode.x!;
        const dy = targetNode.y! - sourceNode.y!;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.3;

        return `M${sourceNode.x},${sourceNode.y}A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`;
      })
      .attr("stroke", "#4A90E2")
      .attr("stroke-width", d => linkWidthScale(d.prob))
      .attr("stroke-opacity", d => linkOpacityScale(d.prob))
      .attr("fill", "none")
      .attr("marker-end", "url(#arrowhead)")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .html(`<strong>${d.source} → ${d.target}</strong><br/>
                 ${(d.prob * 100).toFixed(1)}% of transitions<br/>
                 Count: ${d.count}`);
      })
      .on("mousemove", (event: MouseEvent) => {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Add arrow markers
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#4A90E2");

    // Draw nodes
    const nodeElements = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodesWithPosition)
      .enter().append("circle")
      .attr("cx", d => d.x!)
      .attr("cy", d => d.y!)
      .attr("r", d => radiusScale(d.count))
      .attr("fill", d => {
        if (d.quality.includes('min')) return '#E74C3C';
        if (d.quality.includes('7')) return '#F39C12';
        if (d.quality === 'maj') return '#4A90E2';
        return '#9B59B6';
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", d => opacityScale(d.count))
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .html(`<strong>Chord: ${d.id}</strong><br/>
                 Played ${d.count} times<br/>
                 Root: ${d.root} | Quality: ${d.quality}`);

        // Highlight connected elements
        const connectedLinks = data.links.filter(l => 
          l.source === d.id || l.target === d.id
        );
        
        nodeElements.style("opacity", (n: ChordNode) => {
          if (n === d) return 1;
          if (connectedLinks.some(l => l.source === n.id || l.target === n.id)) {
            return opacityScale(n.count);
          }
          return 0.2;
        });
        
        linkElements.style("opacity", (l: ChordLink) => 
          l.source === d.id || l.target === d.id ? 
            Math.max(0.6, linkOpacityScale(l.prob)) : 0.1
        );
      })
      .on("mousemove", (event: MouseEvent) => {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        nodeElements.style("opacity", d => opacityScale(d.count));
        linkElements.style("opacity", d => linkOpacityScale(d.prob));
      });

    // Add chord labels
    svg.append("g")
      .attr("class", "chord-labels")
      .selectAll("text")
      .data(nodesWithPosition)
      .enter().append("text")
      .attr("x", d => d.x!)
      .attr("y", d => d.y!)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "9px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text(d => d.id.length > 5 ? d.id.slice(0, 4) + '...' : d.id);

    // Quality legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, 20)`);

    const legendData = [
      { quality: 'Major', color: '#4A90E2' },
      { quality: 'Minor', color: '#E74C3C' },
      { quality: '7th', color: '#F39C12' },
      { quality: 'Other', color: '#9B59B6' }
    ];

    legend.selectAll("g")
      .data(legendData)
      .enter().append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)
      .each(function(d) {
        const g = d3.select(this);
        g.append("circle")
          .attr("r", 6)
          .attr("fill", d.color);
        g.append("text")
          .attr("x", 15)
          .attr("dy", "0.35em")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .text(d.quality);
      });

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [data, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="text-center">
          <div className="text-2xl mb-2">🎵</div>
          <div className="text-sm">Loading chord transitions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 mb-2 text-sm">⚠️ Error Loading Data</div>
          <div className="text-xs text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      {/* Info panel */}
      <div style={{ 
        position: 'absolute', 
        top: 8, 
        left: 8, 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '8px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10,
        fontSize: '11px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>
          Radial Layout
        </div>
        <div style={{ color: '#666', lineHeight: '1.3' }}>
          • Arms = pitch classes<br/>
          • Distance = chord quality<br/>
          • Size = frequency<br/>
          • Hover for details
        </div>
      </div>

      {/* Quality legend */}
      <div style={{ 
        position: 'absolute', 
        top: 8, 
        right: 8, 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '8px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10,
        fontSize: '10px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>
          Chord Types
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4A90E2' }}></div>
            <span style={{ color: '#666' }}>Major</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E74C3C' }}></div>
            <span style={{ color: '#666' }}>Minor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F39C12' }}></div>
            <span style={{ color: '#666' }}>7th</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9B59B6' }}></div>
            <span style={{ color: '#666' }}>Other</span>
          </div>
        </div>
      </div>

      {/* Main visualization */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ 
          background: '#fafafa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}
      />
    </div>
  );
};

export default RadialChordGraph;