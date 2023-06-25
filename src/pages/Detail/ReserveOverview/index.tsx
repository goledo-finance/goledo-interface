import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import Card from '@components/Card';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import tokensIcon from '@assets/tokens';
import { type Token } from '../index';
import './index.css';

const Hundred = Unit.fromMinUnit(100);

const ReserveOverview: React.FC<Token> = ({
  name,
  symbol,
  decimals,
  supplyAPY,
  borrowAPY,
  totalMarketBorrowBalance,
  totalMarketBorrowPrice,
  availableBalance,
  availablePrice,
  maxLTV,
  liquidationThreshold,
  liquidationPenalty,
  canBeCollateral,
}) => {
  const borrowedPercent =
    availableBalance && totalMarketBorrowBalance ? Number(totalMarketBorrowBalance.div(availableBalance).mul(Hundred).toDecimalMinUnit(2)) : 100;

  return (
    <Card title="Reserve Overview" className="w-64% flex-auto lt-lg:w-full">
      <div className="mt-34px flex justify-between lt-md:flex-col lt-md:mt-20px">
        <div className="flex lt-md:items-center lt-md:mb-18px">
          <div
            className="ml-32px mr-54px lt-xl:ml-6px lt-xl:mr-28px flex justify-center items-center w-120px h-120px lt-xl:w-100px lt-xl:h-100px lt-md:w-52px lt-md:h-52px lt-md:mx-0 rounded-full"
            style={{ background: `conic-gradient(#FE6060 0, #FE6060 ${100 - borrowedPercent}%, #3AC170 ${100 - borrowedPercent}%, #3AC170)` }}
          >
            <img
              className="w-100px h-100px lt-xl:w-82px lt-xl:h-82px lt-md:w-40px lt-md:h-40px rounded-full border-2px border-white bg-white"
              src={tokensIcon[symbol]}
              alt={symbol}
            />
          </div>
          <div className="md:display-none ml-8px">
            <p className="text-16px text-#303549 font-semibold">{name || 'Unset'}</p>
            <p className="text-12px text-#62677B">{symbol}</p>
          </div>
        </div>

        <div className="flex-auto flex flex-col gap-14px text-14px text-#303549 font-semibold">
          <div className="flex justify-between items-center">
            <span>Total Borrowed</span>
            <span>
              <span><BalanceText balance={totalMarketBorrowBalance} decimals={decimals} /></span>
              <span className="text-#62677B">(<BalanceText balance={totalMarketBorrowPrice} abbrDecimals={2} symbolPrefix="$" />)</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Available Liquidity</span>
            <span>
              <span><BalanceText balance={availableBalance} decimals={decimals} /></span>
              <span className="text-#62677B">(<BalanceText balance={availablePrice} abbrDecimals={2} symbolPrefix="$" />)</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Maximum LTV</span>
            <span><PercentageText value={maxLTV} /></span>
          </div>

          <div className="flex justify-between items-center">
            <span>Liquidation Threshold</span>
            <span><PercentageText value={liquidationThreshold} /></span>
          </div>

          <div className="flex justify-between items-center">
            <span>Liquidation Penalty</span>
            <span><PercentageText value={liquidationPenalty} /></span>
          </div>

          <div className="flex justify-between items-center">
            <span>Use as Collateral</span>
            <span className="text-#3AC170 font-normal">
              {canBeCollateral ? (
                <>
                  <span className="i-charm:circle-tick text-18px mr-6px translate-y-[-1px]" />
                  Can be collateral
                </>
              ) : canBeCollateral === false ? (
                <>
                  <span className="i-charm:circle-cross text-18px mr-6px translate-y-[-1px]" />
                  Can't be collateral
                </>
              ) : (
                '--'
              )}
            </span>
          </div>

          <div className="apyBox-wrapper t-8px flex gap-18px overflow-hidden">
            <div className="apyBox flex-auto rounded-8px bg-#F8F8F8 overflow-hidden">
              <div className="p-14px border-b-1px border-#EAEBEF">Deposits</div>
              <div className="flex flex-wrap justify-between items-center p-14px pb-24px">
                <span className="text-#62677B font-normal">Deposit APY</span>
                <span><PercentageText value={supplyAPY} /></span>
              </div>
            </div>

            <div className="apyBox flex-auto rounded-8px bg-#F8F8F8 overflow-hidden">
              <div className="p-14px border-b-1px border-#EAEBEF">Variable Borrowing</div>
              <div className="flex flex-wrap justify-between items-center p-14px pb-24px">
                <span className="text-#62677B font-normal">Borrow APY</span>
                <span><PercentageText value={borrowAPY} /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReserveOverview;
