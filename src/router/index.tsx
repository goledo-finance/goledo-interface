import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomScrollbar from 'custom-react-scrollbar';
import ErrorBoundary from '@modules/ErrorBoundary';
import Navbar from '@modules/Navbar';
import Footer from '@modules/Footer';
import DashBoardPage from '@pages/Dashboard';
import MarketsPage from '@pages/Markets';
import DetailPage from '@pages/Detail';
import StakePage from '@pages/Stake';
import ClaimLossPage from '@pages/ClaimLoss';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Navbar />
        <CustomScrollbar className="main-scroller" contentClassName="pb-60px">
          <Routes>
            <Route index element={<DashBoardPage />} />
            <Route key="dashboard" path="dashboard" element={<DashBoardPage />} />
            <Route key="markets" path="markets" element={<MarketsPage />} />
            <Route key="detail" path="detail/:tokenAddress" element={<DetailPage />} />
            <Route key="stake" path="stake" element={<StakePage />} />
            <Route key="claim_loss" path="claim_loss" element={<ClaimLossPage />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
          <Footer />
        </CustomScrollbar>
      </ErrorBoundary>
    </Router>
  );
};

export default AppRouter;
