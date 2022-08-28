
import React from 'react';
import { useGoledoLockeds } from '@store/index';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import Goledo from '@assets/tokens/goledo.svg';

type Locked = NonNullable<ReturnType<typeof useGoledoLockeds>>[number];

const columns: Columns<Locked> = [{
  name: 'Locked',
  width: '50%',
  render: ({ balance }) => (
    <div className='flex items-center'>
      <img className="w-18px h-18px mr-4px" src={Goledo} alt="Goledo" />
      {balance?.toDecimalStandardUnit(2)} Goledo
    </div>
  )
}, {
  name: 'Expiry',
  width: '50%',
  render: ({ unlockTime }) => <div>{new Date(unlockTime).toLocaleString()}</div>
}];

const GoledoLocks: React.FC = () => {
  const lockeds = useGoledoLockeds();
  
  return (
    <Card title="Goledo Lock">
      <Table
        className='mt-16px'
        columns={columns}
        data={lockeds}
        cellClassName='h-36px flex justify-center items-center border-b-1px border-#EAEBEF'
      />
      <p className='mt-10px'>Total Goledo Locked</p>
    </Card>
  );
};

export default GoledoLocks;
