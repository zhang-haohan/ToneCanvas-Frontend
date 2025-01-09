"use client";

import React, { useState } from "react";
import config from "../public/config.json";
import { useAudioRangeContext } from "../contexts/AudioRange";
import { usePointerContext } from "../contexts/PointerContext"; // 引入全局音频初始化状态

export default function TraceButton() {
    const [isTraceVisible, setIsTraceVisible] = useState(false);
    const { setFrequencyRange } = useAudioRangeContext(); // 更新频率范围
    const { audioIsInitialized, appStatus, setAppStatus } = usePointerContext(); // 获取音频初始化状态和全局变量

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

    const handleTraceClick = async () => {
        try {
            await logButtonPress("Trace"); // 记录按钮按下日志

            if (isTraceVisible) {
                // 隐藏指导线
                const canvas = document.getElementById("trace-canvas") as HTMLCanvasElement;
                if (canvas) {
                    const context = canvas.getContext("2d");
                    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
                }
                setIsTraceVisible(false);
                return;
            }

            // 获取频率数据
            const response = await fetch(`${config.backendUrl}/api/get-pitch-json`);
            if (!response.ok) {
                throw new Error("Failed to fetch pitch JSON");
            }
            const json = await response.json();

            // 更新频率范围
            const maxFrequency = json.max_frequency * 1.15;
            const minFrequency = json.min_frequency * 0.85;
            setFrequencyRange({ min: minFrequency, max: maxFrequency });

            // 绘制指导线
            const canvas = document.getElementById("trace-canvas") as HTMLCanvasElement;
            if (!canvas) return;

            const context = canvas.getContext("2d");
            if (!context) return;

            // 设置高分辨率支持
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            context.scale(dpr, dpr);

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.lineWidth = Math.max(5, Math.min(canvas.width * 0.07 / dpr, 100));
            context.strokeStyle = "gray";

            context.beginPath();
            let isDrawing = false;

            json.data.forEach((point: { time: number; frequency: number }) => {
                const x = canvas.clientWidth * 0.2 + (canvas.clientWidth * 0.77 * point.time);
                const y = canvas.clientHeight - (canvas.clientHeight * ((point.frequency - minFrequency) / (maxFrequency - minFrequency)));

                if (isNaN(point.frequency)) {
                    isDrawing = false; // 断开指导线
                } else {
                    if (!isDrawing) {
                        context.moveTo(x, y);
                        isDrawing = true;
                    } else {
                        context.lineTo(x, y);
                    }
                }
            });

            context.stroke();
            setIsTraceVisible(true);
            setAppStatus("Pitch"); // 更新全局状态
        } catch (error) {
            console.error("Error fetching or drawing trace:", error);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {audioIsInitialized && (
                <button
                    onClick={handleTraceClick}
                    style={{
                        position: "relative",
                        marginTop: "10%",
                        marginLeft: "3%", // 修正格式
                        padding: "10px 20px",
                        fontSize: "16px",
                        cursor: "pointer",
                        backgroundColor: isTraceVisible ? "orange" : "purple",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        zIndex: 1000, // 确保按钮在前端可见
                    }}
                >
                    {isTraceVisible ? "Hide Trace" : "Show Trace"}
                </button>
            )}
            {appStatus === "Trace" && (
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
            <canvas
                id="trace-canvas"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    pointerEvents: "none", // 确保不会阻碍其他交互
                    zIndex: -1, // 确保在所有元素之下
                }}
            ></canvas>
        </div>
    );
}
