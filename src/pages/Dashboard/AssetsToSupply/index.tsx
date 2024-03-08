import React from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo, useGoledoTokensAPR, useIsInVestingLockTime } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import showSupplyModal from '@service/handleSupply';
import tokenIcons from '@assets/tokens';

const Zero = Unit.fromMinUnit(0);

const columns: Columns<TokenInfo, { isInVestingLockTime: boolean; goledoTokensAPR: Record<string, Unit> | undefined }> = [
  {
    name: 'Assets',
    width: '13%',
    renderHeader: () => <div className="w-full h-full flex justify-start pl-4px">Assets</div>,
    render: ({ symbol }) => (
      <div className="w-full h-full flex justify-start items-center pl-4px font-semibold">
        <img className="w-24px h-24px mr-8px rounded-full" src={tokensIcon[symbol]} alt={symbol} />
        {symbol}
      </div>
    ),
  },
  {
    name: 'Balance',
    width: '24%',
    render: ({ balance, decimals, symbol }) => (
      <div className="font-semibold">
        <BalanceText balance={balance} decimals={decimals} id={`dashboard-assets-available-supply-balance-${symbol}`} />
      </div>
    ),
  },
  // {
  //   name: 'Rewards',
  //   width: '18%',
  //   render: (
  //     { supplyAPY, symbol, supplyTokenAddress },
  //     { isInVestingLockTime, goledoTokensAPR } = { isInVestingLockTime: false, goledoTokensAPR: undefined }
  //   ) => (
  //     <div className="font-semibold">
  //       <PercentageText value={supplyAPY} id={`dashboard-assets-supply-apy-${symbol}`} />
  //       <div className="ml-8px mt-4px flex justify-center items-center px-4px py-2px rounded-4px border-1px border-#EAEBEF text-12px">
  //         <img className="w-14px h-14px" src={tokenIcons.GOL} alt="/" />
  //         <span className="text-#62677B mx-4px">APR</span>
  //         {isInVestingLockTime ? (
  //           <span className="font-semibold">Infinity%</span>
  //         ) : (
  //           <PercentageText className="font-semibold" value={goledoTokensAPR?.[supplyTokenAddress]} />
  //         )}
  //       </div>
  //     </div>
  //   ),
  // },
  {
    name: 'Can be collateral',
    width: '17%',
    render: ({ canBeCollateral, symbol }) => (
      <div className="flex items-center" id={`dashboard-assets-collateral-${symbol}`}>
        {canBeCollateral && <span className="i-charm:circle-tick text-18px text-#3AC170" />}
        {canBeCollateral === false && '--'}
      </div>
    ),
  },
  {
    name: '',
    width: '28%',
    render: ({ address, symbol, balance }) => (
      <div className="w-full h-full flex justify-end items-center gap-12px">
        <Button
          size="small"
          className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none"
          id={`dashboard-assets-to-supply-${symbol}-btn`}
          loading={!balance}
          disabled={balance?.equalsWith(Zero)}
          onClick={() => showSupplyModal({ address, symbol })}
        >
          Supply
        </Button>

        <Link
          to={`/detail/${address}`}
          className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none no-underline"
          id={`dashboard-assets-to-supply-${symbol}-link`}
        >
          <Button size="small" variant="outlined" fullWidth>
            Details
          </Button>
        </Link>
      </div>
    ),
  },
];

const configs: Configs<TokenInfo, { isInVestingLockTime: boolean; goledoTokensAPR: Record<string, Unit> | undefined }> = [
  {
    name: 'Supply Balance',
    renderContent: columns[1].render,
  },
  // {
  //   name: 'Supply Rewards',
  //   renderContent: columns[2].render,
  // },
  {
    name: 'Can be collateral',
    renderContent: columns[2].render,
  },
  {
    render: columns[3].render,
  },
];

const AssetsToSupply: React.FC = () => {
  const tokens = useTokens();
  const goledoTokensAPR = useGoledoTokensAPR();
  const isInVestingLockTime = useIsInVestingLockTime();

  return (
    <Card title="Assets to Supply" showHideButton="no-pb" className="w-50% lt-2xl:w-full">
      <Table className="mt-16px" columns={columns} data={tokens} otherData={{ isInVestingLockTime, goledoTokensAPR }} />
      <TokenAssets className="mt-16px" configs={configs} data={tokens} otherData={{ isInVestingLockTime, goledoTokensAPR }} />
    </Card>
  );
};

export default AssetsToSupply;
