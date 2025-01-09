"use client";

import React, { createContext, useContext, useState } from "react";

// 定义上下文类型
interface AudioRangeContextType {
  frequencyRange: { min: number; max: number };
  setFrequencyRange: React.Dispatch<
    React.SetStateAction<{ min: number; max: number }>
  >;
}

// 创建上下文
const AudioRangeContext = createContext<AudioRangeContextType | undefined>(
  undefined
);

// 创建 Provider
export const AudioRangeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [frequencyRange, setFrequencyRange] = useState<{ min: number; max: number }>({
    min: 20, // 默认最低频率
    max: 20000, // 默认最高频率
  });

  return (
    <AudioRangeContext.Provider value={{ frequencyRange, setFrequencyRange }}>
      {children}
    </AudioRangeContext.Provider>
  );
};

// 自定义 Hook 方便使用
export const useAudioRangeContext = () => {
  const context = useContext(AudioRangeContext);
  if (!context) {
    throw new Error("useAudioRangeContext must be used within an AudioRangeProvider");
  }
  return context;
};
