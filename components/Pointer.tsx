"use client";

import React, { useState, useEffect } from "react";

interface PointerProps {
  onPointerUpdate: (x: number, y: number) => void;
}

export default function Pointer({ onPointerUpdate }: PointerProps) {
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = (e: MouseEvent) => {
    setIsDrawing(true);
    const x = e.offsetX;
    const y = e.offsetY;
    console.log(`Start Drawing at: X=${x}, Y=${y}`);
    onPointerUpdate(x, y);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing) return; // 只有在绘制状态下才更新位置
    const x = e.offsetX;
    const y = e.offsetY;
    console.log(`Pointer moving at: X=${x}, Y=${y}`);
    onPointerUpdate(x, y);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      console.log(`Stop Drawing`);
      setIsDrawing(false);
    }
  };

  useEffect(() => {
    const handleMouseEvents = (e: MouseEvent) => {
      if (e.type === "mousedown") handleMouseDown(e);
      if (e.type === "mousemove") handleMouseMove(e);
      if (e.type === "mouseup") handleMouseUp();
    };

    window.addEventListener("mousedown", handleMouseEvents);
    window.addEventListener("mousemove", handleMouseEvents);
    window.addEventListener("mouseup", handleMouseEvents);

    return () => {
      window.removeEventListener("mousedown", handleMouseEvents);
      window.removeEventListener("mousemove", handleMouseEvents);
      window.removeEventListener("mouseup", handleMouseEvents);
    };
  }, [isDrawing]); // 监听 isDrawing 状态的变化

  return null; // Pointer 组件不渲染任何内容
}
