"use client";

import React, { useEffect, useState } from "react";
import { useAudioRangeContext } from "../contexts/AudioRange";
import { usePointerContext } from "../contexts/PointerContext";
import config from "../public/config.json";

export default function RecordSending() {
  const { position, isDrawing } = usePointerContext();
  const { frequencyRange } = useAudioRangeContext();
  const [traceData, setTraceData] = useState<{
    trace_start: string;
    trace_body: { x: number; y: number; pitch: number; timestamp: string }[];
    trace_end: string;
  }>({
    trace_start: "",
    trace_body: [],
    trace_end: "",
  });
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const hasLogged = React.useRef(false);

  const mapYToFrequency = (y: number, min: number, max: number): number => {
    return min + (max - min) * (y / 100);
  };

  const sendTraceToBackend = async (trace: typeof traceData) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/send-trace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trace }),
      });
      if (!response.ok) {
        throw new Error("Failed to send trace to backend");
      }
      console.log("Trace data successfully sent to backend");
    } catch (error) {
      console.error("Error sending trace to backend:", error);
    }
  };

  useEffect(() => {
    if (isDrawing) {
      const startTime = new Date().toISOString();
      setTraceData((prevData) => ({ ...prevData, trace_start: startTime }));

      const id = setInterval(() => {
        const currentTimestamp = new Date().toISOString();
        const pitch = mapYToFrequency(position.y, frequencyRange.min, frequencyRange.max);

        setTraceData((prevData) => ({
          ...prevData,
          trace_body: [
            ...prevData.trace_body,
            {
              x: position.x,
              y: position.y,
              pitch,
              timestamp: currentTimestamp,
            },
          ],
        }));
      }, 100);

      setIntervalId(id);
      hasLogged.current = false;
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      if (!hasLogged.current) {
        const endTime = new Date().toISOString();
        const completedTrace = { ...traceData, trace_end: endTime };

        console.log(JSON.stringify({ trace: completedTrace }, null, 2));
        sendTraceToBackend(completedTrace);
        setTraceData(completedTrace);
        hasLogged.current = true;
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isDrawing]);

  return null;
}
