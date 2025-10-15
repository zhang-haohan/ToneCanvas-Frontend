"use client";

import React, { useState } from "react";
import * as Tone from "tone";
import { useAudioContext } from "../contexts/AudioContext"; // 使用音频上下文
import { usePointerContext } from "../contexts/PointerContext"; // 使用指针上下文
import { useAudioRangeContext } from "../contexts/AudioRange"; // 使用频率范围上下文
import config from "../public/config.json";

export default function Start() {
  const [isVisible, setIsVisible] = useState(true);
  const [userId, setUserId] = useState(""); // 用户输入的用户号
  const [errorMessage, setErrorMessage] = useState(""); // 错误提示信息
  const [isBackendAvailable, setIsBackendAvailable] = useState(true); // 后端状态
  const { synth } = useAudioContext();
  const { audioIsInitialized, setAudioIsInitialized } = usePointerContext();
  const { setFrequencyRange } = useAudioRangeContext(); // 引入频率范围上下文

  // ✅ 统一 API 请求的 headers 处理
  const getHeaders = (extraHeaders: Record<string, string> = {}) => {
    return {
      ...config.headers, // `config.json` 里的 headers
      ...extraHeaders,   // 组件里额外需要的 headers
    };
  };

  const handleStart = async () => {
    console.log("✅ handleStart Triggered, user ID =", userId); // <-- 加这一行！
    
    if (!userId.trim()) {
      setErrorMessage("User ID is required.");
      return;
    }

    try {
      // ✅ 发送用户 ID 到后端
      const response = await fetch(`${config.backendUrl}/api/send-user-id`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }), // ✅ 统一 headers
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        console.log(data.message);
        setErrorMessage(""); // 清空错误信息
        setIsVisible(false); // 隐藏按钮

        // ✅ 设置全屏
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          (document.documentElement as any).msRequestFullscreen();
        }

        // ✅ 初始化音频上下文并设置全局状态
        if (synth && !audioIsInitialized) {
          try {
            await Tone.start();
            setAudioIsInitialized(true); // 更新音频初始化状态为 true

            // 设置音频频率范围
            setFrequencyRange({ min: 100, max: 8000 }); // 设置为网站中常用的范围
          } catch (error) {
            console.error("Error initializing audio context:", error);
          }
        }
      } else if (response.status === 400) {
        setErrorMessage("Invalid User ID. Please try again.");
      } else {
        throw new Error("Unexpected error");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setIsBackendAvailable(false); // 标记后端不可用
    }
  };

  return (
    isVisible && (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 1000,
        }}
      >
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter your User ID"
          style={{
            marginBottom: "10px",
            padding: "10px",
            fontSize: "min(2vw, 2vh)", // 响应式字体大小
            fontWeight: "bold",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "200px",
            color: "black", // 设置字体颜色为黑色
            backgroundColor: "white", // 确保输入框背景色为白色
          }}
        />
        <br />
        {errorMessage && (
          <span
            style={{
              color: "red",
              fontSize: "min(4vw, 4vh)", // 响应式字体大小
              fontWeight: "bold",
              display: "block",
              marginTop: "5px",
            }}
          >
            {errorMessage}
          </span>
        )}
        <button
          onClick={handleStart}
          //disabled={!isBackendAvailable} // 后端不可用时禁用按钮
          style={{
            padding: "10px 20px",
            fontSize: "min(4vw, 4vh)", // 响应式字体大小
            fontWeight: "bold",
            cursor: isBackendAvailable ? "pointer" : "not-allowed",
            backgroundColor: isBackendAvailable ? "#007bff" : "gray",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "10px",
          }}
        >
          {isBackendAvailable ? "Start" : "Backend Unavailable"}
        </button>
      </div>
    )
  );
}
