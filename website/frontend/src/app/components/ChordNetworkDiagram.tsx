import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as Tone from 'tone';

// Local type definitions for chord data structure
interface ChordNode {
  id: string;
  root: string;
  quality: string;
  count: number;
  angle?: number;
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

interface ChordNetworkDiagramProps {
  cultureId?: string;
  width?: number;
  height?: number;
}

const ChordNetworkDiagram: React.FC<ChordNetworkDiagramProps> = ({
  cultureId = 'brazil',
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<ChordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [topCount, setTopCount] = useState<number>(100);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "sine" },
          envelope: { attack: 0.02, decay: 0.2, sustain: 0.3, release: 1 }
        }).toDestination();

        const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).toDestination();
        synthRef.current.connect(reverb);
        setAudioReady(true);
      } catch (err) {
        console.warn('Audio initialization failed:', err);
      }
    };

    initAudio();
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  // Chord to notes mapping
  const getChordNotes = (chordName: string): string[] => {
    const cleanChord = chordName.replace(/maj7?/i, '').replace(/min7?/i, 'm').replace(/7$/, '7').trim();
    
    const chordMap: Record<string, string[]> = {
      // Major chords
      'C': ['C4', 'E4', 'G4'], 'Cmaj': ['C4', 'E4', 'G4'],
      'D': ['D4', 'F#4', 'A4'], 'Dmaj': ['D4', 'F#4', 'A4'],
      'E': ['E4', 'G#4', 'B4'], 'Emaj': ['E4', 'G#4', 'B4'],
      'F': ['F4', 'A4', 'C5'], 'Fmaj': ['F4', 'A4', 'C5'],
      'G': ['G4', 'B4', 'D5'], 'Gmaj': ['G4', 'B4', 'D5'],
      'A': ['A4', 'C#5', 'E5'], 'Amaj': ['A4', 'C#5', 'E5'],
      'B': ['B4', 'D#5', 'F#5'], 'Bmaj': ['B4', 'D#5', 'F#5'],
      'Db': ['Db4', 'F4', 'Ab4'], 'Dbmaj': ['Db4', 'F4', 'Ab4'],
      'Eb': ['Eb4', 'G4', 'Bb4'], 'Ebmaj': ['Eb4', 'G4', 'Bb4'],
      'Gb': ['Gb4', 'Bb4', 'Db5'], 'Gbmaj': ['Gb4', 'Bb4', 'Db5'],
      'Ab': ['Ab4', 'C5', 'Eb5'], 'Abmaj': ['Ab4', 'C5', 'Eb5'],
      'Bb': ['Bb4', 'D5', 'F5'], 'Bbmaj': ['Bb4', 'D5', 'F5'],
      
      // Minor chords
      'Am': ['A4', 'C5', 'E5'], 'Amin': ['A4', 'C5', 'E5'],
      'Bm': ['B4', 'D5', 'F#5'], 'Bmin': ['B4', 'D5', 'F#5'],
      'Cm': ['C4', 'Eb4', 'G4'], 'Cmin': ['C4', 'Eb4', 'G4'],
      'Dm': ['D4', 'F4', 'A4'], 'Dmin': ['D4', 'F4', 'A4'],
      'Em': ['E4', 'G4', 'B4'], 'Emin': ['E4', 'G4', 'B4'],
      'Fm': ['F4', 'Ab4', 'C5'], 'Fmin': ['F4', 'Ab4', 'C5'],
      'Gm': ['G4', 'Bb4', 'D5'], 'Gmin': ['G4', 'Bb4', 'D5'],
      'Dbm': ['Db4', 'E4', 'Ab4'], 'Dbmin': ['Db4', 'E4', 'Ab4'],
      'Ebm': ['Eb4', 'Gb4', 'Bb4'], 'Ebmin': ['Eb4', 'Gb4', 'Bb4'],
      'Gbm': ['Gb4', 'A4', 'Db5'], 'Gbmin': ['Gb4', 'A4', 'Db5'],
      'Abm': ['Ab4', 'B4', 'Eb5'], 'Abmin': ['Ab4', 'B4', 'Eb5'],
      'Bbm': ['Bb4', 'Db5', 'F5'], 'Bbmin': ['Bb4', 'Db5', 'F5'],
      
      // 7th chords
      'C7': ['C4', 'E4', 'G4', 'Bb4'],
      'D7': ['D4', 'F#4', 'A4', 'C5'],
      'E7': ['E4', 'G#4', 'B4', 'D5'],
      'F7': ['F4', 'A4', 'C5', 'Eb5'],
      'G7': ['G4', 'B4', 'D5', 'F5'],
      'A7': ['A4', 'C#5', 'E5', 'G5'],
      'B7': ['B4', 'D#5', 'F#5', 'A5'],
      'Db7': ['Db4', 'F4', 'Ab4', 'B4'],
      'Eb7': ['Eb4', 'G4', 'Bb4', 'Db5'],
      'Gb7': ['Gb4', 'Bb4', 'Db5', 'E5'],
      'Ab7': ['Ab4', 'C5', 'Eb5', 'Gb5'],
      'Bb7': ['Bb4', 'D5', 'F5', 'Ab5'],
      
      // Minor 7th chords
      'Am7': ['A4', 'C5', 'E5', 'G5'], 'Amin7': ['A4', 'C5', 'E5', 'G5'],
      'Bm7': ['B4', 'D5', 'F#5', 'A5'], 'Bmin7': ['B4', 'D5', 'F#5', 'A5'],
      'Cm7': ['C4', 'Eb4', 'G4', 'Bb4'], 'Cmin7': ['C4', 'Eb4', 'G4', 'Bb4'],
      'Dm7': ['D4', 'F4', 'A4', 'C5'], 'Dmin7': ['D4', 'F4', 'A4', 'C5'],
      'Em7': ['E4', 'G4', 'B4', 'D5'], 'Emin7': ['E4', 'G4', 'B4', 'D5'],
      'Fm7': ['F4', 'Ab4', 'C5', 'Eb5'], 'Fmin7': ['F4', 'Ab4', 'C5', 'Eb5'],
      'Gm7': ['G4', 'Bb4', 'D5', 'F5'], 'Gmin7': ['G4', 'Bb4', 'D5', 'F5'],
      'Dbm7': ['Db4', 'E4', 'Ab4', 'B4'], 'Dbmin7': ['Db4', 'E4', 'Ab4', 'B4'],
      'Ebm7': ['Eb4', 'Gb4', 'Bb4', 'Db5'], 'Ebmin7': ['Eb4', 'Gb4', 'Bb4', 'Db5'],
      'Gbm7': ['Gb4', 'A4', 'Db5', 'E5'], 'Gbmin7': ['Gb4', 'A4', 'Db5', 'E5'],
      'Abm7': ['Ab4', 'B4', 'Eb5', 'Gb5'], 'Abmin7': ['Ab4', 'B4', 'Eb5', 'Gb5'],
      'Bbm7': ['Bb4', 'Db5', 'F5', 'Ab5'], 'Bbmin7': ['Bb4', 'Db5', 'F5', 'Ab5'],
      
      // Major 7th chords
      'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
      'Dmaj7': ['D4', 'F#4', 'A4', 'C#5'],
      'Emaj7': ['E4', 'G#4', 'B4', 'D#5'],
      'Fmaj7': ['F4', 'A4', 'C5', 'E5'],
      'Gmaj7': ['G4', 'B4', 'D5', 'F#5'],
      'Amaj7': ['A4', 'C#5', 'E5', 'G#5'],
      'Bmaj7': ['B4', 'D#5', 'F#5', 'A#5'],
      'Dbmaj7': ['Db4', 'F4', 'Ab4', 'C5'],
      'Ebmaj7': ['Eb4', 'G4', 'Bb4', 'D5'],
      'Gbmaj7': ['Gb4', 'Bb4', 'Db5', 'F5'],
      'Abmaj7': ['Ab4', 'C5', 'Eb5', 'G5'],
      'Bbmaj7': ['Bb4', 'D5', 'F5', 'A5']
    };

    return chordMap[cleanChord] || chordMap[cleanChord.charAt(0)] || ['C4', 'E4', 'G4'];
  };

  // Play chord function
  const playChord = async (chordName: string) => {
    if (!audioReady || !synthRef.current) {
      try {
        await Tone.start();
        setAudioReady(true);
      } catch (err) {
        console.warn('Could not start audio:', err);
        return;
      }
    }

    if (synthRef.current) {
      const notes = getChordNotes(chordName);
      synthRef.current.triggerAttackRelease(notes, '1n');
    }
  };

  // Load data function
  const loadData = async (culture: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/data_circular/${culture}.json`);
      if (response.ok) {
        const jsonData: ChordData = await response.json();
        setData(jsonData);
      } else {
        console.error(`Failed to load data for culture: ${culture}, status: ${response.status}`);
        setError(`Failed to load data for ${culture}. Status: ${response.status}`);
        setData({ nodes: [{ id: "N/A", root: "C", quality: "maj", count: 1 }], links: [] });
      }
    } catch (err) {
      console.error('Error fetching or parsing data:', err);
      setError(`Error loading data for ${culture}.`);
      setData({ nodes: [{ id: "Error", root: "C", quality: "maj", count: 1 }], links: [] });
    } finally {
      setLoading(false);
    }
  };

  // Load data when cultureId changes
  useEffect(() => {
    loadData(cultureId);
  }, [cultureId]);

  // D3 visualization effect
  useEffect(() => {
    if (!data || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 80;

    // Sort nodes by root note and quality for consistent positioning
    const sortedNodes = [...data.nodes].sort((a, b) => {
      const rootOrder = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
      const aRootIndex = rootOrder.indexOf(a.root) >= 0 ? rootOrder.indexOf(a.root) : 12;
      const bRootIndex = rootOrder.indexOf(b.root) >= 0 ? rootOrder.indexOf(b.root) : 12;
      
      if (aRootIndex !== bRootIndex) return aRootIndex - bRootIndex;
      
      const qualityOrder = ['maj', 'min', '7', 'min7', 'maj7'];
      const aQualIndex = qualityOrder.indexOf(a.quality) >= 0 ? qualityOrder.indexOf(a.quality) : 5;
      const bQualIndex = qualityOrder.indexOf(b.quality) >= 0 ? qualityOrder.indexOf(b.quality) : 5;
      
      return aQualIndex - bQualIndex;
    });

    // Position nodes in a circle
    const nodesWithPosition = sortedNodes.map((node, i) => {
      const angle = (i / sortedNodes.length) * 2 * Math.PI - Math.PI / 2;
      return {
        ...node,
        angle,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    // Filter and sort links by probability/count for top N
    const sortedLinks = [...data.links]
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topCount);

    // Create scales
    const maxProb = d3.max(sortedLinks, d => d.prob) || 1;
    const opacityScale = d3.scaleLinear()
      .domain([0, maxProb])
      .range([0.1, 0.8]);

    const strokeWidthScale = d3.scaleLinear()
      .domain([0, maxProb])
      .range([0.5, 3]);

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "chord-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)");

    // Draw links as curves
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
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.7;

        return `M${sourceNode.x},${sourceNode.y}A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`;
      })
      .attr("stroke", "#4A90E2")
      .attr("stroke-width", d => strokeWidthScale(d.prob))
      .attr("stroke-opacity", d => opacityScale(d.prob))
      .attr("fill", "none")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .html(`<strong>${d.source} → ${d.target}</strong><br/>
                 Probability: ${(d.prob * 100).toFixed(1)}%<br/>
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

    // Draw outer ring for root notes
    const rootNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const outerRadius = radius + 40;
    
    svg.append("g")
      .attr("class", "root-labels")
      .selectAll("text")
      .data(rootNotes)
      .enter().append("text")
      .attr("x", (d, i) => {
        const angle = (i / rootNotes.length) * 2 * Math.PI - Math.PI / 2;
        return centerX + Math.cos(angle) * outerRadius;
      })
      .attr("y", (d, i) => {
        const angle = (i / rootNotes.length) * 2 * Math.PI - Math.PI / 2;
        return centerY + Math.sin(angle) * outerRadius;
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .text(d => d);

    // Draw quality rings
    const qualityLabels = ['major', 'minor', 'dom 7', 'min 7', 'maj 7'];
    const qualityRadius = [radius * 0.6, radius * 0.7, radius * 0.8, radius * 0.9, radius];
    
    svg.append("g")
      .attr("class", "quality-labels")
      .selectAll("text")
      .data(qualityLabels)
      .enter().append("text")
      .attr("x", centerX - outerRadius - 20)
      .attr("y", (d, i) => centerY - 60 + i * 15)
      .attr("font-size", "12px")
      .attr("fill", "#666")
      .text(d => d);

    // Draw nodes
    const nodeElements = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodesWithPosition)
      .enter().append("circle")
      .attr("cx", d => d.x!)
      .attr("cy", d => d.y!)
      .attr("r", 8)
      .attr("fill", d => {
        if (d.quality.includes('min')) return '#E74C3C';
        if (d.quality.includes('7')) return '#F39C12';
        return '#4A90E2';
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", async (event, d) => {
        event.stopPropagation();
        await playChord(d.id);
        
        // Visual feedback
        d3.select(event.currentTarget)
          .transition()
          .duration(100)
          .attr("r", 12)
          .transition()
          .duration(300)
          .attr("r", 8);
      })
      .on("mouseover", (event, d) => {
        const outgoingLinks = sortedLinks.filter(l => l.source === d.id);
        
        let tooltipContent = `<strong>${d.id}</strong><br/>`;
        tooltipContent += `Count: ${d.count}<br/>`;
        
        if (outgoingLinks.length > 0) {
          tooltipContent += `<br/><strong>Top transitions:</strong><br/>`;
          outgoingLinks.slice(0, 5).forEach(link => {
            tooltipContent += `${link.source} → ${link.target}: ${(link.prob * 100).toFixed(1)}%<br/>`;
          });
        }
        tooltipContent += `<br/><em>Click to play chord!</em>`;

        tooltip.style("visibility", "visible").html(tooltipContent);
        
        // Highlight connected elements
        nodeElements.style("opacity", (n: ChordNode) => 
          n === d || outgoingLinks.some(l => l.target === n.id) ? 1 : 0.3);
        
        linkElements.style("opacity", (l: ChordLink) => 
          l.source === d.id ? Math.max(0.6, opacityScale(l.prob)) : 0.1);
      })
      .on("mousemove", (event: MouseEvent) => {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        nodeElements.style("opacity", 1);
        linkElements.style("opacity", d => opacityScale(d.prob));
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
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text(d => d.id.length > 4 ? d.id.slice(0, 3) + '...' : d.id);

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [data, width, height, loading, topCount]);

  if (loading) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ textAlign: 'center', color: '#6c757d' }}>
          <div style={{ marginBottom: '8px' }}>🎵</div>
          <div>Loading chords...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8d7da',
        borderRadius: '8px',
        border: '1px solid #f5c6cb'
      }}>
        <div style={{ color: '#721c24', textAlign: 'center', fontSize: '14px' }}>
          <div>⚠️ Could not load chord data</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Using fallback data</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      {/* Controls */}
      <div style={{ 
        position: 'absolute', 
        top: 16, 
        left: 16, 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
          {cultureId.replace('-', ' & ')}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          up to {topCount}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          most frequent non-cyclic chord sequences
        </div>
        <select
          value={topCount}
          onChange={(e) => setTopCount(Number(e.target.value))}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white'
          }}
        >
          <option value={25}>Top 25</option>
          <option value={50}>Top 50</option>
          <option value={100}>Top 100</option>
          <option value={200}>Top 200</option>
          <option value={500}>Top 500</option>
        </select>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
          linked circular grid
        </div>
        <div style={{ fontSize: '11px', color: '#888' }}>
          default view
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

      {/* Play instruction */}
      <div style={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        background: 'rgba(74, 144, 226, 0.9)', 
        color: 'white',
        padding: '6px 12px', 
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        🎹 Click chords to play
      </div>
    </div>
  );
};

export default ChordNetworkDiagram;