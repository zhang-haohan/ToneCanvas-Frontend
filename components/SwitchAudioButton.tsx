"use client";

import React, { useState } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext"; // 使用全局状态上下文

export default function SwitchAudioButton() {
    const [isSwitching, setIsSwitching] = useState(false);
    const { audioIsInitialized } = usePointerContext(); // 读取音频初始化状态

    const handleSwitchClick = async () => {
      try {
        setIsSwitching(true);
        // 请求后端切换音频文件
        const response = await fetch(`${config.backendUrl}/api/switch-wav-file`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error("Failed to switch audio file");
        }
        const result = await response.json();
        console.log("Switched to audio file index:", result.currentIndex);
      } catch (error) {
        console.error("Error switching audio file:", error);
      } finally {
        setIsSwitching(false);
      }
    };

    return (
      <div>
        {audioIsInitialized && (
          <button
            onClick={handleSwitchClick}
            disabled={isSwitching} // 禁用按钮以防止重复切换
            style={{
              position: "relative",
              marginTop: "10%",
              marginLeft: "3%",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: isSwitching ? "gray" : "blue",
              color: "white",
              border: "none",
              borderRadius: "5px",
              zIndex: 1000, // 确保按钮在前端可见
            }}
          >
            {isSwitching ? "Switching..." : "Switch"}
          </button>
        )}
      </div>
    );
}
