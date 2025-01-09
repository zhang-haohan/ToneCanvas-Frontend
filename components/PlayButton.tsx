"use client";

import React, { useState } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext"; // 使用全局状态上下文
import { useCorpusStatusContext } from "../contexts/CorpusStatus"; // 使用 CorpusStatus 上下文

export default function PlayButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { audioIsInitialized, appStatus, setAppStatus } = usePointerContext(); // 读取音频初始化状态和全局变量
  const {
    currentFileName,
    setCurrentFileName,
    currentIndex,
    setCurrentIndex,
    totalCorpus,
    setTotalCorpus,
  } = useCorpusStatusContext();

  // 查询并更新 CorpusStatus
  const updateCorpusStatus = async () => {
    try {
      const fileNameResponse = await fetch(`${config.backendUrl}/api/get-file-name`);
      if (!fileNameResponse.ok) {
        throw new Error("Failed to fetch file name");
      }
      const fileNameData = await fileNameResponse.json();

      const progressResponse = await fetch(`${config.backendUrl}/api/get-progress`);
      if (!progressResponse.ok) {
        throw new Error("Failed to fetch progress");
      }
      const progressData = await progressResponse.json();

      if (fileNameData.fileName !== currentFileName) {
        setCurrentFileName(fileNameData.fileName);
      }
      if (progressData.current_index !== currentIndex) {
        setCurrentIndex(progressData.current_index);
      }
      if (progressData.total_files !== totalCorpus) {
        setTotalCorpus(progressData.total_files);
      }
    } catch (error) {
      console.error("Error updating CorpusStatus:", error);
    }
  };

  // 记录按钮按下日志
  const logButtonPress = async (buttonName: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/send-button-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ button_name: buttonName }),
      });

      if (!response.ok) {
        throw new Error("Failed to log button press");
      }

      const result = await response.json();
      console.log("Button press logged:", result.message);
    } catch (error) {
      console.error("Error logging button press:", error);
    }
  };

  const handlePlayClick = async () => {
    try {
      await logButtonPress("Play"); // 记录按钮按下日志
      await updateCorpusStatus(); // 更新 CorpusStatus

      if (!isPlaying) {
        const response = await fetch(`${config.backendUrl}/api/get-wav-file`);
        if (!response.ok) {
          throw new Error("Failed to fetch audio file");
        }
        const blob = await response.blob();

        const newAudio = new Audio(URL.createObjectURL(blob));
        newAudio
          .play()
          .then(() => {
            setAudio(newAudio);
            setIsPlaying(true);
            setConnectionStatus("Connected");
            setAppStatus("Trace"); // 更新全局状态
            console.log("Audio playback started");
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
            setConnectionStatus("Failed");
          });

        newAudio.onended = () => {
          setIsPlaying(false);
          console.log("Audio playback finished");
        };
      } else {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          setIsPlaying(false);
          console.log("Audio playback stopped");
        }
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setConnectionStatus("Failed");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {audioIsInitialized && (
        <button
          onClick={handlePlayClick}
          style={{
            position: "relative",
            marginTop: "3%",
            marginLeft: "3%",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: isPlaying ? "red" : "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
      )}
      {appStatus === "Play" && (
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
