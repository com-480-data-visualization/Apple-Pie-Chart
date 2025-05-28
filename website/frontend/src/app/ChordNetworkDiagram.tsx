import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as Tone from 'tone';

interface ChordNode {
  id: string;
  pagerank: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface ChordLink {
  source: string | ChordNode;
  target: string | ChordNode;
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
  cultureId = 'usa-general',
  width = 400,
  height = 300
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<ChordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create a polyphonic piano synth
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "sine"
          },
          envelope: {
            attack: 0.02,
            decay: 0.2,
            sustain: 0.3,
            release: 1
          }
        }).toDestination();

        // Add some reverb for a more piano-like sound
        const reverb = new Tone.Reverb({
          decay: 1.5,
          wet: 0.3
        }).toDestination();
        
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
    // Clean up chord name - remove common suffixes/prefixes
    const cleanChord = chordName.replace(/maj|major/i, '').replace(/min|minor/i, 'm').trim();
    
    const chordMap: Record<string, string[]> = {
      // Major chords
      'C': ['C4', 'E4', 'G4'],
      'D': ['D4', 'F#4', 'A4'],
      'E': ['E4', 'G#4', 'B4'],
      'F': ['F4', 'A4', 'C5'],
      'G': ['G4', 'B4', 'D5'],
      'A': ['A4', 'C#5', 'E5'],
      'B': ['B4', 'D#5', 'F#5'],
      
      // Minor chords
      'Am': ['A4', 'C5', 'E5'],
      'Bm': ['B4', 'D5', 'F#5'],
      'Cm': ['C4', 'Eb4', 'G4'],
      'Dm': ['D4', 'F4', 'A4'],
      'Em': ['E4', 'G4', 'B4'],
      'Fm': ['F4', 'Ab4', 'C5'],
      'Gm': ['G4', 'Bb4', 'D5'],
      
      // 7th chords
      'Am7': ['A4', 'C5', 'E5', 'G5'],
      'Em7': ['E4', 'G4', 'B4', 'D5'],
      'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
      'Dmaj7': ['D4', 'F#4', 'A4', 'C#5'],
      'Fmaj7': ['F4', 'A4', 'C5', 'E5'],
      'Gmaj7': ['G4', 'B4', 'D5', 'F#5'],
      
      // Extended and altered chords
      'C7': ['C4', 'E4', 'G4', 'Bb4'],
      'D7': ['D4', 'F#4', 'A4', 'C5'],
      'E7': ['E4', 'G#4', 'B4', 'D5'],
      'F7': ['F4', 'A4', 'C5', 'Eb5'],
      'G7': ['G4', 'B4', 'D5', 'F5'],
      'A7': ['A4', 'C#5', 'E5', 'G5'],
      'B7': ['B4', 'D#5', 'F#5', 'A5']
    };

    // Try exact match first, then fuzzy matching
    if (chordMap[cleanChord]) {
      return chordMap[cleanChord];
    }
    
    // Fuzzy matching for different notation styles
    const baseNote = cleanChord.charAt(0).toUpperCase();
    const isMinor = cleanChord.toLowerCase().includes('m') && !cleanChord.toLowerCase().includes('maj');
    
    if (isMinor) {
      return chordMap[baseNote + 'm'] || chordMap[baseNote] || ['C4', 'E4', 'G4'];
    } else {
      return chordMap[baseNote] || ['C4', 'E4', 'G4'];
    }
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
      const response = await fetch(`/data/${culture}.json`);
      if (response.ok) {
        const jsonData = await response.json();
        setData(jsonData);
      } else {
        throw new Error(`Failed to load data for culture: ${culture}`);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Failed to load data for culture: ${culture}`);
      // Create fallback data
      setData({
        nodes: [
          { id: "C", pagerank: 0.20 },
          { id: "G", pagerank: 0.18 },
          { id: "Am", pagerank: 0.15 },
          { id: "F", pagerank: 0.12 }
        ],
        links: [
          { source: "C", target: "G", prob: 0.40 },
          { source: "G", target: "Am", prob: 0.35 },
          { source: "Am", target: "F", prob: 0.45 },
          { source: "F", target: "C", prob: 0.50 }
        ]
      });
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
    svg.selectAll("*").remove(); // Clean up previous render

    // Set up scales
    const radiusScale = d3.scaleLinear()
      .domain(d3.extent(data.nodes, d => d.pagerank) as [number, number])
      .range([8, 25]);

    const widthScale = d3.scaleLinear()
      .domain(d3.extent(data.links, d => d.prob) as [number, number])
      .range([1, 4]);

    // Create copies of data for D3
    const nodes: ChordNode[] = data.nodes.map(d => ({ ...d }));
    const links: ChordLink[] = data.links.map(d => ({ ...d }));

    // Set up force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(60))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => radiusScale(d.pagerank) + 8));

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

    // Create arrow markers for directed edges
    svg.append("defs").selectAll("marker")
      .data(["arrow"])
      .enter().append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#888");

    // Create links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#888")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => widthScale(d.prob))
      .attr("marker-end", "url(#arrow)");

    // Create nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => radiusScale(d.pagerank))
      .attr("fill", "#4A90E2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(d3.drag<SVGCircleElement, ChordNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add labels
    const label = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.id)
      .attr("font-size", 11)
      .attr("font-family", "Arial, sans-serif")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "#333")
      .style("pointer-events", "none");

    // Add hover effects and click handlers
    node
      .on("click", async (event, d) => {
        event.stopPropagation();
        await playChord(d.id);
        
        // Visual feedback on click
        d3.select(event.currentTarget)
          .transition()
          .duration(100)
          .attr("r", radiusScale(d.pagerank) * 1.4)
          .attr("fill", "#FF6B6B")
          .transition()
          .duration(300)
          .attr("r", radiusScale(d.pagerank))
          .attr("fill", "#4A90E2");
      })
      .on("mouseover", (event, d) => {
        // Get outgoing probabilities
        const outgoing = links.filter(l => 
          (typeof l.source === 'object' ? l.source.id : l.source) === d.id
        );
        
        let tooltipContent = `<strong>${d.id}</strong><br/>`;
        tooltipContent += `Importance: ${(d.pagerank * 100).toFixed(1)}%<br/>`;
        
        if (outgoing.length > 0) {
          tooltipContent += `<br/><strong>Common progressions:</strong><br/>`;
          outgoing.forEach(link => {
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            tooltipContent += `${d.id} → ${targetId}: ${(link.prob * 100).toFixed(0)}%<br/>`;
          });
        }
        tooltipContent += `<br/><em>Click to play chord!</em>`;

        tooltip.style("visibility", "visible").html(tooltipContent);
        
        // Highlight connected nodes and links
        node.style("opacity", n => n === d || outgoing.some(l => 
          (typeof l.target === 'object' ? l.target.id : l.target) === n.id
        ) ? 1 : 0.3);
        
        link.style("opacity", l => 
          (typeof l.source === 'object' ? l.source.id : l.source) === d.id ? 1 : 0.1
        );
        
        label.style("opacity", n => n === d || outgoing.some(l => 
          (typeof l.target === 'object' ? l.target.id : l.target) === n.id
        ) ? 1 : 0.3);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
        node.style("opacity", 1);
        link.style("opacity", 0.6);
        label.style("opacity", 1);
      });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as ChordNode).x!)
        .attr("y1", d => (d.source as ChordNode).y!)
        .attr("x2", d => (d.target as ChordNode).x!)
        .attr("y2", d => (d.target as ChordNode).y!);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      label
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    // Cleanup function
    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [data, width, height, loading]);

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
      <div style={{ 
        position: 'absolute', 
        top: 8, 
        right: 8, 
        background: 'rgba(74, 144, 226, 0.9)', 
        color: 'white',
        padding: '4px 8px', 
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold'
      }}>
        🎹 Click chords to play
      </div>
    </div>
  );
};

export default ChordNetworkDiagram;