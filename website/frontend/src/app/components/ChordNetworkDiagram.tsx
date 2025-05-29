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

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 80;

    // Create a circular angle map with 12 equally spaced angles
    const rootAngles = new Map(
      rootOrder.map((note, i) => [note, (2 * Math.PI / 12) * i])
    );

    const angleScale = (root: string): number => {
      return rootAngles.get(root) ?? 0;
    };

    const radiusScale = d3.scalePoint()
      .domain(qualityOrder)
      .range([maxRadius * 0.8, maxRadius * 0.2]); // outermost to innermost

    // Position all nodes (even those without connections)
    const nodesWithPosition = data.nodes.map(node => {
      const normalizedRoot = normalizePitchClass(node.root);
      const angle = angleScale(normalizedRoot) || 0;
      const radius = radiusScale(node.quality) || maxRadius * 0.5;

      return {
        ...node,
        angle,
        radius,
        x: centerX + Math.cos(angle - Math.PI / 2) * radius, // -PI/2 to start at 12:00
        y: centerY + Math.sin(angle - Math.PI / 2) * radius
      };
    });

    // Filter and sort links by count for top N
    const sortedLinks = [...data.links]
      .sort((a, b) => b.count - a.count)
      .slice(0, maxEdges);

    // Scales for visual encoding
    const maxCount = d3.max(data.nodes, d => d.count) || 1;
    const minCount = d3.min(data.nodes, d => d.count) || 1;
    
    const nodeOpacityScale = d3.scaleLinear()
      .domain([minCount, maxCount])
      .range([0.2, 1]);

    const nodeSizeScale = d3.scaleSqrt()
      .domain([0, maxCount])
      .range([4, 12]);

    const maxLinkCount = d3.max(sortedLinks, d => d.count) || 1;
    const linkOpacityScale = d3.scaleLinear()
      .domain([0, maxLinkCount])
      .range([0.2, 0.8]);

    const linkWidthScale = d3.scaleLinear()
      .domain([0, maxLinkCount])
      .range([1, 4]);

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
      .data(rootOrder)
      .enter().append("line")
      .attr("x1", centerX)
      .attr("y1", centerY)
      .attr("x2", d => {
        const angle = angleScale(d) || 0;
        return centerX + Math.cos(angle - Math.PI / 2) * maxRadius;
      })
      .attr("y2", d => {
        const angle = angleScale(d) || 0;
        return centerY + Math.sin(angle - Math.PI / 2) * maxRadius;
      })
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,4");

    // Draw pitch class labels (once per radial arm at outermost edge)
    svg.append("g")
      .attr("class", "pitch-labels")
      .selectAll("text")
      .data(rootOrder)
      .enter().append("text")
      .attr("x", d => {
        const angle = angleScale(d) || 0;
        return centerX + Math.cos(angle - Math.PI / 2) * (maxRadius + 20);
      })
      .attr("y", d => {
        const angle = angleScale(d) || 0;
        return centerY + Math.sin(angle - Math.PI / 2) * (maxRadius + 20);
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .text(d => d);

    // Draw chord quality labels (once per ring, aligned on F arm)
    const fAngle = angleScale("F") || 0;
    svg.append("g")
      .attr("class", "quality-labels")
      .selectAll("text")
      .data(qualityOrder)
      .enter().append("text")
      .attr("x", d => {
        const radius = radiusScale(d) || 0;
        return centerX + Math.cos(fAngle - Math.PI / 2) * (radius + 12);
      })
      .attr("y", d => {
        const radius = radiusScale(d) || 0;
        return centerY + Math.sin(fAngle - Math.PI / 2) * (radius + 12);
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("fill", "#000")
      .style("background", "rgba(255, 255, 255, 0.9)")
      .text(d => d);

    // Draw links
    const linkElements = svg.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(sortedLinks)
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
      .attr("stroke-width", d => linkWidthScale(d.count))
      .attr("stroke-opacity", d => linkOpacityScale(d.count))
      .attr("fill", "none")
      .attr("marker-end", "url(#arrowhead)")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .html(`<strong>${d.source} → ${d.target}</strong><br/>
                 Count: ${d.count}<br/>
                 Probability: ${(d.prob * 100).toFixed(1)}%`);
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

    // Color function based on quality
    const getNodeColor = (quality: string): string => {
      const qualityIndex = qualityOrder.indexOf(quality);
      if (qualityIndex === -1) return "#6B7280"; // gray for unknown qualities
      
      // Vary saturation/lightness by quality
      const saturation = 60 + (qualityIndex * 8); // 60-92%
      const lightness = 45 + (qualityIndex * 5);  // 45-65%
      return `hsl(210, ${saturation}%, ${lightness}%)`;
    };

    // Draw nodes (all chords, even those without connections)
    const nodeElements = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodesWithPosition)
      .enter().append("circle")
      .attr("cx", d => d.x!)
      .attr("cy", d => d.y!)
      .attr("r", d => nodeSizeScale(d.count))
      .attr("fill", d => {
        // Check if this node participates in any filtered links
        const hasConnections = sortedLinks.some(l => l.source === d.id || l.target === d.id);
        return hasConnections ? getNodeColor(d.quality) : "#9CA3AF"; // gray if no connections
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("opacity", d => {
        // Check if this node participates in any filtered links
        const hasConnections = sortedLinks.some(l => l.source === d.id || l.target === d.id);
        return hasConnections ? nodeOpacityScale(d.count) : 0.3; // faint if no connections
      })
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        const connectedLinks = sortedLinks.filter(l => 
          l.source === d.id || l.target === d.id
        );
        
        tooltip.style("visibility", "visible")
          .html(`<strong>Chord: ${d.id}</strong><br/>
                 Root: ${d.root} | Quality: ${d.quality}<br/>
                 Count: ${d.count}<br/>
                 Connections: ${connectedLinks.length}`);

        // Highlight connected elements
        nodeElements.style("opacity", (n: ChordNode) => {
          if (n === d) return 1;
          if (connectedLinks.some(l => l.source === n.id || l.target === n.id)) {
            return nodeOpacityScale(n.count);
          }
          return 0.15;
        });
        
        linkElements.style("opacity", (l: ChordLink) => 
          l.source === d.id || l.target === d.id ? 
            Math.max(0.8, linkOpacityScale(l.count)) : 0.1
        );
      })
      .on("mousemove", (event: MouseEvent) => {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        nodeElements.style("opacity", d => {
          const hasConnections = sortedLinks.some(l => l.source === d.id || l.target === d.id);
          return hasConnections ? nodeOpacityScale(d.count) : 0.3;
        });
        linkElements.style("opacity", d => linkOpacityScale(d.count));
      });

    // Add chord labels for larger nodes
    svg.append("g")
      .attr("class", "chord-labels")
      .selectAll("text")
      .data(nodesWithPosition.filter(d => nodeSizeScale(d.count) > 6))
      .enter().append("text")
      .attr("x", d => d.x!)
      .attr("y", d => d.y!)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "8px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text(d => d.id.length > 4 ? d.id.slice(0, 3) : d.id);

    // Quality legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, ${height - 120})`);

    legend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .text("Quality Order (outer → inner)");

    qualityOrder.forEach((quality, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${20 + i * 16})`);
      
      legendItem.append("circle")
        .attr("r", 5)
        .attr("fill", getNodeColor(quality));
      
      legendItem.append("text")
        .attr("x", 12)
        .attr("dy", "0.35em")
        .attr("font-size", "10px")
        .attr("fill", "#666")
        .text(quality);
    });

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [data, width, height, loading, maxEdges]);

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
      {/* Edge filter dropdown */}
      <div style={{ 
        position: 'absolute', 
        top: 8, 
        left: 8, 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '8px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10,
        fontSize: '12px'
      }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>
          Show Top N Transitions:
        </label>
        <select
          value={maxEdges}
          onChange={(e) => setMaxEdges(Number(e.target.value))}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white'
          }}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={75}>75</option>
          <option value={100}>100</option>
          <option value={150}>150</option>
          <option value={200}>200</option>
        </select>
      </div>

      {/* Info panel */}
      <div style={{ 
        position: 'absolute', 
        top: 8, 
        right: 8, 
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
          • 12:00 = F, clockwise<br/>
          • Distance = quality<br/>
          • Size = frequency<br/>
          • Gray = no connections
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