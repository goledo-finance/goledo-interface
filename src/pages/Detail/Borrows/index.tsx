import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useUserData } from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import HealthFactor from '@modules/HealthFactor'
import showBorrowModal from '@service/handleBorrow';
import showRepayModal from '@service/handleRepay';
import { type Token } from '../index';

const Zero = Unit.fromMinUnit(0);

const Operate: React.FC<{ address: string; symbol: string; borrowBalance?: Unit; availableBorrowBalance?: Unit }> = ({
  address,
  symbol,
  borrowBalance,
  availableBorrowBalance,
}) => {
  return (
    <div className="flex items-center gap-8px">
      <Button
        id='detail-borrows-borrows-btn'
        size="small"
        className="w-80px"
        loading={!availableBorrowBalance}
        disabled={availableBorrowBalance?.equalsWith(Zero)}
        onClick={() => showBorrowModal({ address, symbol })}
      >
        Borrow
      </Button>
      <Button
        id='detail-borrows-repay-btn'
        size="small"
        variant="outlined"
        className="w-80px"
        loading={!borrowBalance}
        disabled={borrowBalance?.equalsWith(Zero)}
        onClick={() => showRepayModal({ address, symbol })}
      >
        Repay
      </Button>
    </div>
  );
};

const Borrows: React.FC<Token> = ({ address, symbol, decimals, borrowBalance, availableBorrowBalance }) => {
  const userData = useUserData();

  return (
    <Card
      title="Borrowed"
      className="flex-auto flex flex-col gap-12px"
      titleRight={<Operate address={address} symbol={symbol} borrowBalance={borrowBalance} availableBorrowBalance={availableBorrowBalance} />}
    >
      <div className="mt-4px flex justify-between text-14px text-#303549">
        <span>Borrowed</span>
        <span className="font-semibold">
          <BalanceText balance={borrowBalance} decimals={decimals} />
          <span className="text-#62677B font-normal"> {symbol}</span>
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>Health Factor</span>
        <span className="font-semibold"><HealthFactor value={userData?.healthFactor} /></span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>Loan to Value</span>
        <span className="font-semibold">{userData?.loanToValue ?? '--'}</span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>Available to Borrow</span>
        <span className="font-semibold">
          <BalanceText balance={availableBorrowBalance} decimals={decimals} />
          <span className="text-#62677B font-normal"> {symbol}</span>
        </span>
      </div>
    </Card>
  );
};

export default Borrows;
