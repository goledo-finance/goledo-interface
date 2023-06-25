import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import cx from 'clsx';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import Button from '@components/Button';
import ToolTip from '@components/Tooltip';
import BalanceText from '@modules/BalanceText';
import PercentageText from '@modules/PercentageText';
import tokensIcon from '@assets/tokens';
import { type Token } from '../index';

const Zero = Unit.fromMinUnit(0);

const SummaryPanelItem: React.FC<{ iconUrl?: string; iconName?: string; title: string; titleTip?: string; children: React.ReactNode; className?: string; }> = ({
  className,
  iconUrl,
  iconName,
  title,
  titleTip,
  children,
}) => {
  return (
    <div className={cx("flex items-center gap-12px lt-sm:w-50% lt-sm:justify-center", className)}>
      {iconUrl &&
        <img
          className='flex items-center justify-center h-40px w-40px rounded-full translate-y-[-1.5px]'
          src={iconUrl}
          alt={'token icon'}
        />
      }
      {iconName &&
        <div className="lt-lg:display-none flex items-center justify-center h-42px w-42px bg-#393D4F border border-#787A82 rounded-12px">
          <span className={cx('text-24px text-#A6A8B5', iconName)} />
        </div>
      }
      <div className='lt-sm:text-center'>
        <p className="flex items-center text-14px lt-sm:text-12px text-#ccc whitespace-nowrap">
          {title}
          {titleTip &&
            <ToolTip text={titleTip}>
              <span className="i-bi:info-circle ml-4px cursor-pointer" />
            </ToolTip>
          }
        </p>
        {children}
      </div>
    </div>
  );
};


const SummaryPanel: React.FC<Token> = ({
  name,
  symbol,
  decimals,
  usdPrice,
  totalMarketSupplyBalance,
  totalMarketSupplyPrice,
  totalMarketBorrowBalance,
  availableBalance,
  availablePrice
}) => {
  const navigate = useNavigate();

  const utilizationRate = useMemo(
    () => (totalMarketSupplyBalance && totalMarketBorrowBalance ? (totalMarketSupplyBalance.equalsWith(Zero) ? Zero : totalMarketBorrowBalance.div(totalMarketSupplyBalance)) : undefined),
    [totalMarketSupplyBalance, totalMarketBorrowBalance]
  );

  return (
    <>
      <div className='flex items-center gap-16px lt-md:justify-center lt-md:flex-col lt-md:items-start lt-md:gap-8px'>
        <Button
          id='detail-summary-panel-go-back-btn'
          variant='outlined'
          color='white'
          onClick={() => navigate(-1)}
          className="pl-12px lt-md:h-28px lt-md:text-12px lt-md:pl-4px lt-md:pr-12px"
          startIcon={<span className='i-bi:arrow-left-short text-28px' />}
        >
          Go Back
        </Button>

        <p className='text-36px text-#F1F1F3 font-semibold lt-md:text-32px lt-md:leading-30px lt-md:self-center'>Overview</p>
      </div>

      <div className="mt-16px flex w-full gap-16px lt-md:justify-center lt-sm:flex-wrap lt-sm:gap-0 lt-sm:gap-y-12px">
        <SummaryPanelItem iconUrl={tokensIcon[symbol]} title={symbol} className="lt-md:display-none min-w-208px lt-lg:min-w-180px">
          <p className="text-20px lt-sm:text-16px text-#F1F1F3 font-bold whitespace-nowrap">
            {name || 'Unset'}
          </p>
        </SummaryPanelItem>

        <SummaryPanelItem iconName="i-bx:cube" title="Total Amount" className="w-208px lt-lg:w-160px">
          <p className="text-20px lt-sm:text-16px text-#F1F1F3 font-bold">
            <BalanceText balance={totalMarketSupplyBalance} decimals={decimals} />
          </p>
          <p className="text-14px lt-sm:text-12px text-#ccc">
            <BalanceText balance={totalMarketSupplyPrice} abbrDecimals={2} symbolPrefix="$" />
          </p>
        </SummaryPanelItem>

        <SummaryPanelItem iconName="i-icon-park-outline:chart-pie" title="Available Liquidity" className="w-208px lt-lg:w-160px">
          <p className="text-20px lt-sm:text-16px text-#F1F1F3 font-bold">
            <BalanceText balance={availableBalance} decimals={decimals} />
          </p>
          <p className="text-14px lt-sm:text-12px text-#ccc">
            <BalanceText balance={availablePrice} abbrDecimals={2} symbolPrefix="$" />
          </p>
        </SummaryPanelItem>

        <SummaryPanelItem iconName="i-ph:chart-line-up" title="Utilization Rate" className="w-168px lt-lg:w-128px">
          <p className="text-20px lt-sm:text-16px text-#F1F1F3 font-bold">
            <PercentageText value={utilizationRate} />
          </p>
        </SummaryPanelItem>

        <SummaryPanelItem iconName="i-ant-design:dollar-circle-outlined" title="Oracle Price" className="w-168px lt-lg:w-128px">
          <p className="text-20px lt-sm:text-16px text-#F1F1F3 font-bold">
            <BalanceText balance={usdPrice?.mul(Unit.fromMinUnit(10e17))} abbrDecimals={2} symbolPrefix="$" />
          </p>
        </SummaryPanelItem>
      </div>
    </>
  );
};

export default SummaryPanel;
