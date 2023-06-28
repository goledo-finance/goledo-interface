import React, { memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomScrollbar from 'custom-react-scrollbar';
import ErrorBoundary from '@modules/ErrorBoundary';
import Navbar from '@modules/Navbar';
import DashBoardPage from '@pages/Dashboard';
import MarketsPage from '@pages/Markets';
import DetailPage from '@pages/Detail';
import StakePage from '@pages/Stake';
import { useWalletStore } from '@store/Wallet';
import { walletFunction } from '@utils/wallet';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Navbar />
        <BalanceRef />
        <CustomScrollbar className="main-scroller" contentClassName="pb-100px">
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
  const wallet = useWalletStore();
  const useBalance = walletFunction[wallet.name].useBalance;
  useBalance();
  return null;
});

export default AppRouter;
