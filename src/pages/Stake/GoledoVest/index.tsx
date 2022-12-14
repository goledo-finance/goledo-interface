import React from 'react';
import { useGoledoVestings } from '@store/index';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import BalanceText from '@modules/BalanceText';
import Goledo from '@assets/tokens/goledo.svg';

type Vesting = NonNullable<ReturnType<typeof useGoledoVestings>>[number];

const columns: Columns<Vesting> = [{
  name: 'Vesting',
  width: '50%',
  render: ({ balance }) => (
    <div className='flex items-center'>
      <img className="w-18px h-18px mr-4px" src={Goledo} alt="Goledo" />
      <BalanceText balance={balance} symbol="Goledo" id='stake-goledo-vest-vesting' />
    </div>
  )
}, {
  name: 'Expiry',
  width: '50%',
  render: ({ unlockTime }) => <div id='stake-goledo-vest-expiry'>{new Date(unlockTime).toLocaleString()}</div>
}];

const GoledoVest: React.FC = () => {
  const vestings = useGoledoVestings();

  return (
    <Card title="Goledo Vest" id='stake-godedo-vest-card'>
      <Table
        className='mt-16px'
        columns={columns}
        data={vestings}
        cellClassName='h-36px flex justify-center items-center border-b-1px border-#EAEBEF'
      />
      <p className='mt-10px'>Total Goledo Vesting</p>
    </Card>
  );
};

export default GoledoVest;
