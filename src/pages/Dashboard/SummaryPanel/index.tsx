import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import styles from './index.module.css';
import cx from 'clsx';
import PageHeader from '@modules/PageHeader';
import { useTokens, useCurUserSupplyPrice, useCurUserSupplyAPY, useCurUserBorrowPrice, useCurUserBorrowAPY } from '@store/index';

const Zero = Unit.fromMinUnit(0);
const Hundred = Unit.fromMinUnit(100);
const TenThousand = Unit.fromMinUnit(10000);

const SummaryPanelItem: React.FC<{ iconName: string; title: string; children: React.ReactElement<any> }> = ({ iconName, title, children }) => {
  return (
    <div className="flex items-center">
      <div className="h-42px w-42px bg-#393D4F border border-#787A82 rounded-12px mr-3 flex items-center justify-center">
        <span className={cx('text-32px text-#A6A8B5', iconName)} />
      </div>
      <span className="flex flex-col text-#160042">
        <span>{title}</span>
        {children}
      </span>
    </div>
  );
};

const SummaryPanel: React.FC = () => {
  const tokens = useTokens();
  const curUserSupplyTokens = useMemo(() => tokens?.filter((token) => token.supplyBalance?.greaterThan(Zero)), [tokens]);
  const curUserSupplyPrice = useCurUserSupplyPrice();
  const curUserSupplyAPY = useCurUserSupplyAPY();
  const curUserBorrowPrice = useCurUserBorrowPrice();
  const curUserBorrowAPY = useCurUserBorrowAPY();

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

  const collateralTokens = useMemo(() => curUserSupplyTokens?.filter((token) => token.collateral), [curUserSupplyTokens]);
  const sumReserveLiquidationThreshold = useMemo(
    () =>
      collateralTokens?.reduce(
        (pre, cur) => pre.add(cur.borrowPrice ? (cur.supplyPrice ?? Zero).mul(cur.reserveLiquidationThreshold ?? Zero).div(TenThousand) : Zero),
        Zero
      ),
    [collateralTokens]
  );
  const healthFactor = useMemo(
    () => (curUserBorrowPrice && sumReserveLiquidationThreshold ? sumReserveLiquidationThreshold?.div(curUserBorrowPrice) : undefined),
    [sumReserveLiquidationThreshold, curUserBorrowPrice]
  );

  return (
    <div className="px-100px py-16px flex items-center justify-between">
      <PageHeader />
      <div className="flex gap-64px">
        <SummaryPanelItem iconName="i-iconoir:wallet" title="Net worth">
          <span className={styles.text}>${NetWorth?.toDecimalStandardUnit(2)}</span>
        </SummaryPanelItem>
        <SummaryPanelItem iconName="i-tabler:chart-bar" title="Net APY">
          <span className={styles.text}>{NetAPY?.mul(Hundred).toDecimalMinUnit(2)}%</span>
        </SummaryPanelItem>
        <SummaryPanelItem iconName="i-cil:heart" title="Health Factor">
          <div className="mt-2px flex items-center">
            <span className="text-#67AD5B">{healthFactor?.toDecimalMinUnit(2)}</span>
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
