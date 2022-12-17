import React, { useState, useCallback } from 'react';
import cx from 'clsx';
import PageHeader from '@modules/Layout/PageHeader';
import PageWrapper from '@modules/Layout/PageWrapper';
import AuthConnectPage from '@modules/AuthConnectPage';
import useIsAuthed from '@hooks/useIsAuthed';
import SummaryPanel from './SummaryPanel';
import Rewards from './Rewards';
import YourSupplies from './YourSupplies';
import AssetsToSupply from './AssetsToSupply';
import YourBorrows from './YourBorrows';
import AssetsToBorrow from './AssetsToBorrow';
import Localstorage from 'localstorage-enhance';
import './index.css';

const DashBoard: React.FC = () => {
  const isAuthed = useIsAuthed();
  const [currentAsset, _setCurrentAsset] = useState<'Supply' | 'Borrow'>(() => {
    const cacheRes = Localstorage.getItem('dashboard-asset') as 'Supply' | 'Borrow';
    if (cacheRes === 'Supply' || cacheRes === 'Borrow') return cacheRes;
    return 'Supply';
  });

  const setCurrentAsset = useCallback((asset: 'Supply' | 'Borrow') => {
    _setCurrentAsset(asset);
    Localstorage.setItem({ key: 'dashboard-asset', data: asset });
  }, []);

  return (
    <>
      <PageHeader>
        <SummaryPanel />
      </PageHeader>

      <PageWrapper className="relative">
        {!isAuthed && (
          <AuthConnectPage>
            {(action) =>
              <p className="text-14px text-#62677B">
                {action} to see your supplies,
                <br className="lt-sm:display-none" />
                borrowings and open positions.
              </p>
            }
          </AuthConnectPage>
        )}
        {isAuthed && (
          <>
            <div className="xl:display-none absolute top-[-36px] left-1/2 translate-x-[-50%] w-320px h-36px p-6px rounded-t-4px text-14px bg-#383D51 text-center font-semibold overflow-hidden select-none">
              <div
                id='dashboard-assets-switch-supply'
                className={cx(
                  'inline-flex w-50% h-full justify-center items-center rounded-4px cursor-pointer',
                  currentAsset === 'Supply' ? 'bg-white pointer-events-none' : 'text-#8E92A3'
                )}
                onClick={() => setCurrentAsset('Supply')}
              >
                <span className={cx(currentAsset === 'Supply' && 'currentAsset')}>Supply</span>
              </div>
              <div
                id='dashboard-assets-switch-borrow'
                className={cx(
                  'inline-flex w-50% h-full justify-center items-center rounded-4px cursor-pointer',
                  currentAsset === 'Borrow' ? 'bg-white pointer-events-none' : 'text-#8E92A3'
                )}
                onClick={() => setCurrentAsset('Borrow')}
              >
                <span className={cx(currentAsset === 'Borrow' && 'currentAsset')}>Borrow</span>
              </div>
            </div>

            <div className="lt-xl:display-none">
              <Rewards />
              <div className="mt-18px flex flex-col gap-18px">
                <div className="flex lt-xl:flex-col gap-18px">
                  <YourSupplies />
                  <YourBorrows />
                </div>
                <div className="flex lt-xl:flex-col gap-18px">
                  <AssetsToSupply />
                  <AssetsToBorrow />
                </div>
              </div>
            </div>

            <div className="xl:display-none flex flex-col gap-18px">
              {currentAsset === 'Supply' && (
                <>
                  <Rewards />
                  <YourSupplies />
                  <AssetsToSupply />
                </>
              )}
              {currentAsset === 'Borrow' && (
                <>
                  <YourBorrows />
                  <AssetsToBorrow />
                </>
              )}
            </div>
          </>
        )}
      </PageWrapper>
    </>
  );
};

export default DashBoard;
