"use client";

import React, { useEffect } from "react";
import { usePointerContext } from "../contexts/PointerContext";

interface PointerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPointerUpdate: (x: number, y: number) => void;
}

export default function Pointer({ canvasRef, onPointerUpdate }: PointerProps) {
  const { position, setPosition, isDrawing } = usePointerContext(); // 从上下文获取状态

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
    isDrawing.current = true; // 开始绘制
    const { x, y } = getEventCoordinates(e);
    console.log(`Start Drawing at: X=${x}, Y=${y}`);
    setPosition({ x, y }); // 更新全局指针位置
    onPointerUpdate(x, y);
    e.preventDefault();
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;
    const { x, y } = getEventCoordinates(e);
    console.log(`Pointer moving at: X=${x}, Y=${y}`);
    setPosition({ x, y }); // 更新全局指针位置
    onPointerUpdate(x, y);
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      console.log(`Stop Drawing`);
      isDrawing.current = false; // 停止绘制
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchcancel", stopDrawing);

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

  return null;
}
