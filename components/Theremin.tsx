"use client";

import React, { useEffect, useRef } from "react";
import { useAudioContext } from "../contexts/AudioContext";
import { usePointerContext } from "../contexts/PointerContext";
import { useAudioRangeContext } from "../contexts/AudioRange";
import { isIPhoneAudioDevice } from "./iPhoneAudio";

const Theremin: React.FC = () => {
  const { synth } = useAudioContext(); // 获取 Tone.js 的合成器
  const { position, isDrawing, audioIsInitialized } = usePointerContext(); // 获取指针位置和绘制状态
  const { frequencyRange } = useAudioRangeContext(); // 获取音频频率范围

// 用 useRef 存储是否正在播放，避免多次 triggerAttack
  const isPlayingRef = useRef(false);
  
  useEffect(() => {
    if (isIPhoneAudioDevice()) {
      if (synth && isPlayingRef.current) {
        synth.triggerRelease();
        isPlayingRef.current = false;
      }
      return;
    }

    if (audioIsInitialized && isDrawing && synth) {
      // 计算频率
      const { min, max } = frequencyRange;
      const yPercentage = Math.max(0, Math.min(1, position.y / 100)); // 将 y 值归一化为 0-1 范围
      const frequency = min + yPercentage * (max - min); // 根据 y 的百分比计算频率

      // ✅ 新增逻辑：只在“未播放”时 Attack，避免 Tone.js 报错
      if (!isPlayingRef.current) {
        isPlayingRef.current = true; // ✅ 标记为已开始播放
        synth.triggerAttack(frequency); // 🔊 第一次播放
      } else {
        // ✅ 新增：频率变化时使用平滑过渡，不触发新的 Attack
        synth.frequency.linearRampTo(frequency, 0.05);
      }
    }
    // ✅ 新增：松手或停止绘制时释放声音
    else if (synth && isPlayingRef.current) {
      synth.triggerRelease(); // ✅ 原 triggerRelease 保留
      isPlayingRef.current = false; // ✅ 重置状态，允许下一轮 Attack
    }
  }, [audioIsInitialized, isDrawing, position.y, frequencyRange, synth]);

  return null; // 组件无需渲染任何 UI
};

export default Theremin;
