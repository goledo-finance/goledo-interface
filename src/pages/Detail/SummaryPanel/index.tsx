import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { type Token } from '../index';

const Hundred = Unit.fromMinUnit(100);

const SummaryPanel: React.FC<Token> = ({
  symbol,
  usdPrice,
  totalMarketSupplyBalance,
  totalMarketSupplyPrice,
  totalMarketBorrowBalance,
  availableBalance,
  availablePrice
}) => {
  const navigate = useNavigate();

  const utilizationRate = useMemo(
    () => (totalMarketSupplyBalance && totalMarketBorrowBalance ? totalMarketBorrowBalance.div(totalMarketSupplyBalance) : undefined),
    [totalMarketSupplyBalance, totalMarketBorrowBalance]
  );

  return (
    <div>
      <button onClick={() => navigate(-1)}>Go back</button>
      <h1>Overview</h1>
      <div className="flex gap-32px">
        <span>{symbol}</span>
        <div>
          <p>Total Amount</p>
          <p>{totalMarketSupplyBalance?.toDecimalStandardUnit(2) ?? '--'}</p>
          <p>${totalMarketSupplyPrice?.toDecimalStandardUnit(2) ?? '--'}</p>
        </div>

        <div>
          <p>Available liquidity</p>
          <p>{availableBalance?.toDecimalStandardUnit(2) ?? '--'}</p>
          <p>${availablePrice?.toDecimalStandardUnit(2) ?? '--'}</p>
        </div>

        <div>
          <p>Utilization Rate</p>
          <p>{utilizationRate ? `${utilizationRate?.mul(Hundred).toDecimalMinUnit(2)}%` : '--'}</p>
        </div>

        <div>
          <p>Oracle price</p>
          <p>${usdPrice?.toDecimalMinUnit(2) ?? '--'}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
