"use client";

import React, { useState, useEffect } from "react";
import config from "../public/config.json";
import { useAudioRangeContext } from "../contexts/AudioRange";
import { usePointerContext } from "../contexts/PointerContext"; 
import { useCorpusStatusContext } from "../contexts/CorpusStatus"; 

export default function TraceButton() {
    const [isTraceVisible, setIsTraceVisible] = useState(false);
    const { setFrequencyRange } = useAudioRangeContext(); 
    const { audioIsInitialized, appStatus, setAppStatus } = usePointerContext();
    const { SwitchButtonPressed } = useCorpusStatusContext();

    useEffect(() => {
        if (SwitchButtonPressed) {
            setIsTraceVisible(false);
            const canvas = document.getElementById("trace-canvas") as HTMLCanvasElement;
            if (canvas) {
                const context = canvas.getContext("2d");
                if (context) context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [SwitchButtonPressed]);

    const getHeaders = (extraHeaders: Record<string, string> = {}) => {
        return {
            ...config.headers,
            ...extraHeaders,
        };
    };

    const logButtonPress = async (buttonName: string) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/send-button-log`, {
                method: "POST",
                headers: getHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({ button_name: buttonName }),
            });
            if (!response.ok) throw new Error("Failed to log button press");
        } catch (error) {
            console.error("Error logging button press:", error);
        }
    };

    const handleTraceClick = async () => {
        try {
            await logButtonPress("Trace"); 

            if (isTraceVisible) {
                const canvas = document.getElementById("trace-canvas") as HTMLCanvasElement;
                if (canvas) {
                    const context = canvas.getContext("2d");
                    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
                }
                setIsTraceVisible(false);
                return;
            }

            const response = await fetch(`${config.backendUrl}/api/get-pitch-json`, {
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error("Failed to fetch pitch JSON");
            const json = await response.json();

            const maxFrequency = json.max_frequency * 1.4;
            const minFrequency = json.min_frequency * 0.65;
            setFrequencyRange({ min: minFrequency, max: maxFrequency });

            const canvas = document.getElementById("trace-canvas") as HTMLCanvasElement;
            if (!canvas) return;

            const context = canvas.getContext("2d");
            if (!context) return;

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
                    isDrawing = false;
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
            setAppStatus("Pitch");
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
                        position: "absolute",
                        top: "45vh",
                        left: "5vw",
                        width: "20vw",
                        height: "8vh",
                        fontSize: "16px",
                        cursor: "pointer",
                        backgroundColor: isTraceVisible ? "orange" : "purple",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        zIndex: 1000,
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
                    left: "15vw",
                    top: "15vh",
                    width: "80vw",
                    height: "80vh",
                    pointerEvents: "none",
                    zIndex: -1,
                }}
            ></canvas>
        </div>
    );
}
