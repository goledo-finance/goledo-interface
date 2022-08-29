import React from 'react';
import { useUserData } from '@store/index';
import Card from '@components/Card';
import Button from '@components/Button';
import { type Token } from '../index';

const Operate: React.FC = () => {
  return (
    <div className="flex items-center gap-8px">
      <Button size="small" className='w-80px'>Borrow</Button>
      <Button size="small" variant="outlined" className='w-80px'>
        Repay
      </Button>
    </div>
  );
};

const Borrows: React.FC<Token> = ({ symbol, borrowBalance, availableBorrowBalance }) => {
  const userData = useUserData();

  return (
    <Card title="Supplies" className="flex-auto flex flex-col gap-12px" titleRight={<Operate />}>
      <div className="mt-4px flex justify-between text-14px text-#303549">
        <span>Borrowed</span>
        <span className='font-semibold'>
          {borrowBalance?.toDecimalStandardUnit(2) ?? '--'}
          <span className='text-#62677B font-normal'> {symbol}</span>
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>Health Factor</span>
        <span className='text-#F89F1A font-semibold'>
          {userData?.healthFactor ?? '--'}
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>Loan to Value</span>
        <span className='font-semibold'>
          {userData?.loanToValue ?? '--'}
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>Available to borrow</span>
        <span className='font-semibold'>
          {availableBorrowBalance?.toDecimalStandardUnit(2) ?? '--'}
          <span className='text-#62677B font-normal'> {symbol}</span>
        </span>
      </div>
    </Card>
  );
};

export default Borrows;
