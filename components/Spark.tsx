"use client";

import React, { useEffect, useRef } from "react";
import { usePointerContext } from "../contexts/PointerContext";

const Spark: React.FC = () => {
  const { position, isDrawing, audioIsInitialized } = usePointerContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const drawSpark = (x: number, y: number) => {
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 50;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = `rgba(255, 215, 0, ${Math.random()})`;
        ctx.lineWidth = Math.random() * 2;
        ctx.stroke();
      }
    };

    let animationFrameId: number;

    const animate = () => {
      if (isDrawing && audioIsInitialized) {
        // 转换比例坐标到像素坐标
        const x = (position.x / 100) * canvas.width;
        const y = canvas.height - (position.y / 100) * canvas.height; // Y轴颠倒处理
        drawSpark(x, y);
      }
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
        zIndex: 10, // 确保火花效果在画布之上
        pointerEvents: "none", // 确保火花效果不阻挡交互
      }}
    ></canvas>
  );
};

export default Spark;
