import React, { useState, useRef, MouseEvent } from 'react';

interface MoodWheelDiagramProps {
  onMoodChange?: (mood: { x: number; y: number; sector: number; angle: number }) => void;
}

const MoodWheelDiagram: React.FC<MoodWheelDiagramProps> = ({ onMoodChange }) => {
  const svgSize = 400;
  const center = svgSize / 2;
  const radius = svgSize / 2 * 0.8;
  const buttonRadius = 8; // Button size
  const mainAxisStrokeColor = '#B0B0B0';
  const diagonalStrokeColor = '#EAEAEA';
  const circleStrokeColor = '#4A90E2';
  const textColor = '#333';
  const sectorColors = [
    '#FFD1DC', // Light Pink (Sector 0)
    '#E1F5FE', // Light Blue (Sector 1)
    '#FFE4B5', // Moccasin (Sector 2)
    '#D8BFD8', // Thistle (Sector 3)
    '#FFB6C1', // Light Pink (Sector 4)
    '#ADD8E6', // Light Blue (Sector 5)
    '#F5F5DC', // Beige (Sector 6)
    '#E6E6FA'  // Lavender (Sector 7)
  ];
  
  const [isDragging, setIsDragging] = useState(false);
  // Initial angle set to the middle of Sector 0 (Energetic: 0-45 deg)
  const [angle, setAngle] = useState(Math.PI / 8); 
  const [currentSector, setCurrentSector] = useState(0); // Initial sector is 0
  const svgRef = useRef<SVGSVGElement>(null);

  // Updated sector labels based on cluster_map
  const sectorLabels = [
    'Energetic',    // Sector 0 (0-45 deg)
    'Excited',      // Sector 1 (45-90 deg)
    'Agitated',     // Sector 2 (90-135 deg)
    'Heavy',        // Sector 3 (135-180 deg)
    'Dark',         // Sector 4 (180-225 deg)
    'Tragic',       // Sector 5 (225-270 deg)
    'Dreamy',       // Sector 6 (270-315 deg)
    'Calm'          // Sector 7 (315-360 deg)
  ];

  const handleMouseDown = (event: MouseEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const currentButtonX = center + Math.cos(angle) * radius;
    const currentButtonY = center - Math.sin(angle) * radius; // SVG y-axis is inverted

    const distToButton = Math.sqrt(
      Math.pow(mouseX - currentButtonX, 2) + Math.pow(mouseY - currentButtonY, 2)
    );
    
    if (distToButton <= buttonRadius * 2.5) { 
      setIsDragging(true);
      updatePosition(event);
    }
  };

  const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    updatePosition(event);
  };

  const handleMouseUp = () => {
    if (isDragging) {
        setIsDragging(false);
    }
  };

  const updatePosition = (event: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const dx = mouseX - center;
    const dy = mouseY - center;
    
    let newAngleRad = Math.atan2(-dy, dx);
    if (newAngleRad < 0) newAngleRad += 2 * Math.PI; 
    
    setAngle(newAngleRad);
    
    // Sector calculation: 0 degrees is to the right (Valence+), positive angle CCW.
    // Sector 0: [0, PI/4), Sector 1: [PI/4, PI/2), ..., Sector 7: [7PI/4, 2PI)
    const sector = Math.floor(newAngleRad / (Math.PI / 4)) % 8;
    setCurrentSector(sector);
    
    const x = Math.cos(newAngleRad);
    const y = Math.sin(newAngleRad); 
    
    if (onMoodChange) {
      onMoodChange({ 
        x, 
        y, 
        sector, 
        angle: newAngleRad * 180 / Math.PI 
      });
    }
  };

  const createSectorPath = (index: number) => {
    const sectorAngleRad = Math.PI / 4;
    const newStartAngle = index * sectorAngleRad;
    const newEndAngle = newStartAngle + sectorAngleRad;
    
    const startX = center + Math.cos(newStartAngle) * radius;
    const startY = center - Math.sin(newStartAngle) * radius; 
    const endX = center + Math.cos(newEndAngle) * radius;
    const endY = center - Math.sin(newEndAngle) * radius;
    
    return `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY} Z`;
  };

  const displayButtonX = center + Math.cos(angle) * radius;
  const displayButtonY = center - Math.sin(angle) * radius;

  // Effect to call onMoodChange when component mounts with initial state
  React.useEffect(() => {
    if (onMoodChange) {
      const initialX = Math.cos(angle); // Use current angle state
      const initialY = Math.sin(angle); // Use current angle state
      // Recalculate sector for initial angle, though currentSector state should be correct
      const initialSector = Math.floor(angle / (Math.PI / 4)) % 8; 
      onMoodChange({x: initialX, y: initialY, sector: initialSector, angle: angle * 180 / Math.PI });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  return (
    <svg
      ref={svgRef}
      width={svgSize}
      height={svgSize}
      style={{ 
        fontFamily: 'Helvetica, Arial, sans-serif', 
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} 
    >
      {Array.from({ length: 8 }, (_, index) => (
        <g key={index}>
          <path
            d={createSectorPath(index)}
            fill={currentSector === index ? sectorColors[index] : 'transparent'} 
            stroke={diagonalStrokeColor} 
            strokeWidth="0.5"
            opacity={currentSector === index ? 0.5 : 0.2} 
          />
          {index === currentSector && (
            <text
              x={center + Math.cos(index * (Math.PI/4) + (Math.PI/8)) * (radius * 0.65)}
              y={center - Math.sin(index * (Math.PI/4) + (Math.PI/8)) * (radius * 0.65)} 
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14px"
              fontWeight="bold"
              fill={textColor}
              pointerEvents="none" 
            >
              {sectorLabels[index]}
            </text>
          )}
        </g>
      ))}

      <line x1={20} y1={center} x2={svgSize - 20} y2={center} stroke={mainAxisStrokeColor} strokeWidth="1.5" />
      <line x1={center} y1={20} x2={center} y2={svgSize - 20} stroke={mainAxisStrokeColor} strokeWidth="1.5" />

      <circle cx={center} cy={center} r={radius} fill="none" stroke={circleStrokeColor} strokeWidth="2" />

      <circle 
        cx={displayButtonX} 
        cy={displayButtonY} 
        r={buttonRadius} 
        fill={circleStrokeColor} 
        stroke="white" 
        strokeWidth="2"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />

      <text x={center} y={15} textAnchor="middle" fontSize="13px" fontWeight="600" fill={textColor}>
        Arousal+
      </text>
      <text x={center} y={svgSize - 5} textAnchor="middle" fontSize="13px" fontWeight="600" fill={textColor}>
        Arousal-
      </text>
      <text x={svgSize - 5} y={center + 5} textAnchor="end" fontSize="13px" fontWeight="600" fill={textColor}>
        Valence+
      </text>
      <text x={15} y={center + 5} textAnchor="start" fontSize="13px" fontWeight="600" fill={textColor}>
        Valence-
      </text>
    </svg>
  );
};

export default MoodWheelDiagram;