"use client";

import React, { useState } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext";
import { useCorpusStatusContext } from "../contexts/CorpusStatus";
import { buildApiUrl } from "./apiUrl";

export default function SwitchAudioButton() {
  const [isSwitching, setIsSwitching] = useState(false);
  const { audioIsInitialized, appStatus, setAppStatus } = usePointerContext();
  const {
    userId,
    currentFileName,
    currentIndex,
    refreshCorpusStatus,
    setIsFinished,
    setSwitchButtonPressed,
  } = useCorpusStatusContext();

  const getHeaders = (extraHeaders: Record<string, string> = {}) => ({
    ...config.headers,
    ...extraHeaders,
  });

  const logButtonPress = async (buttonName: string) => {
    try {
      const response = await fetch(buildApiUrl("/api/send-button-log", {
        userId,
        currentFileName,
        currentIndex,
      }), {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ button_name: buttonName }),
      });

      if (!response.ok) throw new Error("Failed to log button press");
      const result = await response.json();
      console.log("Button press logged:", result.message);
    } catch (error) {
      console.error("Error logging button press:", error);
    }
  };

  const handleSwitchClick = async () => {
    setIsSwitching(true);
    setSwitchButtonPressed(true);

    try {
      await logButtonPress("Switch");

      const response = await fetch(buildApiUrl("/api/switch-wav-file", {
        userId,
      }), {
        method: "POST",
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to switch audio file");
      const result = await response.json();
      console.log("Switched to audio file index:", result.currentIndex);
      setIsFinished(Boolean(result.isFinished));

      setAppStatus("Play"); // 更新状态为Play

      // ✅ 请求最新状态，确保最新音频状态
      await refreshCorpusStatus();

    } catch (error) {
      console.error("Error switching audio file:", error);
    } finally {
      setIsSwitching(false);
      setSwitchButtonPressed(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {audioIsInitialized && (
        <button
          onClick={handleSwitchClick}
          disabled={isSwitching}
          style={{
            position: "absolute",
            top: "85vh",
            left: "5vw",
            width: "20vw",
            height: "10vh",
            fontSize: "min(4vw, 4vh)", // 响应式字体大小
            fontWeight: "bold",
            cursor: isSwitching ? "not-allowed" : "pointer",
            backgroundColor: isSwitching ? "gray" : "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          {isSwitching ? "Switching..." : "Next Word"}
        </button>
      )}
      {appStatus === "Switch" && (
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: "green",
            borderRadius: "50%",
            marginLeft: "10px",
          }}
        ></div>
      )}
    </div>
  );
}
