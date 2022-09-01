import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import Card from '@components/Card';
import Button from '@components/Button';
import showSupplyModal from '@service/handleSupply';
import showWithdrawModal from '@service/handleWithdraw';
import { type Token } from '../index';

const Zero = Unit.fromMinUnit(0);
const Operate: React.FC<{ address: string; symbol: string; balance?: Unit; supplyBalance?: Unit }> = ({ address, symbol, balance, supplyBalance }) => {
  return (
    <div className="flex items-center gap-8px">
      <Button size="small" className="w-80px" loading={!balance} disabled={balance?.equalsWith(Zero)} onClick={() => showSupplyModal({ address, symbol })}>
        Supply
      </Button>
      <Button
        size="small"
        variant="outlined"
        className="w-80px"
        loading={!supplyBalance}
        disabled={supplyBalance?.equalsWith(Zero)}
        onClick={() => showWithdrawModal({ address, symbol })}
      >
        Withdraw
      </Button>
    </div>
  );
};

const Supplies: React.FC<Token> = ({ address, symbol, balance, supplyBalance }) => {
  return (
    <Card
      title="Supplies"
      className="flex-auto flex flex-col gap-12px"
      titleRight={<Operate address={address} symbol={symbol} balance={balance} supplyBalance={supplyBalance} />}
    >
      <div className="mt-4px flex justify-between text-14px text-#303549">
        <span>Your wallet balance</span>
        <span className="font-semibold">
          {balance?.toDecimalStandardUnit(2) ?? '--'}
          <span className="text-#62677B font-normal"> {symbol}</span>
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>You already deposited</span>
        <span className="font-semibold">
          {supplyBalance?.toDecimalStandardUnit(2) ?? '--'}
          <span className="text-#62677B font-normal"> {symbol}</span>
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>Use as coliateral</span>
      </div>
    </Card>
  );
};

export default Supplies;
