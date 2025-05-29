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

const RadialChordGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<ChordData | null>(null);
  const [currentGenre, setCurrentGenre] = useState('brazil');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockData: Record<string, ChordData> = {
    brazil: {
      nodes: [
        { id: "Cmaj", root: "C", quality: "maj", count: 450 },
        { id: "C7", root: "C", quality: "7", count: 320 },
        { id: "Cmaj7", root: "C", quality: "maj7", count: 280 },
        { id: "Fmaj", root: "F", quality: "maj", count: 380 },
        { id: "F7", root: "F", quality: "7", count: 220 },
        { id: "Gmaj", root: "G", quality: "maj", count: 340 },
        { id: "G7", root: "G", quality: "7", count: 290 },
        { id: "Am", root: "A", quality: "min", count: 250 },
        { id: "Am7", root: "A", quality: "min7", count: 180 },
        { id: "Dm", root: "D", quality: "min", count: 210 },
        { id: "Em", root: "E", quality: "min", count: 190 },
        { id: "Bbmaj", root: "Bb", quality: "maj", count: 160 },
        { id: "Dbmaj", root: "Db", quality: "maj", count: 140 },
        { id: "Fmin7", root: "F", quality: "min7", count: 130 },
        { id: "Ebmaj", root: "Eb", quality: "maj", count: 120 }
      ],
      links: [
        { source: "Cmaj", target: "Fmaj", count: 45, prob: 0.12 },
        { source: "Cmaj", target: "G7", count: 38, prob: 0.10 },
        { source: "Cmaj", target: "Am", count: 32, prob: 0.085 },
        { source: "Fmaj", target: "Cmaj", count: 42, prob: 0.11 },
        { source: "Fmaj", target: "G7", count: 28, prob: 0.074 },
        { source: "G7", target: "Cmaj", count: 55, prob: 0.19 },
        { source: "G7", target: "Am", count: 22, prob: 0.076 },
        { source: "Am", target: "Dm", count: 25, prob: 0.10 },
        { source: "Am", target: "F7", count: 18, prob: 0.072 },
        { source: "C7", target: "Fmaj", count: 48, prob: 0.15 },
        { source: "Dm", target: "G7", count: 30, prob: 0.14 },
        { source: "Em", target: "Am", count: 20, prob: 0.105 },
        { source: "Bbmaj", target: "Ebmaj", count: 15, prob: 0.094 },
        { source: "Dbmaj", target: "Fmin7", count: 12, prob: 0.086 }
      ]
    },
    jazz: {
      nodes: [
        { id: "Cmaj7", root: "C", quality: "maj7", count: 520 },
        { id: "C7", root: "C", quality: "7", count: 480 },
        { id: "Cm7", root: "C", quality: "min7", count: 380 },
        { id: "Fmaj7", root: "F", quality: "maj7", count: 450 },
        { id: "F7", root: "F", quality: "7", count: 420 },
        { id: "Fm7", root: "F", quality: "min7", count: 350 },
        { id: "G7", root: "G", quality: "7", count: 580 },
        { id: "Gm7", root: "G", quality: "min7", count: 320 },
        { id: "Am7", root: "A", quality: "min7", count: 400 },
        { id: "A7", root: "A", quality: "7", count: 360 },
        { id: "Dm7", root: "D", quality: "min7", count: 380 },
        { id: "D7", root: "D", quality: "7", count: 340 },
        { id: "Em7", root: "E", quality: "min7", count: 290 },
        { id: "E7", root: "E", quality: "7", count: 310 },
        { id: "Bbmaj7", root: "Bb", quality: "maj7", count: 260 }
      ],
      links: [
        { source: "Cmaj7", target: "Am7", count: 65, prob: 0.125 },
        { source: "Am7", target: "Dm7", count: 58, prob: 0.145 },
        { source: "Dm7", target: "G7", count: 62, prob: 0.163 },
        { source: "G7", target: "Cmaj7", count: 78, prob: 0.134 },
        { source: "C7", target: "Fmaj7", count: 72, prob: 0.15 },
        { source: "Fmaj7", target: "Em7", count: 45, prob: 0.10 },
        { source: "Em7", target: "A7", count: 48, prob: 0.165 },
        { source: "A7", target: "Dm7", count: 52, prob: 0.144 },
        { source: "Fm7", target: "Bbmaj7", count: 38, prob: 0.109 },
        { source: "Gm7", target: "C7", count: 42, prob: 0.131 }
      ]
    },
    classical: {
      nodes: [
        { id: "Cmaj", root: "C", quality: "maj", count: 680 },
        { id: "Fmaj", root: "F", quality: "maj", count: 520 },
        { id: "Gmaj", root: "G", quality: "maj", count: 580 },
        { id: "Am", root: "A", quality: "min", count: 450 },
        { id: "Dm", root: "D", quality: "min", count: 420 },
        { id: "Em", root: "E", quality: "min", count: 380 },
        { id: "G7", root: "G", quality: "7", count: 340 },
        { id: "D7", root: "D", quality: "7", count: 290 },
        { id: "A7", root: "A", quality: "7", count: 260 },
        { id: "E7", root: "E", quality: "7", count: 240 },
        { id: "Bbmaj", root: "Bb", quality: "maj", count: 180 },
        { id: "Ebmaj", root: "Eb", quality: "maj", count: 160 }
      ],
      links: [
        { source: "Cmaj", target: "Fmaj", count: 85, prob: 0.125 },
        { source: "Cmaj", target: "Am", count: 78, prob: 0.115 },
        { source: "Cmaj", target: "G7", count: 72, prob: 0.106 },
        { source: "Fmaj", target: "Cmaj", count: 68, prob: 0.131 },
        { source: "Fmaj", target: "Dm", count: 55, prob: 0.106 },
        { source: "Gmaj", target: "Cmaj", count: 82, prob: 0.141 },
        { source: "G7", target: "Cmaj", count: 95, prob: 0.279 },
        { source: "Am", target: "Dm", count: 48, prob: 0.107 },
        { source: "Am", target: "Fmaj", count: 42, prob: 0.093 },
        { source: "Dm", target: "G7", count: 58, prob: 0.138 },
        { source: "D7", target: "Gmaj", count: 52, prob: 0.179 },
        { source: "A7", target: "Dm", count: 38, prob: 0.146 },
        { source: "E7", target: "Am", count: 35, prob: 0.146 }
      ]
    }
  };

  // Pitch class mapping (enharmonic equivalents merged)
  const pitchClasses = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  // Normalize enharmonic equivalents
  const normalizePitchClass = (root: string): string => {
    const enharmonicMap: Record<string, string> = {
      'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
      'Cs': 'Db', 'Ds': 'Eb', 'Fs': 'Gb', 'Gs': 'Ab', 'As': 'Bb'
    };
    return enharmonicMap[root] || root;
  };

  // Quality ordering for radial distance
  const qualityOrder = ['maj', 'min', '7', 'maj7', 'min7', '6', 'dim', 'aug', 'sus4', 'sus2'];

  const loadData = (genre: string) => {
    setLoading(true);
    // Simulate async loading
    setTimeout(() => {
      setData(mockData[genre] || mockData.brazil);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadData(currentGenre);
  }, [currentGenre]);

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
      <div className="flex items-center justify-center w-full h-96">
        <div className="text-center">
          <div className="text-2xl mb-2">🎵</div>
          <div>Loading chord transitions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Genre selector */}
      <div className="mb-4 flex gap-2">
        {Object.keys(mockData).map(genre => (
          <button
            key={genre}
            onClick={() => setCurrentGenre(genre)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentGenre === genre
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {genre.charAt(0).toUpperCase() + genre.slice(1)}
          </button>
        ))}
      </div>

      {/* Info panel */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <div className="font-medium mb-1">Radial Chord Transition Graph</div>
        <div>• Radial arms = pitch classes (C, D♭, D, etc.)</div>
        <div>• Distance from center = chord quality</div>
        <div>• Circle size = usage frequency</div>
        <div>• Edge opacity = transition probability</div>
        <div className="mt-2 text-xs text-blue-600">
          Hover over chords and transitions for details
        </div>
      </div>

      {/* Main visualization */}
      <svg
        ref={svgRef}
        width={800}
        height={600}
        className="border border-gray-200 rounded-lg bg-white"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default ChordNetworkDiagram;