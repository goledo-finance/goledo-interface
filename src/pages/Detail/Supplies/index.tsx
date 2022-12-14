import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import Card from '@components/Card';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import Toggle from '@components/Toggle';
import showSupplyModal from '@service/handleSupply';
import showWithdrawModal from '@service/handleWithdraw';
import showCollateralChangeModal from '@service/handleCollateralChange';
import { type Token } from '../index';

const Zero = Unit.fromMinUnit(0);
const Operate: React.FC<{ address: string; symbol: string; balance?: Unit; supplyBalance?: Unit }> = ({ address, symbol, balance, supplyBalance }) => {
  return (
    <div className="flex items-center gap-8px">
      <Button id='detail-supplies-supply-btn' size="small" className="w-80px" loading={!balance} disabled={balance?.equalsWith(Zero)} onClick={() => showSupplyModal({ address, symbol })}>
        Supply
      </Button>
      <Button
        id='detail-supplies-withdraw-btn'
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

const Supplies: React.FC<Token> = ({ address, symbol, decimals, balance, supplyBalance, collateral, canBeCollateral }) => {
  return (
    <Card
      title="Supplying"
      className="flex-auto flex flex-col gap-12px"
      titleRight={<Operate address={address} symbol={symbol} balance={balance} supplyBalance={supplyBalance} />}
    >
      <div className="mt-4px flex justify-between text-14px text-#303549">
        <span>Your wallet balance</span>
        <span className="font-semibold">
          <BalanceText balance={balance} decimals={decimals} />
          <span className="text-#62677B font-normal"> {symbol}</span>
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>You already deposited</span>
        <span className="font-semibold">
          <BalanceText balance={supplyBalance} decimals={decimals} />
          <span className="text-#62677B font-normal"> {symbol}</span>
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>Use as Collateral</span>
        <Toggle id='detail-supplies-toggle' checked={collateral && canBeCollateral} disabled={!canBeCollateral} onClick={() => showCollateralChangeModal({ address, symbol })} />
      </div>
    </Card>
  );
};

export default Supplies;
