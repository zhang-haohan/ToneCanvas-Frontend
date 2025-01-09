"use client";

import React, { useState, useEffect } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext"; // 使用全局状态上下文
import { useCorpusStatusContext } from "../contexts/CorpusStatus"; // 使用 CorpusStatus 上下文

export default function PlayButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { audioIsInitialized } = usePointerContext(); // 读取音频初始化状态
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
      // 调用 /api/get-file-name
      const fileNameResponse = await fetch(`${config.backendUrl}/api/get-file-name`);
      if (!fileNameResponse.ok) {
        throw new Error("Failed to fetch file name");
      }
      const fileNameData = await fileNameResponse.json();

      // 调用 /api/get-progress
      const progressResponse = await fetch(`${config.backendUrl}/api/get-progress`);
      if (!progressResponse.ok) {
        throw new Error("Failed to fetch progress");
      }
      const progressData = await progressResponse.json();

      // 更新上下文中的数据
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

  const handlePlayClick = async () => {
    try {
      await updateCorpusStatus(); // 更新 CorpusStatus

      if (!isPlaying) {
        // 请求后端获取音频文件
        const response = await fetch(`${config.backendUrl}/api/get-wav-file`);
        if (!response.ok) {
          throw new Error("Failed to fetch audio file");
        }
        const blob = await response.blob();

        // 创建 Audio 对象并播放
        const newAudio = new Audio(URL.createObjectURL(blob));
        newAudio
          .play()
          .then(() => {
            setAudio(newAudio);
            setIsPlaying(true);
            setConnectionStatus("Connected");
            console.log("Audio playback started");
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
            setConnectionStatus("Failed");
          });

        // 设置音频结束处理
        newAudio.onended = () => {
          setIsPlaying(false);
          console.log("Audio playback finished");
        };
      } else {
        // 停止播放
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
    <div>
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
            zIndex: 1000, // 确保按钮在前端可见
          }}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
      )}
    </div>
  );
}
