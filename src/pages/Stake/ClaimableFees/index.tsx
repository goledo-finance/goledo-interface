import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import tokensIcon from '@assets/tokens';
import { useClaimableFees, useClaimableFeesV1, useGoledoUsdPrice, type TokensStore } from '@store/index';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import handleClaimRewardsFees from '@service/handleClaimRewardsFees';

const Zero = Unit.fromMinUnit(0);

const columns: Columns<NonNullable<TokensStore['claimableFees']>[number]> = [
  {
    name: 'Assets',
    width: '22%',
    renderHeader: () => <div className="w-full h-full flex justify-start pl-4px">Assets</div>,
    render: ({ symbol }) => (
      <div className="w-full h-full flex justify-start items-center pl-4px font-semibold">
        <img className="w-24px h-24px mr-8px" src={tokensIcon[symbol]} alt={symbol} />
        {symbol}
      </div>
    ),
  },
  {
    name: 'Balance',
    width: '39%',
    render: ({ balance, decimals, symbol }) => (
      <BalanceText className="font-semibold" balance={balance} decimals={decimals} id={`stake-claimablefees-balance-${symbol}`} />
    ),
  },
  {
    name: 'Value',
    width: '39%',
    render: ({ price, symbol }) => <BalanceText className="font-semibold" balance={price} symbolPrefix="$" id={`stake-claimablefees-price-${symbol}`} />,
  },
];

const configs: Configs<NonNullable<TokensStore['claimableFees']>[number]> = [
  {
    name: 'Balance',
    renderContent: columns[1].render,
  },
  {
    name: 'Value',
    renderContent: columns[2].render,
  },
];

const ClaimableFees: React.FC<{ version: 'V1' | 'V2' }> = ({ version }) => {
  const claimableFees = (version === 'V1' ? useClaimableFeesV1 : useClaimableFees)();
  const goledoUsdPrice = useGoledoUsdPrice();
  const data =
    version === 'V1'
      ? claimableFees?.slice(1).map((item) => ({ ...item, price: item.symbol === 'GOL' ? goledoUsdPrice?.mul(item.balance)! : item.price }))
      : claimableFees?.map((item) => ({ ...item, price: item.symbol === 'GOL' ? goledoUsdPrice?.mul(item.balance)! : item.price }));
  const totalClaimablePrice = data?.reduce((acc, item) => acc.add(item.price ?? Zero), Zero);

  if (version === 'V1' && (!totalClaimablePrice || totalClaimablePrice.equalsWith(Zero))) return null;
  return (
    <Card title={version === 'V1' ? 'Claimable Fees in v1 Contract' : 'Claimable Fees'} id={`stake-claimable-fees-card-${version}`}>
      <Table className="mt-16px" columns={columns} data={data} />
      <TokenAssets className="mt-16px" configs={configs} data={data} />
      <p className="mt-10px mb-12px">
        Total Claimable Value:
        <BalanceText className="ml-4px" balance={totalClaimablePrice} symbolPrefix="$" decimals={18} />
      </p>
      <Button
        id="stake-claim-all-btn"
        fullWidth
        size="large"
        loading={!claimableFees || !goledoUsdPrice}
        disabled={!totalClaimablePrice || totalClaimablePrice.equalsWith(Zero)}
        onClick={() => handleClaimRewardsFees(version)}
      >
        Claim All
      </Button>
    </Card>
  );
};

export default ClaimableFees;
