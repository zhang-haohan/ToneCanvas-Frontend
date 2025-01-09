"use client";

import React, { useState } from "react";
import * as Tone from "tone";
import { useAudioContext } from "../contexts/AudioContext"; // 使用音频上下文
import { usePointerContext } from "../contexts/PointerContext"; // 使用指针上下文
import { useAudioRangeContext } from "../contexts/AudioRange"; // 使用频率范围上下文

export default function Start() {
  const [isVisible, setIsVisible] = useState(true);
  const { synth } = useAudioContext();
  const { audioIsInitialized, setAudioIsInitialized } = usePointerContext();
  const { setFrequencyRange } = useAudioRangeContext(); // 引入频率范围上下文

  const handleStart = async () => {
    setIsVisible(false); // 隐藏按钮

    // 设置全屏
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if ((document.documentElement as any).webkitRequestFullscreen) {
      (document.documentElement as any).webkitRequestFullscreen();
    } else if ((document.documentElement as any).msRequestFullscreen) {
      (document.documentElement as any).msRequestFullscreen();
    }

    // 初始化音频上下文并设置全局状态
    if (synth && !audioIsInitialized) {
      try {
        await Tone.start();
        synth.triggerAttackRelease("C4", "2s");
        setAudioIsInitialized(true); // 更新音频初始化状态为 true

        // 设置音频频率范围
        setFrequencyRange({ min: 100, max: 8000 }); // 设置为网站中常用的范围
      } catch (error) {
        console.error("Error initializing audio context:", error);
      }
    }
  };

  return (
    isVisible && (
      <button
        onClick={handleStart}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          zIndex: 1000, // 确保按钮在最上层
        }}
      >
        Start
      </button>
    )
  );
}
