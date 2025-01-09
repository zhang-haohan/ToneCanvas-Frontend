"use client"; // 添加这一行

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Tone from 'tone';

// 定义上下文的类型
interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  synth: Tone.Synth | null;
}

// 创建上下文
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// 提供者组件
export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth, setSynth] = useState<Tone.Synth | null>(null);

  useEffect(() => {
    // 初始化 Tone.js 的 Synth 实例
    const newSynth = new Tone.Synth().toDestination();
    setSynth(newSynth);

    // 清理函数：在组件卸载时释放资源
    return () => {
      newSynth.dispose();
    };
  }, []);

  // 切换播放状态
  const togglePlay = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start(); // 启动音频上下文
    }
    setIsPlaying((prev) => !prev);
    if (!isPlaying) {
      synth?.triggerAttackRelease('C4', '8n'); // 播放一个音符
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, togglePlay, synth }}>
      {children}
    </AudioContext.Provider>
  );
};

// 自定义 Hook 供组件使用上下文
export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
