// src/buttonComponent.js

import { playIconURL, nextIconURL, pitchVoiceIconURL, guideTraceIconURL } from './svgIcons.js';
import { sharedStatus, subscribe, setIsInTheButton } from './sharedStatus.js';
import { updateFrequenciesFromJson, drawFrequencyTrajectory, clearTrajectoryData } from './frequencyUpdater.js';
import { drawReferenceLines } from './backgroundCanvas.js';

let previousStatus = '';

function createImageFromURL(url, onError) {
  const img = new Image();
  img.src = url;
  img.onerror = onError;
  return img;
}

function handleImageLoadError(event) {
  console.error("Failed to load SVG image:", event.target.src);
}

const playIcon = createImageFromURL(playIconURL, handleImageLoadError);
const nextIcon = createImageFromURL(nextIconURL, handleImageLoadError);
const pitchVoiceIcon = createImageFromURL(pitchVoiceIconURL, handleImageLoadError);
const guideTraceIcon = createImageFromURL(guideTraceIconURL, handleImageLoadError);

let playIconDimmed = false;
let nextIconDimmed = false;
let pitchVoiceIconDimmed = false;
let guideTraceIconDimmed = false;
let isAudioPlaying = false;

function drawButton(canvas, context, playIcon, nextIcon, pitchVoiceIcon, guideTraceIcon) {
  const buttonWidth = canvas.width * 0.1;
  const buttonHeight = canvas.height * 0.1;

  context.clearRect(10, 10, buttonWidth, buttonHeight);
  context.clearRect(10, canvas.height - 10 - buttonHeight, buttonWidth, buttonHeight);
  context.clearRect(10, canvas.height * 0.33 - buttonHeight / 2, buttonWidth, buttonHeight);
  context.clearRect(10, canvas.height * 0.67 - buttonHeight / 2, buttonWidth, buttonHeight);

  context.globalAlpha = playIconDimmed ? 0.5 : 1.0;
  context.drawImage(playIcon, 10, 10, buttonWidth, buttonHeight);

  context.globalAlpha = nextIconDimmed ? 0.5 : 1.0;
  context.drawImage(nextIcon, 10, canvas.height - 10 - buttonHeight, buttonWidth, buttonHeight);

  context.globalAlpha = pitchVoiceIconDimmed ? 0.5 : 1.0;
  context.drawImage(pitchVoiceIcon, 10, canvas.height * 0.33 - buttonHeight / 2, buttonWidth, buttonHeight);

  context.globalAlpha = guideTraceIconDimmed ? 0.5 : 1.0;
  context.drawImage(guideTraceIcon, 10, canvas.height * 0.67 - buttonHeight / 2, buttonWidth, buttonHeight);

  context.globalAlpha = 1.0;
}

function isInsideButton(x, y, canvas, buttonX, buttonY, buttonWidth, buttonHeight) {
  const canvasX = x * canvas.width;
  const canvasY = y * canvas.height;
  return canvasX >= buttonX && canvasX <= buttonX + buttonWidth && canvasY >= buttonY && canvasY <= buttonY + buttonHeight;
}

function isInsideGreenButton(x, y, canvas) {
  const buttonWidth = canvas.width * 0.1;
  const buttonHeight = canvas.height * 0.1;
  return isInsideButton(x, y, canvas, 10, 10, buttonWidth, buttonHeight);
}

function isInsideCyanButton(x, y, canvas) {
  const buttonWidth = canvas.width * 0.1;
  const buttonHeight = canvas.height * 0.1;
  const buttonY = canvas.height - 10 - buttonHeight;
  return isInsideButton(x, y, canvas, 10, buttonY, buttonWidth, buttonHeight);
}

function isInsideNewButton1(x, y, canvas) {
  const buttonWidth = canvas.width * 0.1;
  const buttonHeight = canvas.height * 0.1;
  const buttonY = canvas.height * 0.33 - buttonHeight / 2;
  return isInsideButton(x, y, canvas, 10, buttonY, buttonWidth, buttonHeight);
}

function isInsideNewButton2(x, y, canvas) {
  const buttonWidth = canvas.width * 0.1;
  const buttonHeight = canvas.height * 0.1;
  const buttonY = canvas.height * 0.67 - buttonHeight / 2;
  return isInsideButton(x, y, canvas, 10, buttonY, buttonWidth, buttonHeight);
}

function playAudio(url, callback) {
  if (isAudioPlaying) return;
  isAudioPlaying = true;

  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play().then(() => {
        callback(audio);
      }).catch(error => {
        console.error('Error playing audio file:', error);
        isAudioPlaying = false;
      });
      audio.onended = () => {
        isAudioPlaying = false;
      };
    })
    .catch(error => {
      console.error('Error fetching and playing audio file:', error);
      isAudioPlaying = false;
    });
}

function stopAudio(audio) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    isAudioPlaying = false;
  }
}

function switchAudio(callback) {
  fetch('https://tonecanvasbackend.azurewebsites.net/api/switch-wav-file', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      callback(data.currentIndex);
    })
    .catch(error => console.error('Error switching wav file:', error));
}

function fetchAndUpdateFrequencies(url, canvas, context) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      clearTrajectoryData(); // 清除旧的轨迹数据
      updateFrequenciesFromJson(data);
      drawFrequencyTrajectory(data); // 不再绘制到主canvas上
      drawReferenceLines(); // 绘制到背景canvas上
    })
    .catch(error => {
      console.error('Error fetching JSON file:', error);
    });
}

function handlePositionChange(x, y, status, canvas, context, audio, currentAudioIndex, setCurrentAudioIndex) {
  let isInButton = false;

  if (isInsideGreenButton(x, y, canvas)) {
    isInButton = true;
    if (status === 'StartDrawing') {
      playIconDimmed = true;
      playAudio(`https://tonecanvasbackend.azurewebsites.net/api/get-wav-file?index=${currentAudioIndex}`, newAudio => audio = newAudio);
    } else if (status === 'EndDrawing' || status === 'NotDrawing') {
      playIconDimmed = false;
      stopAudio(audio);
    }
  }

  if (isInsideCyanButton(x, y, canvas)) {
    isInButton = true;
    if (status === 'StartDrawing') {
      nextIconDimmed = true;
    } else if (status === 'EndDrawing' || status === 'NotDrawing') {
      nextIconDimmed = false;
    }

    if (previousStatus === 'StartDrawing' && status === 'Drawing') {
        switchAudio(newIndex => setCurrentAudioIndex(newIndex));
      }
  
      previousStatus = status;
    }
  
    if (isInsideNewButton1(x, y, canvas)) {
      isInButton = true;
      if (status === 'StartDrawing') {
        pitchVoiceIconDimmed = true;
        playAudio('https://tonecanvasbackend.azurewebsites.net/api/get-pitch-audio', newAudio => audio = newAudio);
      } else if (status === 'EndDrawing' || status === 'NotDrawing') {
        pitchVoiceIconDimmed = false;
        stopAudio(audio);
      }
    }
  
    if (isInsideNewButton2(x, y, canvas)) {
      isInButton = true;
      if (status === 'StartDrawing') {
        guideTraceIconDimmed = true;
        fetchAndUpdateFrequencies('https://tonecanvasbackend.azurewebsites.net/api/get-pitch-json', canvas, context);
      } else if (status === 'EndDrawing' || status === 'NotDrawing') {
        guideTraceIconDimmed = false;
      }
    }
  
    if (sharedStatus.isInTheButton !== isInButton) {
      setIsInTheButton(isInButton);
    }
  }
  
  export function initializeButton(canvas, context) {
    let audio;
    let currentAudioIndex = 0;
  
    function setCurrentAudioIndex(newIndex) {
      currentAudioIndex = newIndex;
    }
  
    subscribe((status) => {
      if (status.currentStatus === 'StartDrawing' || status.currentStatus === 'Drawing' || status.currentStatus === 'EndDrawing' || status.currentStatus === 'NotDrawing') {
        handlePositionChange(status.currentPosition.x, status.currentPosition.y, status.currentStatus, canvas, context, audio, currentAudioIndex, setCurrentAudioIndex);
        drawButton(canvas, context, playIcon, nextIcon, pitchVoiceIcon, guideTraceIcon);
      }
    });
  
    playIcon.onload = () => {
      nextIcon.onload = () => {
        pitchVoiceIcon.onload = () => {
          guideTraceIcon.onload = () => {
            drawButton(canvas, context, playIcon, nextIcon, pitchVoiceIcon, guideTraceIcon);
          };
        };
      };
    };
  
    playIcon.onerror = handleImageLoadError;
    nextIcon.onerror = handleImageLoadError;
    pitchVoiceIcon.onerror = handleImageLoadError;
    guideTraceIcon.onerror = handleImageLoadError;
  
    return () => drawButton(canvas, context, playIcon, nextIcon, pitchVoiceIcon, guideTraceIcon);
  }
