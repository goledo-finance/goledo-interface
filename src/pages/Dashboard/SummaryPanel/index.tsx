import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';
import { useUserSupplyTokens, useUserTotalSupplyPrice, useUserTotalSupplyAPY, useUserBorrowTokens, useUserTotalBorrowPrice, useUserTotalBorrowAPY } from '@hooks/index';

const Zero = Unit.fromMinUnit(0);
const Hundred = Unit.fromMinUnit(100);

const SummaryPanel: React.FC = () => {
  const tokens = useTokens();
  const supplyTokens = useUserSupplyTokens(tokens);
  const totalSupplyPrice = useUserTotalSupplyPrice(supplyTokens);
  const totalSupplyAPY = useUserTotalSupplyAPY(supplyTokens, totalSupplyPrice);
  const borrowTokens = useUserBorrowTokens(tokens);
  const totalBorrowPrice = useUserTotalBorrowPrice(borrowTokens);
  const totalBorrowAPY = useUserTotalBorrowAPY(borrowTokens, totalBorrowPrice);

  const NetWorth = useMemo(
    () => (totalSupplyPrice && totalBorrowPrice ? totalSupplyPrice.sub(totalBorrowPrice) : undefined),
    [totalSupplyPrice, totalBorrowPrice]
  );

  const NetAPY = useMemo(
    () =>
      totalSupplyPrice && totalSupplyAPY && totalBorrowPrice && totalBorrowAPY
        ? totalSupplyPrice.mul(totalSupplyAPY).sub(totalBorrowPrice.mul(totalBorrowAPY)).div(totalSupplyPrice.sub(totalBorrowPrice))
        : undefined,
    [totalSupplyPrice, totalSupplyAPY, totalBorrowPrice, totalBorrowAPY]
  );

  const collateralTokens = useMemo(() => supplyTokens?.filter(token => token.collateral), [supplyTokens]);
  const cp = useMemo(
    () => collateralTokens?.reduce((pre, cur) => pre.add(cur.borrowPrice ? (cur.supplyPrice ?? Zero).mul(cur.reserveLiquidationThreshold ?? Zero).div(cur.borrowPrice) : Zero), Zero),
    [collateralTokens]
  );
  const healthFactor = useMemo(
    () => totalBorrowPrice && cp ? cp?.div(totalBorrowPrice) : undefined,
    [cp, totalBorrowPrice]
  );

  return (
    <div className="mb-12px flex gap-12px">
      <b>Net worth$: {NetWorth?.toDecimalStandardUnit(2)}</b>
      <b>totalAPY: {NetAPY?.mul(Hundred).toDecimalMinUnit(2)}%</b>
      <b>Health Factor: {cp?.toDecimalMinUnit()}</b>
    </div>
  );
};

export default SummaryPanel;
