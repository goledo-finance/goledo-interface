
import React, { useMemo } from 'react';
import { useGoledoLockeds } from '@store/index';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import BalanceText from '@modules/BalanceText';
import Goledo from '@assets/tokens/goledo.svg';

type Locked = NonNullable<ReturnType<typeof useGoledoLockeds>>[number];

const columns: Columns<Locked> = [{
  name: 'Locked',
  width: '50%',
  render: ({ balance }) => (
    <div className='flex items-center'>
      <img className="w-18px h-18px mr-4px" src={Goledo} alt="Goledo" />
      <BalanceText balance={balance} symbol="Goledo" id='stake-goledo-lock-locked' />
    </div>
  )
}, {
  name: 'Expiry',
  width: '50%',
  render: ({ unlockTime }) => <div id='stake-goledo-lock-expiry'>{new Date(unlockTime).toLocaleString()}</div>
}];

const configs: Configs<Locked> = [{
  name: 'Locked',
  renderContent: columns[0].render,
}, {
  name: 'Expiry',
  renderContent: columns[1].render,
}];


const GoledoLocks: React.FC = () => {
  const lockeds = useGoledoLockeds();
  const tokenAssetsLockeds = useMemo(() => lockeds?.map(balance => ({ ...balance, name: 'Goledo', symbol: 'GOL', decimals: 18 })), [lockeds]);

  return (
    <Card title="Goledo Lock" id='stake-goledo-lock-card'>
      <Table
        className='mt-16px'
        columns={columns}
        data={lockeds}
        cellClassName='h-36px flex justify-center items-center border-b-1px border-#EAEBEF'
      />
      <TokenAssets
        className='mt-16px'
        configs={configs}
        data={tokenAssetsLockeds}
      />
      <p className='mt-10px'>Total Goledo Locked</p>
    </Card>
  );
};

export default GoledoLocks;
