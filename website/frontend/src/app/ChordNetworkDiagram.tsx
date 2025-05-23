import React, { useState, useCallback } from 'react';

interface NodePosition {
  cx: number;
  cy: number;
}

interface ChordNodeDefinition {
  id: string;
  label: string;
  r: number;
  color: string;
  percentage?: string;
  position: NodePosition;
  connectsTo: string[]; // IDs of nodes it can connect to
}

// Master data for all possible nodes and their predefined layout and connections
const masterNodeData: Record<string, ChordNodeDefinition> = {
  F_center: {
    id: 'F_center', label: 'F', r: 30, color: '#a2d5ab',
    position: { cx: 250, cy: 150 },
    connectsTo: ['C_top', 'G_main', 'Dm_orange', 'Em_yellow', 'Am_purple']
  },
  C_top: {
    id: 'C_top', label: 'C', r: 25, color: '#ffb3ba', percentage: '25%',
    position: { cx: 250, cy: 50 },
    connectsTo: ['F_center']
  },
  G_main: {
    id: 'G_main', label: 'G', r: 35, color: '#a7c7e7', percentage: '55%',
    position: { cx: 150, cy: 100 },
    connectsTo: ['F_center', 'Am_purple'] // G can also connect to Am based on some theories
  },
  Dm_orange: {
    id: 'Dm_orange', label: 'Dm', r: 18, color: '#ffdfba', percentage: '8%',
    position: { cx: 350, cy: 70 },
    connectsTo: ['F_center']
  },
  Em_yellow: {
    id: 'Em_yellow', label: 'Em', r: 15, color: '#ffffba', percentage: '5%',
    position: { cx: 400, cy: 130 },
    connectsTo: ['F_center', 'G_main'] // Em can also connect to G
  },
  Am_purple: {
    id: 'Am_purple', label: 'Am', r: 20, color: '#d1b3ff',
    position: { cx: 220, cy: 230 },
    connectsTo: ['F_center', 'C_bottom', 'G_main']
  },
  C_bottom: {
    id: 'C_bottom', label: 'C', r: 20, color: '#ffb3ba',
    position: { cx: 150, cy: 300 },
    connectsTo: ['Am_purple']
  },
  D_initial: { // User requested initial D
    id: 'D_initial', label: 'D', r: 25, color: '#FFD700', // Gold
    position: { cx: 380, cy: 250 }, // Position it somewhat away initially
    connectsTo: ['G_main', 'Em_yellow'] // Example connections for D
  },
};

interface DisplayedNode extends ChordNodeDefinition { }

interface DisplayedConnection {
  fromId: string;
  toId: string;
  id: string; // Unique ID for the connection (e.g., "F_center-C_top")
}

const initialNodeIds = ['C_top', 'D_initial', 'F_center'];

const ChordNetworkDiagram = () => {
  const [displayedNodes, setDisplayedNodes] = useState<Record<string, DisplayedNode>>(() => {
    const initialNodes: Record<string, DisplayedNode> = {};
    initialNodeIds.forEach(id => {
      if (masterNodeData[id]) {
        initialNodes[id] = { ...masterNodeData[id] };
      }
    });
    return initialNodes;
  });

  const [displayedConnections, setDisplayedConnections] = useState<Record<string, DisplayedConnection>>({});

  const handleNodeClick = useCallback((nodeId: string) => {
    const clickedNodeDef = masterNodeData[nodeId];
    if (!clickedNodeDef) return;

    setDisplayedNodes(prevNodes => {
      const newNodes = { ...prevNodes };
      clickedNodeDef.connectsTo.forEach(connectedNodeId => {
        if (masterNodeData[connectedNodeId] && !newNodes[connectedNodeId]) {
          newNodes[connectedNodeId] = { ...masterNodeData[connectedNodeId] };
        }
      });
      return newNodes;
    });

    setDisplayedConnections(prevConns => {
      const newConns = { ...prevConns };
      clickedNodeDef.connectsTo.forEach(connectedNodeId => {
        if (masterNodeData[connectedNodeId]) { // Ensure target node is valid
          const connId1 = `${nodeId}-${connectedNodeId}`;
          // const connId2 = `${connectedNodeId}-${nodeId}`; // For undirected graphs or if connections are always two-way in master data
          if (!newConns[connId1]) { // Add connection if it doesn't exist
            newConns[connId1] = { fromId: nodeId, toId: connectedNodeId, id: connId1 };
          }
        }
      });
      return newConns;
    });
  }, []);

  const arrowId = "arrowhead";

  return (
    <svg width="500" height="400" style={{ fontFamily: 'Arial, sans-serif' }}> {/* Increased height slightly */}
      <defs>
        <marker
          id={arrowId}
          markerWidth="10"
          markerHeight="7"
          refX="8" // Adjusted refX so arrow tip is at the line end
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#555" />
        </marker>
      </defs>

      {/* Connections / Lines */}
      {Object.values(displayedConnections).map(conn => {
        const fromNode = displayedNodes[conn.fromId];
        const toNode = displayedNodes[conn.toId];

        if (!fromNode || !toNode) return null; // Skip if nodes aren't visible

        const angle = Math.atan2(toNode.position.cy - fromNode.position.cy, toNode.position.cx - fromNode.position.cx);
        
        // Adjust for arrowhead not to overlap circle
        const sourceX = fromNode.position.cx + fromNode.r * Math.cos(angle);
        const sourceY = fromNode.position.cy + fromNode.r * Math.sin(angle);
        const targetX = toNode.position.cx - (toNode.r + 7) * Math.cos(angle); // +7 for arrowhead length
        const targetY = toNode.position.cy - (toNode.r + 7) * Math.sin(angle);

        return (
          <line
            key={conn.id}
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke="#888"
            strokeWidth="1.5"
            markerEnd={`url(#${arrowId})`}
          />
        );
      })}

      {/* Nodes / Circles */}
      {Object.values(displayedNodes).map((node) => (
        <g 
          key={node.id} 
          transform={`translate(${node.position.cx}, ${node.position.cy})`} 
          onClick={() => handleNodeClick(node.id)}
          style={{ cursor: 'pointer' }}
        >
          <circle
            r={node.r}
            fill={node.color}
            stroke="#777"
            strokeWidth="1"
          />
          <text
            textAnchor="middle"
            y={node.percentage ? -(node.r / 2 + 10) : 5} 
            fontSize="14px"
            fill="#333" 
            pointerEvents="none" // Make text non-interactive for click
          >
            {node.label}
          </text>
          {node.percentage && (
            <text
              textAnchor="middle"
              y={node.r / 2 + 5} 
              fontSize="11px"
              fill="#555" 
              pointerEvents="none" // Make text non-interactive for click
            >
              {node.percentage}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

export default ChordNetworkDiagram; 