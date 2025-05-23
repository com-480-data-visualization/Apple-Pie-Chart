import React from 'react';

const MoodWheelDiagram = () => {
  const svgSize = 300;
  const center = svgSize / 2;
  const radius = svgSize / 2 * 0.75; // Circle radius, leaving space for labels
  const axisLabelOffset = radius + 20;
  const axisStrokeColor = '#888';
  const circleStrokeColor = '#333';

  return (
    <svg width={svgSize} height={svgSize} style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Axes Lines */}
      {/* Horizontal */}
      <line x1="0" y1={center} x2={svgSize} y2={center} stroke={axisStrokeColor} strokeWidth="1" />
      {/* Vertical */}
      <line x1={center} y1="0" x2={center} y2={svgSize} stroke={axisStrokeColor} strokeWidth="1" />
      {/* Diagonal 1 (top-left to bottom-right) */}
      <line x1="0" y1="0" x2={svgSize} y2={svgSize} stroke={axisStrokeColor} strokeWidth="1" />
      {/* Diagonal 2 (top-right to bottom-left) */}
      <line x1={svgSize} y1="0" x2="0" y2={svgSize} stroke={axisStrokeColor} strokeWidth="1" />

      {/* Main Circle */}
      <circle cx={center} cy={center} r={radius} fill="none" stroke={circleStrokeColor} strokeWidth="2" />

      {/* Axis Labels */}
      <text x={center} y={center - axisLabelOffset + 5} textAnchor="middle" fontSize="12px" fontWeight="bold" fill="#333">
        Active/Aroused
      </text>
      <text x={center} y={center + axisLabelOffset - 5} textAnchor="middle" fontSize="12px" fontWeight="bold" fill="#333">
        Passive/Calm
      </text>
      <text x={center + axisLabelOffset} y={center + 4} textAnchor="middle" fontSize="12px" fontWeight="bold" fill="#333">
        Positive
      </text>
      <text x={center - axisLabelOffset} y={center + 4} textAnchor="middle" fontSize="12px" fontWeight="bold" fill="#333">
        Negative
      </text>
    </svg>
  );
};

export default MoodWheelDiagram; 