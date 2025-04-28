"use client";

import React, { useEffect, useState } from "react";
import { useAudioRangeContext } from "../contexts/AudioRange";
import { usePointerContext } from "../contexts/PointerContext";
import config from "../public/config.json";

export default function RecordSending() {
  const { position, isDrawing } = usePointerContext();
  const { frequencyRange } = useAudioRangeContext();

  const [isRecording, setIsRecording] = useState(false);
  const [traceData, setTraceData] = useState({
    trace_start: "",
    trace_body: [] as { x: number; y: number; pitch: number; timestamp: string }[],
    trace_end: "",
  });

  // 记录当前屏幕尺寸
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  // 初次加载和窗口变化时，更新屏幕尺寸
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateScreenSize(); // 初始化

    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const getHeaders = (extraHeaders: Record<string, string> = {}) => ({
    ...config.headers,
    ...extraHeaders,
  });

  const mapYToFrequency = (y: number, min: number, max: number): number => {
    return min + (max - min) * (y / 100);
  };

  const sendTraceToBackend = async (trace: typeof traceData) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/send-trace`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ trace }),
      });

      if (!response.ok) throw new Error("Failed to send trace to backend");
      console.log("Trace data successfully sent to backend");
    } catch (error) {
      console.error("Error sending trace to backend:", error);
    }
  };

  useEffect(() => {
    if (!isRecording) return;

    if (isDrawing) {
      const timestamp = new Date().toISOString();
      const pitch = mapYToFrequency(position.y, frequencyRange.min, frequencyRange.max);

      setTraceData((prev) => ({
        ...prev,
        trace_body: [
          ...prev.trace_body,
          { x: position.x, y: position.y, pitch, timestamp },
        ],
      }));
    }
  }, [isDrawing, position, isRecording]);

  const handleStart = () => {
    setTraceData({ trace_start: new Date().toISOString(), trace_body: [], trace_end: "" });
    setIsRecording(true);
  };

  const handleClear = () => {
    setTraceData({ trace_start: "", trace_body: [], trace_end: "" });
  };

  const handleSend = () => {
    const endTime = new Date().toISOString();
    const completedTrace = { ...traceData, trace_end: endTime };

    console.log("Sending Trace:", JSON.stringify({ trace: completedTrace }, null, 2));
    sendTraceToBackend(completedTrace);
    setIsRecording(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* 按钮们 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button
          onClick={handleStart}
          style={{
            position: "absolute",
            top: "20vh",
            right: "5vw",
            width: "15vw",
            height: "7vh",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "8px",
            marginBottom: "10px",
            zIndex: 1000,
          }}
        >
          开始
        </button>
        <button
          onClick={handleClear}
          style={{
            position: "absolute",
            top: "30vh",
            right: "5vw",
            width: "15vw",
            height: "7vh",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "orange",
            color: "white",
            border: "none",
            borderRadius: "8px",
            marginBottom: "10px",
            zIndex: 1000,
          }}
        >
          刷新
        </button>
        <button
          onClick={handleSend}
          style={{
            position: "absolute",
            top: "40vh",
            right: "5vw",
            width: "15vw",
            height: "7vh",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          发送
        </button>
      </div>

      {/* 小红点绘制 */}
      {traceData.trace_body.map((point, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            width: "6px",
            height: "6px",
            backgroundColor: "red",
            borderRadius: "50%",
            left: `${(screenSize.width * point.x) / 100}px`,
            top: `${(screenSize.height * (1 - point.y / 100))}px`, // ★ 翻转Y轴
            transform: "translate(-50%, -50%)",
            zIndex: 500,
          }}
        />
      ))}
    </div>
  );
}
