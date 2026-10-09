import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/martian-mono/wdth.css';
import '@fontsource-variable/literata/opsz.css';
import '@fontsource-variable/literata/opsz-italic.css';
import '@fontsource/instrument-serif/400-italic.css';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
