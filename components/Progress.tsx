"use client";

import React from "react";
import { usePointerContext } from "../contexts/PointerContext"; // 使用全局状态上下文
import { useCorpusStatusContext } from "../contexts/CorpusStatus"; // 使用 CorpusStatus 上下文

const fileNameMapping: Record<string, string> = {
  "chi_t1_bao_t3.wav": "chi T1 bao T3"
};

export default function Progress() {
  const { audioIsInitialized } = usePointerContext(); // 读取音频初始化状态
  const { currentFileName, currentIndex, totalCorpus } = useCorpusStatusContext();

  if (!audioIsInitialized) {
    return null; // 如果音频未初始化，则不显示组件
  }

  const displayFileName = fileNameMapping[currentFileName] || currentFileName;

  return (
    <div
      style={{
        position: "absolute",
        top: "7%",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        zIndex: 1000, // 确保在前端可见
      }}
    >
      {/* 显示文件名 */}
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "black",
        }}
      >
        {displayFileName || "No File"}
      </div>

      {/* 显示进度条 */}
      <div
        style={{
          marginTop: "10px",
          width: "50%",
          height: "3%",
          backgroundColor: "#e0e0e0",
          borderRadius: "10px",
          overflow: "hidden",
          display: "inline-block",
        }}
      >
        <div
          style={{
            width: `${((currentIndex + 1) / totalCorpus) * 100}%`,
            height: "100%",
            backgroundColor: "#76c7c0",
            transition: "width 0.3s ease-in-out",
          }}
        ></div>
      </div>

      {/* 显示当前进度 */}
      <div
        style={{
          marginTop: "5px",
          fontSize: "1rem",
          color: "gray",
        }}
      >
        {totalCorpus > 0
          ? `Progress: ${currentIndex + 1} / ${totalCorpus}`
          : "No progress available"}
      </div>
    </div>
  );
}
