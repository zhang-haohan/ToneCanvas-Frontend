"use client";

import React, { useEffect } from "react";
import { usePointerContext } from "../contexts/PointerContext";

interface PointerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPointerUpdate: (x: number, y: number) => void;
}

export default function Pointer({ canvasRef, onPointerUpdate }: PointerProps) {
  const { position, setPosition, isDrawing, setIsDrawing } = usePointerContext();

  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        x: ((touch.clientX - (rect?.left || 0)) / (rect?.width || 1)) * 100,
        y: (1 - (touch.clientY - (rect?.top || 0)) / (rect?.height || 1)) * 100, // Y 轴反转并转换为百分比
      };
    }
    if ("clientX" in e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        x: ((e.clientX - (rect?.left || 0)) / (rect?.width || 1)) * 100,
        y: (1 - (e.clientY - (rect?.top || 0)) / (rect?.height || 1)) * 100, // Y 轴反转并转换为百分比
      };
    }
    return { x: 0, y: 100 }; // 默认值，Y 轴反转并转换为百分比
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing) {
    //   console.log("%cDrawing started", "color: green; font-weight: bold;");
    }
    setIsDrawing(true); // 更新为 true
    const { x, y } = getEventCoordinates(e);
    setPosition({ x, y }); // 更新全局指针位置
    onPointerUpdate(x, y);
    e.preventDefault();
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getEventCoordinates(e);
    setPosition({ x, y }); // 更新全局指针位置
    onPointerUpdate(x, y);
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (isDrawing) {
    //   console.log("%cDrawing stopped", "color: red; font-weight: bold;");
      setIsDrawing(false); // 更新为 false
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
  }, [canvasRef, isDrawing]);

  return null;
}
