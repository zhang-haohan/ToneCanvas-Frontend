"use client";

import React, { useState } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext"; // 使用全局状态上下文

export default function PitchAudioButton() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const { audioIsInitialized } = usePointerContext(); // 读取音频初始化状态

    // 记录按钮按下日志
    const logButtonPress = async (buttonName: string) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/send-button-log`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
                const response = await fetch(`${config.backendUrl}/api/get-pitch-audio`);
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
        <div>
            {audioIsInitialized && (
                <button
                    onClick={handlePlayClick}
                    style={{
                        position: "relative",
                        marginTop: "10%",
                        marginLeft: "3%",
                        padding: "10px 20px",
                        fontSize: "16px",
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
        </div>
    );
}
