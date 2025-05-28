import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

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
  genreId?: string;
  width?: number;
  height?: number;
}

const ChordNetworkDiagram: React.FC<ChordNetworkDiagramProps> = ({
  genreId = 'pop', // Default to pop, this will be the French data conceptually
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<ChordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockData: Record<string, ChordData> = {
    pop: { // This key represents the French data for this renamed component
      nodes: [
        { id: "Cmaj", pagerank: 0.18 },
        { id: "Gmaj", pagerank: 0.15 },
        { id: "Amin", pagerank: 0.14 },
        { id: "Fmaj", pagerank: 0.12 },
        { id: "Dmin", pagerank: 0.10 },
        { id: "Emin", pagerank: 0.09 },
        { id: "Bmaj", pagerank: 0.08 },
        { id: "Dmaj", pagerank: 0.07 },
        { id: "Em7", pagerank: 0.04 },
        { id: "Am7", pagerank: 0.03 }
      ],
      links: [
        { source: "Cmaj", target: "Gmaj", prob: 0.42 },
        { source: "Cmaj", target: "Amin", prob: 0.28 },
        { source: "Cmaj", target: "Fmaj", prob: 0.30 },
        { source: "Gmaj", target: "Amin", prob: 0.35 },
        { source: "Gmaj", target: "Cmaj", prob: 0.25 },
        { source: "Gmaj", target: "Dmin", prob: 0.40 },
        { source: "Amin", target: "Fmaj", prob: 0.45 },
        { source: "Amin", target: "Dmaj", prob: 0.30 },
        { source: "Amin", target: "Cmaj", prob: 0.25 },
        { source: "Fmaj", target: "Cmaj", prob: 0.40 },
        { source: "Fmaj", target: "Gmaj", prob: 0.35 },
        { source: "Fmaj", target: "Dmin", prob: 0.25 },
        { source: "Dmin", target: "Gmaj", prob: 0.50 },
        { source: "Dmin", target: "Amin", prob: 0.30 },
        { source: "Dmin", target: "Bmaj", prob: 0.20 },
        { source: "Emin", target: "Amin", prob: 0.40 },
        { source: "Emin", target: "Cmaj", prob: 0.35 },
        { source: "Emin", target: "Dmaj", prob: 0.25 },
        { source: "Bmaj", target: "Emin", prob: 0.45 },
        { source: "Bmaj", target: "Fmaj", prob: 0.30 },
        { source: "Bmaj", target: "Gmaj", prob: 0.25 },
        { source: "Dmaj", target: "Gmaj", prob: 0.40 },
        { source: "Dmaj", target: "Amin", prob: 0.35 },
        { source: "Dmaj", target: "Bmaj", prob: 0.25 },
        { source: "Em7", target: "Am7", prob: 0.60 },
        { source: "Em7", target: "Cmaj", prob: 0.40 },
        { source: "Am7", target: "Dmaj", prob: 0.70 },
        { source: "Am7", target: "Fmaj", prob: 0.30 }
      ]
    },
    rock: { // Example of other data, not used by this specific French component
      nodes: [
        { id: "Em", pagerank: 0.20 },
        { id: "G", pagerank: 0.18 },
        { id: "D", pagerank: 0.16 },
        { id: "C", pagerank: 0.15 },
        { id: "Am", pagerank: 0.12 },
        { id: "F", pagerank: 0.10 },
        { id: "Bm", pagerank: 0.09 }
      ],
      links: [
        { source: "Em", target: "G", prob: 0.40 },
        { source: "Em", target: "D", prob: 0.35 },
        { source: "Em", target: "C", prob: 0.25 },
        { source: "G", target: "D", prob: 0.45 },
        { source: "G", target: "Em", prob: 0.30 },
        { source: "G", target: "C", prob: 0.25 },
        { source: "D", target: "G", prob: 0.40 },
        { source: "D", target: "Em", prob: 0.35 },
        { source: "D", target: "Am", prob: 0.25 },
        { source: "C", target: "G", prob: 0.50 },
        { source: "C", target: "Am", prob: 0.30 },
        { source: "C", target: "F", prob: 0.20 },
        { source: "Am", target: "F", prob: 0.45 },
        { source: "Am", target: "C", prob: 0.35 },
        { source: "Am", target: "G", prob: 0.20 },
        { source: "F", target: "C", prob: 0.60 },
        { source: "F", target: "G", prob: 0.40 },
        { source: "Bm", target: "Em", prob: 0.70 },
        { source: "Bm", target: "D", prob: 0.30 }
      ]
    }
  };

  // Load data function
  const loadData = async (genreKey: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you might fetch data based on genreId, e.g., from /api/chord-data/french
      // For this example, we use the mockData keyed by 'pop' for the French diagram
      if (mockData[genreKey]) {
        setData(mockData[genreKey]);
      } else {
        throw new Error(`No data available for key: ${genreKey}`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to load data for key: ${genreKey}`);
      setData(null); // Or set to a default fallback if desired
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or genreId (used as key) changes
  useEffect(() => {
    loadData(genreId); // genreId prop will determine which data to load, here it defaults to 'pop' for French
  }, [genreId]);

  // D3 visualization effect
  useEffect(() => {
    if (!data || loading || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clean up previous render

    // Set up scales
    const radiusScale = d3.scaleLinear()
      .domain(d3.extent(data.nodes, d => d.pagerank) as [number, number])
      .range([5, 20]);

    const widthScale = d3.scaleLinear()
      .domain(d3.extent(data.links, d => d.prob) as [number, number])
      .range([1, 5]);

    // Create copies of data for D3
    const nodes: ChordNode[] = data.nodes.map(d => ({ ...d }));
    const links: ChordLink[] = data.links.map(d => ({ ...d }));

    // Set up force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => radiusScale(d.pagerank) + 5));

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "chord-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    // Create arrow markers for directed edges
    svg.append("defs").selectAll("marker")
      .data(["arrow"])
      .enter().append("marker")
      .attr("id", "arrow") // Unique ID for the marker
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#666");

    // Create links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#666")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: ChordLink) => widthScale(d.prob))
      .attr("marker-end", "url(#arrow)");

    // Create nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", (d: ChordNode) => radiusScale(d.pagerank))
      .attr("fill", "#69b3a2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", (event, d: ChordNode) => {
        tooltip
          .style("visibility", "visible")
          .html(`Chord: ${d.id}<br/>Pagerank: ${d.pagerank.toFixed(3)}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      })
      .call(d3.drag<SVGCircleElement, ChordNode>()
        .on("start", (event, d: ChordNode) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; 
          d.fy = d.y;
        })
        .on("drag", (event, d: ChordNode) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d: ChordNode) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add labels to nodes
    const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em") // Vertically center
      .attr("font-size", "10px")
      .attr("fill", "#333")
      .text(d => d.id);

    // Tick function to update positions
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as ChordNode).x!)
        .attr("y1", d => (d.source as ChordNode).y!)
        .attr("x2", d => (d.target as ChordNode).x!)
        .attr("y2", d => (d.target as ChordNode).y!);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);
      
      labels
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    // Set SVG size
    svg.attr("width", width).attr("height", height);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading, width, height]); // Removed genreId from here as data loading handles it

  if (loading) return <p>Loading chord data...</p>;
  if (error) return <p>Error loading data: {error}</p>;

  return (
    <div style={{ width, height, border: '1px solid #ddd', borderRadius: '8px' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ChordNetworkDiagram; // Will be FrenchChordDiagram 