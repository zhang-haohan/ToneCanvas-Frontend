"use client";

import React, { useEffect, useState } from "react";
import { useAudioRangeContext } from "../contexts/AudioRange";
import { usePointerContext } from "../contexts/PointerContext";
import { useCorpusStatusContext } from "../contexts/CorpusStatus"; // ✅ 这里新增引入
import config from "../public/config.json";

export default function RecordSending() {
  const { position, isDrawing, audioIsInitialized } = usePointerContext();
  const { frequencyRange } = useAudioRangeContext();
  const { SwitchButtonPressed } = useCorpusStatusContext(); // ✅ 读取SwitchButtonPressed

  const [isTracing, setIsTracing] = useState(false);
  const [traceData, setTraceData] = useState({
    trace_start: "",
    trace_body: [] as { x: number; y: number; pitch: number; timestamp: string }[],
    trace_end: "",
  });
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [hasSent, setHasSent] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const getHeaders = (extraHeaders: Record<string, string> = {}) => ({
    ...config.headers,
    ...extraHeaders,
  });

  const sendButtonLog = async (buttonName: string) => {
    try {
      await fetch(`${config.backendUrl}/api/send-button-log`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ button_name: buttonName }),
      });
      console.log(`Button [${buttonName}] press logged`);
    } catch (error) {
      console.error("Error logging button press:", error);
    }
  };

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
      if (!response.ok) throw new Error(`Failed to send trace: ${response.status}`);
      console.log("Trace data successfully sent to backend");
      return true;
    } catch (error) {
      console.error("Error sending trace to backend:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!isTracing) return;

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
  }, [isDrawing, position, isTracing]);

  // ✅ 监听SwitchButtonPressed，一旦变true，就自动发送trace
  useEffect(() => {
    const autoSendOnSwitch = async () => {
      if (SwitchButtonPressed) {
        console.log("Detected SwitchButtonPressed, auto sending trace...");

        if (traceData.trace_body.length > 0) {
          const endTime = new Date().toISOString();
          const completedTrace = { ...traceData, trace_end: endTime };
          await sendButtonLog("Send Trace (Auto by Switch)");
          await sendTraceToBackend(completedTrace);
        }

        // 重置组件状态
        setIsTracing(false);
        setHasSent(false);
        setHasError(false);
        setTraceData({ trace_start: "", trace_body: [], trace_end: "" });
      }
    };

    autoSendOnSwitch();
  }, [SwitchButtonPressed]); // 依赖SwitchButtonPressed变化

  const handleStart = async () => {
    await sendButtonLog("Start Trace");
    setTraceData({ trace_start: new Date().toISOString(), trace_body: [], trace_end: "" });
    setIsTracing(true);
    setHasSent(false);
    setHasError(false);
  };

  const handleClear = async () => {
    await sendButtonLog("Refresh Trace");
    setTraceData({ trace_start: "", trace_body: [], trace_end: "" });
    setIsTracing(false);
    setHasSent(false);
    setHasError(false);
  };

  const handleSend = async () => {
    await sendButtonLog("Send Trace");

    if (traceData.trace_body.length === 0) {
      console.warn("Trace is empty, not sending.");
      return;
    }

    const endTime = new Date().toISOString();
    const completedTrace = { ...traceData, trace_end: endTime };
    console.log("Sending Trace:", JSON.stringify({ trace: completedTrace }, null, 2));
    const success = await sendTraceToBackend(completedTrace);

    if (success) {
      setIsTracing(false);
      setHasSent(true);
      setHasError(false);
      setTraceData({ trace_start: "", trace_body: [], trace_end: "" });
    } else {
      setHasError(true);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* 按钮们 */}
      {audioIsInitialized && (
        <div style={{
          position: "absolute",
          top: "70vh",
          left: "5vw",
          zIndex: 1000,
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        }}>
          <button
            onClick={handleStart}
            disabled={isTracing}
            style={{
              width: "6vw",
              height: "10vh",
              fontSize: "min(2vw, 2vh)", // 响应式字体大小
              fontWeight: "bold",
              cursor: isTracing ? "not-allowed" : "pointer",
              backgroundColor: isTracing ? "gray" : "green",
              color: "white",
              border: "none",
              borderRadius: "5px",
              marginRight: "1vw",
            }}
          >
            {isTracing ? "Tracing..." : "Start Trace"}
          </button>

          <button
            onClick={handleClear}
            style={{
              width: "6vw",
              height: "10vh",
              fontSize: "min(2vw, 2vh)", // 响应式字体大小
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: "orange",
              color: "white",
              border: "none",
              borderRadius: "5px",
              marginRight: "1vw",
            }}
          >
            Refresh
          </button>

          <button
            onClick={handleSend}
            disabled={hasSent && !hasError}
            style={{
              width: "6vw",
              height: "10vh",
              fontSize: "min(2vw, 2vh)", // 响应式字体大小
              fontWeight: "bold",
              cursor: hasSent && !hasError ? "not-allowed" : "pointer",
              backgroundColor: hasError ? "red" : (hasSent ? "gray" : "blue"),
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            {hasError ? "Error" : (hasSent ? "Sent" : "Send Trace")}
          </button>
        </div>
      )}

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
            top: `${(screenSize.height * (1 - point.y / 100))}px`,
            transform: "translate(-50%, -50%)",
            zIndex: 500,
          }}
        />
      ))}
    </div>
  );
}
