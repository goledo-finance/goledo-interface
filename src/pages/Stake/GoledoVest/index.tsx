import React, { useMemo } from 'react';
import { useGoledoVestings } from '@store/index';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
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

const configs: Configs<Vesting> = [{
  name: 'Vesting',
  renderContent: columns[0].render,
}, {
  name: 'Expiry',
  renderContent: columns[1].render,
}];

const GoledoVest: React.FC = () => {
  const vestings = useGoledoVestings();
  const tokenAssetsLockeds = useMemo(() => vestings?.map(balance => ({ ...balance, name: 'Goledo', symbol: 'GOL', decimals: 18 })), [vestings]);

  return (
    <Card title="Goledo Vest" id='stake-godedo-vest-card'>
      <Table
        className='mt-16px'
        columns={columns}
        data={vestings}
        cellClassName='h-36px flex justify-center items-center border-b-1px border-#EAEBEF'
      />
      <TokenAssets
        className='mt-16px'
        configs={configs}
        data={tokenAssetsLockeds}
      />
      <p className='mt-10px'>Total Goledo Vesting</p>
    </Card>
  );
};

export default GoledoVest;
