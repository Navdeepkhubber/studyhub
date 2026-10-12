import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing root element');
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);

// Register after load (or right away if load already fired).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const register = () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* offline mode is optional */ });
  if (document.readyState === 'complete') void register(); else window.addEventListener('load', () => void register());
}
