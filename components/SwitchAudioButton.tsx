"use client";

import React, { useState } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext";
import { useCorpusStatusContext } from "../contexts/CorpusStatus";

export default function SwitchAudioButton() {
  const [isSwitching, setIsSwitching] = useState(false);
  const { audioIsInitialized, appStatus, setAppStatus } = usePointerContext();
  const {
    currentFileName,
    setCurrentFileName,
    currentIndex,
    setCurrentIndex,
    totalCorpus,
    setTotalCorpus,
    SwitchButtonPressed,
    setSwitchButtonPressed,
  } = useCorpusStatusContext();

  const getHeaders = (extraHeaders: Record<string, string> = {}) => ({
    ...config.headers,
    ...extraHeaders,
  });

  const updateCorpusStatus = async () => {
    try {
      const fileNameResponse = await fetch(`${config.backendUrl}/api/get-file-name`, {
        headers: getHeaders(),
      });
      if (!fileNameResponse.ok) throw new Error("Failed to fetch file name");
      const fileNameData = await fileNameResponse.json();

      const progressResponse = await fetch(`${config.backendUrl}/api/get-progress`, {
        headers: getHeaders(),
      });
      if (!progressResponse.ok) throw new Error("Failed to fetch progress");
      const progressData = await progressResponse.json();

      if (fileNameData.fileName !== currentFileName) setCurrentFileName(fileNameData.fileName);
      if (progressData.current_index !== currentIndex) setCurrentIndex(progressData.current_index);
      if (progressData.total_files !== totalCorpus) setTotalCorpus(progressData.total_files);
    } catch (error) {
      console.error("Error updating CorpusStatus:", error);
    }
  };

  const logButtonPress = async (buttonName: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/send-button-log`, {
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

      const response = await fetch(`${config.backendUrl}/api/switch-wav-file`, {
        method: "POST",
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error("Failed to switch audio file");
      const result = await response.json();
      console.log("Switched to audio file index:", result.currentIndex);

      setAppStatus("Play"); // 更新状态为Play

      // ✅ 请求最新状态，确保最新音频状态
      await updateCorpusStatus();

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
            fontSize: "16px",
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