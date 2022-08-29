import React from 'react';
import Card from '@components/Card';
import Button from '@components/Button';
import { type Token } from '../index';

const Operate: React.FC = () => {
  return (
    <div className="flex items-center gap-8px">
      <Button size="small" className='w-80px'>Supply</Button>
      <Button size="small" variant="outlined" className='w-80px'>
        Withdraw
      </Button>
    </div>
  );
};

const Supplies: React.FC<Token> = ({ symbol, balance, supplyBalance }) => {
  return (
    <Card title="Supplies" className="flex-auto flex flex-col gap-12px" titleRight={<Operate />}>
      <div className="mt-4px flex justify-between text-14px text-#303549">
        <span>Your wallet balance</span>
        <span className='font-semibold'>
          {balance?.toDecimalStandardUnit(2) ?? '--'}
          <span className='text-#62677B font-normal'> {symbol}</span>
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>You already deposited</span>
        <span className='font-semibold'>
          {supplyBalance?.toDecimalStandardUnit(2) ?? '--'}
          <span className='text-#62677B font-normal'> {symbol}</span>
        </span>
      </div>

      <div className="flex justify-between text-14px text-#303549">
        <span>Use as coliateral</span>
      </div>
    </Card>
  );
};

export default Supplies;
