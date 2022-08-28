import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './router';
import { completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet-react/ethereum';
import 'uno.css';
import 'modern-css-reset/dist/reset.css';
import 'custom-react-scrollbar/dist/style.css';
import './index.css';
import '@store/index';

completeDetectEthereum().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Router />
    </React.StrictMode>
  );
});

