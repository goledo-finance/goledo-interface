import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import cx from 'clsx';
import PageHeader from '@modules/PageHeader';
import { useCurUserSupplyPrice, useCurUserSupplyAPY, useCurUserBorrowPrice, useCurUserBorrowAPY, useUserData } from '@store/index';
import styles from './index.module.css';

const Hundred = Unit.fromMinUnit(100);

const SummaryPanelItem: React.FC<{ iconName: string; title: string; children: React.ReactElement<any> }> = ({ iconName, title, children }) => {
  return (
    <div className="flex items-center">
      <div className="h-42px w-42px bg-#393D4F border border-#787A82 rounded-12px mr-3 flex items-center justify-center">
        <span className={cx('text-24px text-#A6A8B5', iconName)} />
      </div>
      <span className="flex flex-col text-#160042">
        <span>{title}</span>
        {children}
      </span>
    </div>
  );
};

const SummaryPanel: React.FC = () => {
  const curUserSupplyPrice = useCurUserSupplyPrice();
  const curUserSupplyAPY = useCurUserSupplyAPY();
  const curUserBorrowPrice = useCurUserBorrowPrice();
  const curUserBorrowAPY = useCurUserBorrowAPY();
  const userData = useUserData();

  const NetWorth = useMemo(
    () => (curUserSupplyPrice && curUserBorrowPrice ? curUserSupplyPrice.sub(curUserBorrowPrice) : undefined),
    [curUserSupplyPrice, curUserBorrowPrice]
  );

  const NetAPY = useMemo(
    () =>
      curUserSupplyPrice && curUserSupplyAPY && curUserBorrowPrice && curUserBorrowAPY
        ? curUserSupplyPrice.mul(curUserSupplyAPY).sub(curUserBorrowPrice.mul(curUserBorrowAPY)).div(curUserSupplyPrice.sub(curUserBorrowPrice))
        : undefined,
    [curUserSupplyPrice, curUserSupplyAPY, curUserBorrowPrice, curUserBorrowAPY]
  );

  return (
    <div className="pt-20px pb-10px xl:pt-36px xl:pb-24px flex flex-col xl:flex-row !items-start sm:items-center justify-between">
      <PageHeader />
      <div className="flex gap-64px mt-2 xl:mt-0">
        <SummaryPanelItem iconName="i-iconoir:wallet" title="Net worth">
          <span className={styles.text}>${NetWorth?.toDecimalStandardUnit(2)}</span>
        </SummaryPanelItem>
        <SummaryPanelItem iconName="i-tabler:chart-bar" title="Net APY">
          <span className={styles.text}>{NetAPY?.mul(Hundred).toDecimalMinUnit(2)}%</span>
        </SummaryPanelItem>
        <SummaryPanelItem iconName="i-codicon:heart" title="Health Factor">
          <div className="mt-2px flex items-center">
            <span className="text-#67AD5B">{userData?.healthFactor ?? '--'}</span>
            <button className="text-#67AD5B border border-#67AD5B/50 hover:border-#67AD5B flex items-center h-20px box-content px-2 ml-2 rounded bg-transparent text-12px leading-16px">
              RISK DETAILS
            </button>
          </div>
        </SummaryPanelItem>
      </div>
    </div>
  );
};

export default SummaryPanel;
