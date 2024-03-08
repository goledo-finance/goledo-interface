import React from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, TokenInfo, useGoledoTokensAPR } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import ToolTip from '@components/Tooltip';
import Table, { type Columns } from '@components/Table';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import showBorrowModal from '@service/handleBorrow';

const Zero = Unit.fromMinUnit(0);

const columns: Columns<TokenInfo, { goledoTokensAPR: Record<string, Unit> | undefined }> = [
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
    name: 'Available',
    width: '24%',
    renderHeader: () => (
      <div className="flex justify-center items-center">
        Available
        <ToolTip text="This is the total amount available for you to borrow. You can borrow based on your collateral and until the borrow cap is reached.">
          <span className="i-bi:info-circle ml-4px cursor-pointer" />
        </ToolTip>
      </div>
    ),
    render: ({ availableBorrowBalance, decimals, symbol }) => (
      <div className="font-semibold">
        <BalanceText balance={availableBorrowBalance} decimals={decimals} id={`dashboard-assets-available-borrow-balance-${symbol}`} />
      </div>
    ),
  },
  // {
  //   name: 'Interest Rate',
  //   width: '18%',
  //   renderHeader: () => (
  //     <div className="flex justify-center items-center">
  //       Interest Rate
  //       <ToolTip text="Interest rate will fluctuate based on the market conditions. Recommended for short-term loans.">
  //         <span className="i-bi:info-circle ml-4px cursor-pointer" />
  //       </ToolTip>
  //     </div>
  //   ),
  //   render: ({ borrowAPY, symbol }) => (
  //     <div className="font-semibold">
  //       <PercentageText value={borrowAPY} id={`dashboard-assets-borrow-interest-rate-${symbol}`} />
  //     </div>
  //   ),
  // },
  // {
  //   name: 'GOL APR',
  //   width: '17%',
  //   render: ({ symbol, borrowTokenAddress }, { goledoTokensAPR } = { goledoTokensAPR: undefined }) => (
  //     <div className="font-semibold">
  //       <PercentageText className="font-semibold" id={`dashboard-assets-borrow-APR-${symbol}`} value={goledoTokensAPR?.[borrowTokenAddress]} />
  //     </div>
  //   ),
  // },
  {
    name: '',
    width: '28%',
    render: ({ address, symbol, availableBorrowBalance }) => (
      <div className="w-full h-full flex justify-end items-center gap-12px">
        <Button
          id="dashboard-assets-to-borrow-btn"
          size="small"
          className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none"
          loading={!availableBorrowBalance}
          disabled={availableBorrowBalance?.equalsWith(Zero)}
          onClick={() => showBorrowModal({ address, symbol })}
        >
          Borrow
        </Button>

        <Link to={`/detail/${address}`} className="max-w-76px w-50% !flex-shrink-1 lt-md:max-w-none no-underline" id="dashboard-assets-to-borrow-link">
          <Button size="small" variant="outlined" fullWidth>
            Details
          </Button>
        </Link>
      </div>
    ),
  },
];

const configs: Configs<TokenInfo, { goledoTokensAPR: Record<string, Unit> | undefined }> = [
  {
    name: 'Available to Borrow',
    renderContent: columns[1].render,
  },
  // {
  //   name: 'Borrow Interest Rate',
  //   renderContent: columns[2].render,
  // },
  // {
  //   name: 'Goledo APR',
  //   renderContent: columns[3].render,
  // },
  {
    render: columns[2].render,
  },
];

const AssetsToBorrow: React.FC = () => {
  const tokens = useTokens();
  const goledoTokensAPR = useGoledoTokensAPR();

  return (
    <Card title="Assets to Borrow" showHideButton="no-pb" className="w-50% lt-2xl:w-full">
      <Table className="mt-16px" columns={columns} data={tokens} otherData={{ goledoTokensAPR }} />
      <TokenAssets className="mt-16px" configs={configs} data={tokens} otherData={{ goledoTokensAPR }} />
    </Card>
  );
};

export default AssetsToBorrow;
