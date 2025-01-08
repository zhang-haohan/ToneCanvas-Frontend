"use client";

import React, { useEffect, useRef } from "react";

interface PointerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onPointerUpdate: (x: number, y: number) => void;
}

export default function Pointer({ canvasRef, onPointerUpdate }: PointerProps) {
  const isDrawing = useRef(false); // 使用 ref 以避免多次渲染

  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        x: touch.clientX - (rect?.left || 0),
        y: touch.clientY - (rect?.top || 0),
      };
    }
    if ("clientX" in e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        x: e.clientX - (rect?.left || 0),
        y: e.clientY - (rect?.top || 0),
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    isDrawing.current = true;
    const { x, y } = getEventCoordinates(e);
    console.log(`Start Drawing at: X=${x}, Y=${y}`);
    onPointerUpdate(x, y);
    e.preventDefault(); // 防止触摸事件的滚动行为
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;
    const { x, y } = getEventCoordinates(e);
    console.log(`Pointer moving at: X=${x}, Y=${y}`);
    onPointerUpdate(x, y);
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      console.log(`Stop Drawing`);
      isDrawing.current = false;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 添加事件监听
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchcancel", stopDrawing);

    // 清理事件监听
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);

      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
      canvas.removeEventListener("touchcancel", stopDrawing);
    };
  }, [canvasRef]);

  return null; // 不渲染任何内容
}
