"use client";

import { useEffect, useRef, useState } from "react";
import Pointer from "../components/Pointer";

export default function DrawPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const handlePointerUpdate = (x: number, y: number) => {
    console.log(`Pointer is at X=${x}, Y=${y}`);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        setContext(ctx);
      }
    }
  }, []);

  return (
    <div>
      {/* 将 canvasRef 传递给 Pointer */}
      <Pointer canvasRef={canvasRef} onPointerUpdate={handlePointerUpdate} />
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black", display: "block" }}
      />
    </div>
  );
}
