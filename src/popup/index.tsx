// AI Accessibility Enhancer Main Entry Point
// WCAG 2.2-AA: React DOM render ve Chrome API entegrasyonu
// MIT License

import React from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';
import Popup from './popup';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
