// components/Spark.tsx
"use client"

import React from 'react';

interface SparkProps {
  x: number;
  y: number;
}

const Spark: React.FC<SparkProps> = ({ x, y }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: x,
        width: '10px',
        height: '10px',
        backgroundColor: 'red',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    />
  );
};

export default Spark;
