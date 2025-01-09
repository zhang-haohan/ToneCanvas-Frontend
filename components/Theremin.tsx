"use client";

import React, { useEffect } from "react";
import { useAudioContext } from "../contexts/AudioContext";
import { usePointerContext } from "../contexts/PointerContext";
import { useAudioRangeContext } from "../contexts/AudioRange";

const Theremin: React.FC = () => {
  const { synth } = useAudioContext(); // 获取 Tone.js 的合成器
  const { position, isDrawing, audioIsInitialized } = usePointerContext(); // 获取指针位置和绘制状态
  const { frequencyRange } = useAudioRangeContext(); // 获取音频频率范围

  useEffect(() => {
    if (audioIsInitialized && isDrawing && synth) {
      // 计算频率
      const { min, max } = frequencyRange;
      const yPercentage = Math.max(0, Math.min(1, position.y / 100)); // 将 y 值归一化为 0-1 范围
      const frequency = min + yPercentage * (max - min); // 根据 y 的百分比计算频率

      synth.triggerAttack(frequency); // 发出对应频率的声音

      return () => {
        synth.triggerRelease(); // 停止声音
      };
    }
  }, [audioIsInitialized, isDrawing, position.y, frequencyRange, synth]);

  return null; // 组件无需渲染任何 UI
};

export default Theremin;
