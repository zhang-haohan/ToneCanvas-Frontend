"use client";

import React, { useState } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext"; // 使用全局状态上下文

export default function PitchAudioButton() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const { audioIsInitialized, appStatus, setAppStatus } = usePointerContext(); // 读取音频初始化状态和全局变量

    // 合并 headers：确保 `config.headers` 和本地 headers 一起使用
    const getHeaders = (extraHeaders: Record<string, string> = {}) => {
        return {
            ...config.headers, // `config.json` 里的 headers
            ...extraHeaders,   // 组件里自定义的 headers
        };
    };

    // 记录按钮按下日志
    const logButtonPress = async (buttonName: string) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/send-button-log`, {
                method: "POST",
                headers: getHeaders({ "Content-Type": "application/json" }), // 合并 headers
                body: JSON.stringify({ button_name: buttonName }),
            });

            if (!response.ok) {
                throw new Error("Failed to log button press");
            }

            const result = await response.json();
            console.log("Button press logged:", result.message);
        } catch (error) {
            console.error("Error logging button press:", error);
        }
    };

    const handlePlayClick = async () => {
        try {
            await logButtonPress("Pitch"); // 记录按钮按下日志

            if (!isPlaying) {
                // 请求后端获取音频文件
                const response = await fetch(`${config.backendUrl}/api/get-pitch-audio`, {
                    headers: getHeaders(), // 合并 headers
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch pitch audio file");
                }
                const blob = await response.blob();

                // 创建 Audio 对象并播放
                const newAudio = new Audio(URL.createObjectURL(blob));
                newAudio.play().then(() => {
                    setAudio(newAudio);
                    setIsPlaying(true);
                    setConnectionStatus("Connected");
                    setAppStatus("Switch"); // 更新全局状态
                    console.log("Pitch audio playback started");
                }).catch((error) => {
                    console.error("Error playing pitch audio:", error);
                    setConnectionStatus("Failed");
                });

                // 设置音频结束处理
                newAudio.onended = () => {
                    setIsPlaying(false);
                    console.log("Pitch audio playback finished");
                };
            } else {
                // 停止播放
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                    setIsPlaying(false);
                    console.log("Pitch audio playback stopped");
                }
            }
        } catch (error) {
            console.error("Error connecting to backend:", error);
            setConnectionStatus("Failed");
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {audioIsInitialized && (
                <button
                    onClick={handlePlayClick}
                    style={{
                        position: "absolute", // 绝对定位
                        top: "33vh",  // 距离屏幕顶部 20% 高度
                        left: "5vw",  // 距离屏幕左侧 5% 宽度
                        width: "20vw", // 宽度占屏幕的 20%
                        height: "12vh", // 高度占屏幕的 10%
                        fontSize: "min(4vw, 4vh)", // 响应式字体大小
                        fontWeight: "bold",
                        cursor: "pointer",
                        backgroundColor: isPlaying ? "orange" : "blueviolet",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        zIndex: 1000, // 确保按钮在前端可见
                    }}
                >
                    {isPlaying ? "Stop" : "Play Pitch"}
                </button>
            )}
            {appStatus === "Pitch" && (
                <div
                    style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "green",
                        borderRadius: "50%",
                        marginLeft: "10px",
                    }}
                ></div>
            )}
        </div>
    );
    
}
