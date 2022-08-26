import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomScrollbar from 'custom-react-scrollbar';
import ErrorBoundary from '@modules/ErrorBoundary';
import Navbar from '@modules/Navbar';
import DashBoardPage from '@pages/Dashboard';
import MarketsPage from '@pages/Markets';
import DetailPage from '@pages/Detail';
import StakePage from '@pages/Stake';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <CustomScrollbar className='main-scroller'>
        <ErrorBoundary>
          <Navbar />
          <div className="-mt-240px w-full pb-39px">
            <Routes>
              <Route index element={<DashBoardPage />} />
              <Route key="dashboard" path="dashboard" element={<DashBoardPage />} />
              <Route key="markets" path="markets" element={<MarketsPage />} />
              <Route key="detail" path="detail/:tokenAddress" element={<DetailPage />} />
              <Route key="stake" path="stake" element={<StakePage />} />
            </Routes>
          </div>
        </ErrorBoundary>
      </CustomScrollbar>
    </Router>
  );
};

export default AppRouter;
