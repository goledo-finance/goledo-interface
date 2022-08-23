import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { type Token } from '../index';

const Hundred = Unit.fromMinUnit(100);

const SummaryPanel: React.FC<Token> = ({
  symbol,
  usdPrice,
  totalSupplyBalance,
  totalSupplyPrice,
  totalBorrowBalance,
  availableBalance,
  availablePrice
}) => {
  const navigate = useNavigate();

  const utilizationRate = useMemo(
    () => (totalSupplyBalance && totalBorrowBalance ? totalBorrowBalance.div(totalSupplyBalance) : undefined),
    [totalSupplyBalance, totalBorrowBalance]
  );

  return (
    <div>
      <button onClick={() => navigate(-1)}>Go back</button>
      <h1>Overview</h1>
      <div className="flex gap-32px">
        <span>{symbol}</span>
        <div>
          <p>Total Amount</p>
          <p>{totalSupplyBalance?.toDecimalStandardUnit(2) ?? '--'}</p>
          <p>${totalSupplyPrice?.toDecimalStandardUnit(2) ?? '--'}</p>
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
