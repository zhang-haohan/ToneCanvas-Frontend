"use client";

import React, { createContext, useContext, useState } from "react";
import config from "../public/config.json";

// 定义上下文的类型
interface CorpusStatusContextType {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  currentFileName: string;
  setCurrentFileName: React.Dispatch<React.SetStateAction<string>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  totalCorpus: number;
  setTotalCorpus: React.Dispatch<React.SetStateAction<number>>;
  isFinished: boolean;
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
  refreshCorpusStatus: (nextUserId?: string) => Promise<boolean>;

  PlayButtonPressed: boolean;
  setPlayButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
  PitchButtonPressed: boolean;
  setPitchButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
  SwitchButtonPressed: boolean;
  setSwitchButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
  RecordButtonPressed: boolean;
  setRecordButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
  TraceButtonPressed: boolean;
  setTraceButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

// 创建上下文
const CorpusStatusContext = createContext<CorpusStatusContextType | undefined>(
  undefined
);

// 创建 Provider
export const CorpusStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>(""); 
  const [currentIndex, setCurrentIndex] = useState<number>(0); 
  const [totalCorpus, setTotalCorpus] = useState<number>(0); 
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [PlayButtonPressed, setPlayButtonPressed] = useState<boolean>(false);
  const [PitchButtonPressed, setPitchButtonPressed] = useState<boolean>(false);
  const [SwitchButtonPressed, setSwitchButtonPressed] = useState<boolean>(false);
  const [RecordButtonPressed, setRecordButtonPressed] = useState<boolean>(false);
  const [TraceButtonPressed, setTraceButtonPressed] = useState<boolean>(false);

  const getHeaders = (extraHeaders: Record<string, string> = {}) => ({
    ...config.headers,
    ...extraHeaders,
  });

  const refreshCorpusStatus = async (nextUserId?: string) => {
    try {
      const activeUserId = nextUserId ?? userId;
      const query = activeUserId
        ? `?user_id=${encodeURIComponent(activeUserId)}`
        : "";
      const [fileNameResponse, progressResponse] = await Promise.all([
        fetch(`${config.backendUrl}/api/get-file-name${query}`, {
          headers: getHeaders(),
        }),
        fetch(`${config.backendUrl}/api/get-progress${query}`, {
          headers: getHeaders(),
        }),
      ]);

      if (!fileNameResponse.ok) throw new Error("Failed to fetch file name");
      if (!progressResponse.ok) throw new Error("Failed to fetch progress");

      const fileNameData = await fileNameResponse.json();
      const progressData = await progressResponse.json();

      setCurrentFileName(fileNameData.fileName || "");
      setCurrentIndex(progressData.current_index ?? 0);
      setTotalCorpus(progressData.total_files ?? 0);
      setIsFinished(Boolean(progressData.is_finished));
      return true;
    } catch (error) {
      console.error("Error refreshing CorpusStatus:", error);
      return false;
    }
  };

  return (
    <CorpusStatusContext.Provider
      value={{
        userId,
        setUserId,
        currentFileName,
        setCurrentFileName,
        currentIndex,
        setCurrentIndex,
        totalCorpus,
        setTotalCorpus,
        isFinished,
        setIsFinished,
        refreshCorpusStatus,
        PlayButtonPressed,
        setPlayButtonPressed,
        PitchButtonPressed,
        setPitchButtonPressed,
        SwitchButtonPressed,
        setSwitchButtonPressed,
        RecordButtonPressed,
        setRecordButtonPressed,
        TraceButtonPressed,
        setTraceButtonPressed,
      }}
    >
      {children}
    </CorpusStatusContext.Provider>
  );
};

// 自定义 Hook 方便使用
export const useCorpusStatusContext = () => {
  const context = useContext(CorpusStatusContext);
  if (!context) {
    throw new Error("useCorpusStatusContext must be used within a CorpusStatusProvider");
  }
  return context;
};
