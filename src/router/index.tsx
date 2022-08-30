import React, { memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomScrollbar from 'custom-react-scrollbar';
import { useBalance } from '@cfxjs/use-wallet-react/ethereum';
import ErrorBoundary from '@modules/ErrorBoundary';
import Navbar from '@modules/Navbar';
import DashBoardPage from '@pages/Dashboard';
import MarketsPage from '@pages/Markets';
import DetailPage from '@pages/Detail';
import StakePage from '@pages/Stake';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Navbar />
        <BalanceRef />
        <CustomScrollbar className="main-scroller" contentClassName='pb-100px'>
            <Routes>
              <Route index element={<DashBoardPage />} />
              <Route key="dashboard" path="dashboard" element={<DashBoardPage />} />
              <Route key="markets" path="markets" element={<MarketsPage />} />
              <Route key="detail" path="detail/:tokenAddress" element={<DetailPage />} />
              <Route key="stake" path="stake" element={<StakePage />} />
              <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
        </CustomScrollbar>
      </ErrorBoundary>
    </Router>
  );
};

const BalanceRef: React.FC = memo(() => {
  useBalance();
  return null;
});

export default AppRouter;
