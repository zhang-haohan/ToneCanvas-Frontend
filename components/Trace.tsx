"use client";

import React, { useEffect, useRef } from "react";
import { usePointerContext } from "../contexts/PointerContext";

interface TraceSegment {
  x: number;
  y: number;
  alpha: number;
}

interface Trace {
  segments: TraceSegment[];
  isComplete: boolean;
}

const Trace: React.FC = () => {
  const { position, isDrawing, audioIsInitialized } = usePointerContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const traces = useRef<Trace[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const startNewTrace = () => {
      traces.current.push({ segments: [], isComplete: false });
    };

    const addTraceSegment = (x: number, y: number) => {
      if (!isDrawing || !audioIsInitialized) return;

      // 转换比例坐标到像素坐标
      const px = (x / 100) * canvas.width;
      const py = canvas.height - (y / 100) * canvas.height; // Y轴颠倒处理

      const currentTrace = traces.current[traces.current.length - 1];
      currentTrace.segments.push({ x: px, y: py, alpha: 1 });
    };

    const completeCurrentTrace = () => {
      if (traces.current.length > 0) {
        traces.current[traces.current.length - 1].isComplete = true;
      }
    };

    const drawTraces = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      traces.current.forEach((trace) => {
        const segmentCount = trace.segments.length;
        trace.segments.forEach((segment, index) => {
          const adjustedAlpha = (index + 1) / segmentCount * segment.alpha;
          ctx.strokeStyle = `rgba(0, 0, 255, ${adjustedAlpha})`;
          ctx.lineWidth = 2;

          if (index === 0) {
            ctx.beginPath();
            ctx.moveTo(segment.x, segment.y);
          } else {
            ctx.lineTo(segment.x, segment.y);
          }
        });
        ctx.stroke();

        // 减少透明度
        trace.segments.forEach((segment) => {
          segment.alpha -= 0.01;
        });
      });

      // 移除完全透明的轨迹
      traces.current = traces.current.filter(
        (trace) =>
          trace.segments.some((segment) => segment.alpha > 0) || !trace.isComplete
      );
    };

    let animationFrameId: number;

    const animate = () => {
      if (isDrawing) {
        if (traces.current.length === 0 || traces.current[traces.current.length - 1].isComplete) {
          startNewTrace();
        }
        addTraceSegment(position.x, position.y);
      } else {
        completeCurrentTrace();
      }
      drawTraces();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDrawing, audioIsInitialized, position]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 5, // 确保轨迹效果在其他效果上层但低于交互元素
        pointerEvents: "none", // 确保轨迹效果不阻挡交互
      }}
    ></canvas>
  );
};

export default Trace;
