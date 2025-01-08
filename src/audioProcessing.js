import { sharedStatus, subscribe, getIsInTheButton, getCurrentPosition, getMinFrequency, getMaxFrequency } from './sharedStatus.js';

let context = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;
let gainNode = context.createGain();
let lastUpdateTime = 0;
let updateInterval;

function startUpdatingPosition() {
  if (!oscillator) {
    oscillator = context.createOscillator();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();
  }

  updateInterval = setInterval(() => {
    if (sharedStatus.drawing && !getIsInTheButton()) {
      const { x, y } = getCurrentPosition();
      handlePosition(x, y);
    } else {
      // 在按钮区域时停止振荡器发声
      if (oscillator) {
        gainNode.gain.setTargetAtTime(0, context.currentTime, 0.01);
      }
    }
  }, 1000 / 120); // 每秒120次调用handlePosition
}

function stopUpdatingPosition() {
  clearInterval(updateInterval);
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
}

function handlePosition(x, y) {
  const now = Date.now();
  if (now - lastUpdateTime < 1000 / 120) { // 跳过120Hz内的请求
    return;
  }
  lastUpdateTime = now;

  const frequency = yToFrequency(1 - y);  // 使用 y 来计算频率
  const volume = 1;  // 将音量设为固定值，例如1

  if (oscillator) {
    oscillator.frequency.setTargetAtTime(frequency, context.currentTime, 0.01);
    gainNode.gain.setTargetAtTime(volume, context.currentTime, 0.01);
  }
}

function yToFrequency(y) {
  const minFrequency = getMinFrequency(); // 获取最小频率
  const maxFrequency = getMaxFrequency(); // 获取最大频率
  const minLogFrequency = Math.log(minFrequency);
  const maxLogFrequency = Math.log(maxFrequency);
  const logFrequency = minLogFrequency + (maxLogFrequency - minLogFrequency) * y;
  return Math.exp(logFrequency);
}

subscribe((status) => {
  if (status.currentStatus === 'StartDrawing' || status.currentStatus === 'Drawing') {
    startUpdatingPosition();
  } else if (status.currentStatus === 'EndDrawing' || status.currentStatus === 'NotDrawing') {
    stopUpdatingPosition();
  }
});
