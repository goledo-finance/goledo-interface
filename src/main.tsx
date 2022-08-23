import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './router';
import 'uno.css';
import 'modern-css-reset/dist/reset.css';
import './index.css';
import '@store/index';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
