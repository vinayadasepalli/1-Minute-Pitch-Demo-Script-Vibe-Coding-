// Filter out benign TensorFlow Lite WASM C++ initialization info messages
const isTfLiteNoise = (args: unknown[]): boolean => {
  return args.some((arg) => {
    if (typeof arg === 'string') {
      return (
        arg.includes('TensorFlow Lite') ||
        arg.includes('XNNPACK') ||
        arg.includes('Created TensorFlow Lite XNNPACK delegate')
      );
    }
    return false;
  });
};

const origInfo = console.info;
const origLog = console.log;
const origWarn = console.warn;
const origError = console.error;

console.info = (...args: unknown[]) => {
  if (isTfLiteNoise(args)) return;
  origInfo.apply(console, args);
};

console.log = (...args: unknown[]) => {
  if (isTfLiteNoise(args)) return;
  origLog.apply(console, args);
};

console.warn = (...args: unknown[]) => {
  if (isTfLiteNoise(args)) return;
  origWarn.apply(console, args);
};

console.error = (...args: unknown[]) => {
  if (isTfLiteNoise(args)) return;
  origError.apply(console, args);
};

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
