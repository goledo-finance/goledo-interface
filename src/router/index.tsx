import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import CustomScrollbar from 'custom-react-scrollbar';
import ErrorBoundary from '@modules/ErrorBoundary';
import Navbar from '@modules/Navbar';
import DashBoardPage from '@pages/Dashboard';
import MarketsPage from '@pages/Markets';
import DetailPage from '@pages/Detail';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <CustomScrollbar>
        <ErrorBoundary>
          <Navbar />
          <Routes>
            <Route index element={<DashBoardPage />} />
            <Route key="dashboard" path="dashboard" element={<DashBoardPage />} />
            <Route key="markets" path="markets" element={<MarketsPage />} />
            <Route path="detail/:tokenAddress" element={<DetailPage />} />
          </Routes>
        </ErrorBoundary>
      </CustomScrollbar>
    </Router>
  );
};

export default AppRouter;
