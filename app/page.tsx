"use client";

import { useEffect, useRef, useState } from "react";
import Pointer from "../components/Pointer";
import Log from "../components/Log";
import Start from "../components/Start";
import Theremin from "../components/Theremin"; // 引入 Theremin 组件
import Spark from "../components/Spark"
import Background from "../components/Background";
import Trace from "../components/Trace";
import PlayButton from "../components/PlayButton"
import SwitchAudioButton from "../components/SwitchAudioButton"
import TraceButton from "@/components/TraceButton";
import PitchAudioButton from "@/components/PitchAudioButton";
import Progress from "@/components/Progress";


export default function DrawPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const handlePointerUpdate = (x: number, y: number) => {
    // 可以在此添加其他逻辑
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    const resizeCanvas = () => {
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
    };

    // 初始化画布大小
    resizeCanvas();

    // 监听窗口大小变化
    window.addEventListener("resize", resizeCanvas);

    // 清理事件监听
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div>
      <Log />
      <Start />
      {/* 引入 Theremin 组件 */}
      <Theremin />
      <Spark />
      <Trace />
      <PlayButton />
      <SwitchAudioButton />
      <TraceButton />
      <PitchAudioButton />
      <Progress />
      <Pointer canvasRef={canvasRef} onPointerUpdate={handlePointerUpdate} />
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      />
      <Background />
    </div>
  );
}
