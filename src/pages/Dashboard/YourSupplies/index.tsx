import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, useCurUserSupplyAPY, useCurUserSupplyPrice, type TokenInfo } from '@store/index';
import tokensIcon from '@assets/tokens';
import Card from '@components/Card';
import Table, { type Columns } from '@components/Table';
import Toggle from '@components/Toggle';
import ToolTip from '@components/Tooltip';
import TokenAssets, { type Configs } from '@modules/TokenAssets';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import showWithdrawModal from '@service/handleWithdraw';
import showCollateralChangeModal from '@service/handleCollateralChange';

const Zero = Unit.fromMinUnit(0);

const columns: Columns<TokenInfo> = [
  {
    name: 'Assets',
    width: '13%',
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
    width: '24%',
    render: ({ supplyBalance, supplyPrice, decimals, symbol }) => (
      <div>
        <p className="font-semibold">
          <BalanceText balance={supplyBalance} decimals={decimals} id={`dashboard-your-supplies-supply-balance-${symbol}`} />
        </p>
        <p className="text-12px text-#62677B">
          <BalanceText balance={supplyPrice} abbrDecimals={2} symbolPrefix="$" id={`dashboard-your-supplies-supply-price-${symbol}`} />
        </p>
      </div>
    ),
  },
  {
    name: 'APY',
    width: '18%',
    render: ({ supplyAPY, symbol }) => (
      <div className="font-semibold">
        <PercentageText value={supplyAPY} id={`dashboard-your-supplies-supply-apy-${symbol}`} />
      </div>
    ),
  },
  {
    name: 'Collateral',
    width: '17%',
    renderHeader: () => (
      <div className="flex justify-center items-center">
        Collateral
        <ToolTip text="Allows you to decide whether to use a supplied asset as collateral. An asset used as collateral will affect your borrowing power and health factor.">
          <span className="i-bi:info-circle ml-4px cursor-pointer" />
        </ToolTip>
      </div>
    ),
    render: ({ collateral, canBeCollateral, address, symbol }) => (
      <div className="flex items-center">
        <Toggle id={`dashboard-your-supplies-toggle-${symbol}`} checked={collateral && canBeCollateral} disabled={!canBeCollateral} onClick={() => showCollateralChangeModal({ address, symbol })} />
      </div>
    ),
  },
  {
    name: '',
    width: '28%',
    render: ({ address, symbol, supplyBalance }) => (
      <div className="w-full h-full flex justify-end items-center">
        <Button
          id={`dashboard-your-supplies-withdraw-btn-${symbol}`}
          size="small"
          fullWidth
          className="max-w-164px lt-md:max-w-none"
          loading={!supplyBalance}
          disabled={supplyBalance?.equalsWith(Zero)}
          onClick={() => showWithdrawModal({ address, symbol })}
        >
          Withdraw
        </Button>
      </div>
    ),
  },
];

const configs: Configs<TokenInfo> = [
  {
    name: 'Supply Balance',
    renderContent: columns[1].render,
  },
  {
    name: 'Supply APY',
    renderContent: columns[2].render,
  },
  {
    name: 'Used as collateral',
    renderContent: columns[3].render,
  },
  {
    render: columns[4].render,
  },
];

const YourSupplies: React.FC = () => {
  const tokens = useTokens();
  const curUserSupplyTokens = useMemo(
    () => tokens?.filter((token) => token.supplyBalance?.greaterThan(Unit.fromStandardUnit('0.0001', token.decimals))),
    [tokens]
  );
  const curUserSupplyPrice = useCurUserSupplyPrice();
  const curUserSupplyAPY = useCurUserSupplyAPY();
  const totalCollateralPrice = useMemo(
    () =>
      !curUserSupplyTokens?.length
        ? undefined
        : curUserSupplyTokens.filter((token) => token.collateral).reduce((pre, cur) => pre.add(cur.supplyPrice ?? Zero), Zero),
    [curUserSupplyTokens]
  );

  return (
    <Card title="Your Supplies" showHideButton="no-pb" className="w-50% lt-2xl:w-full" id='dashboard-your-supplies-card'>
      {!curUserSupplyTokens?.length && <p className="mt-40px mb-24px text-center">No Supplies</p>}
      {curUserSupplyTokens?.length ? (
        <>
          <div className="mt-16px flex gap-8px flex-wrap">
            <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              Balance
              <span className="ml-6px text-#303549 font-semibold">
                <BalanceText balance={curUserSupplyPrice} abbrDecimals={2} symbolPrefix="$" id='dashboard-your-supplies-balance' />
              </span>
            </div>
            <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              APY
              <span className="ml-6px text-#303549 font-semibold">
                <PercentageText value={curUserSupplyAPY} id='dashboard-your-supplies-apy' />
              </span>
              <ToolTip text="The weighted average of APY for all supplied assets, including incentives.">
                <span className="i-bi:info-circle ml-4px cursor-pointer" />
              </ToolTip>
            </div>
            <div className="inline-flex items-center px-6px py-2px rounded-4px border-1px border-#EAEBEF">
              Collateral
              <span className="ml-6px text-#303549 font-semibold">
                <BalanceText balance={totalCollateralPrice} abbrDecimals={2} symbolPrefix="$" id='dashboard-your-supplies-collateral-price' />
              </span>
              <ToolTip text="The total amount of your assets denominated in USD that can be used as collateral for borrowing assets.">
                <span className="i-bi:info-circle ml-4px cursor-pointer" />
              </ToolTip>
            </div>
          </div>
          <Table className="mt-20px" columns={columns} data={curUserSupplyTokens} />
          <TokenAssets className="mt-20px" configs={configs} data={curUserSupplyTokens} />
        </>
      ) : null}
    </Card>
  );
};

export default YourSupplies;
