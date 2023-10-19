import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './router';
import isMobile from '@utils/isMobie';
import 'uno.css';
import 'reseter.css/css/reseter.css';
import 'custom-react-scrollbar/dist/style.css';
import './index.css';
import '@store/index';

if (isMobile()) {
  document.styleSheets[0].insertRule('.scrollbar__thumbPlaceholder--vertical { display:none; }', 0);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
