import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, useCurUserSupplyPrice, useCurUserSupplyAPY, useCurUserBorrowPrice, useCurUserBorrowAPY } from '@store/index';

const Zero = Unit.fromMinUnit(0);
const Hundred = Unit.fromMinUnit(100);
const TenThousand = Unit.fromMinUnit(10000);

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

  const collateralTokens = useMemo(() => curUserSupplyTokens?.filter(token => token.collateral), [curUserSupplyTokens]);
  const sumReserveLiquidationThreshold = useMemo(
    () => collateralTokens?.reduce((pre, cur) => pre.add(cur.borrowPrice ? (cur.supplyPrice ?? Zero).mul(cur.reserveLiquidationThreshold ?? Zero).div(TenThousand) : Zero), Zero),
    [collateralTokens]
  );
  const healthFactor = useMemo(
    () => curUserBorrowPrice && sumReserveLiquidationThreshold ? sumReserveLiquidationThreshold?.div(curUserBorrowPrice) : undefined,
    [sumReserveLiquidationThreshold, curUserBorrowPrice]
  );

  return (
    <div className="mb-12px flex gap-12px">
      <b>Net worth$: {NetWorth?.toDecimalStandardUnit(2)}</b>
      <b>Net APY: {NetAPY?.mul(Hundred).toDecimalMinUnit(2)}%</b>
      <b>Health Factor: {healthFactor?.toDecimalMinUnit(2)}</b>
    </div>
  );
};

export default SummaryPanel;
