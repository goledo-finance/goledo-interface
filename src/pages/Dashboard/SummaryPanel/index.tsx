import React, { useMemo } from 'react';
import cx from 'clsx';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import ConfluxEspaceMarket from '@modules/ConfluxEspaceMarket';
import Button from '@components/Button';
import ToolTip from '@components/Tooltip';
import { useCurUserSupplyPrice, useCurUserSupplyAPY, useCurUserBorrowPrice, useCurUserBorrowAPY, useUserData } from '@store/index';

const Zero = Unit.fromMinUnit(0);
const Hundred = Unit.fromMinUnit(100);

const SummaryPanelItem: React.FC<{ iconName: string; title: string; titleTip?: string; children: React.ReactNode }> = ({
  iconName,
  title,
  titleTip,
  children,
}) => {
  return (
    <div className="flex items-center gap-12px">
      <div className="lt-sm:display-none flex items-center justify-center h-42px w-42px bg-#393D4F border border-#787A82 rounded-12px">
        <span className={cx('text-24px text-#A6A8B5', iconName)} />
      </div>
      <div className=''>
        <p className="flex items-center text-14px lt-sm:text-12px text-#ccc whitespace-nowrap">
          {title}
          {titleTip && 
            <ToolTip text={titleTip}>
              <span className="i-bi:info-circle ml-4px cursor-pointer" />
            </ToolTip>
          }
        </p>
        <div className="text-22px lt-sm:text-18px text-#F1F1F3 font-bold">{children}</div>
      </div>
    </div>
  );
};

const SummaryPanel: React.FC = () => {
  const curUserSupplyPrice = useCurUserSupplyPrice();
  const curUserSupplyAPY = useCurUserSupplyAPY();
  const curUserBorrowPrice = useCurUserBorrowPrice();
  const curUserBorrowAPY = useCurUserBorrowAPY();
  const userData = useUserData();

  const NetWorth = useMemo(
    () => (curUserSupplyPrice && curUserBorrowPrice ? curUserSupplyPrice.sub(curUserBorrowPrice) : undefined),
    [curUserSupplyPrice, curUserBorrowPrice]
  );

  const NetAPY = useMemo(
    () =>
      curUserSupplyPrice?.equalsWith(Zero)
        ? Zero
        : curUserSupplyPrice && curUserSupplyAPY && curUserBorrowPrice && curUserBorrowAPY
        ? curUserSupplyPrice.mul(curUserSupplyAPY).sub(curUserBorrowPrice.mul(curUserBorrowAPY)).div(curUserSupplyPrice.sub(curUserBorrowPrice))
        : undefined,
    [curUserSupplyPrice, curUserSupplyAPY, curUserBorrowPrice, curUserBorrowAPY]
  );

  return (
    <ConfluxEspaceMarket>
      <div className="flex w-full xl:w-fit justify-center gap-56px lt-xl:mt-8px lt-sm:mt-24px lt-sm:gap-24px">
        <SummaryPanelItem iconName="i-iconoir:wallet" title="Net worth">
          ${NetWorth?.toDecimalStandardUnit(2)}
        </SummaryPanelItem>

        <SummaryPanelItem iconName="i-tabler:chart-bar" title="Net APY" titleTip='Net APY is the combined effect of all supply and borrow positions on net worth, including incentives. It is possible to have a negative net APY if debt APY is higher than supply APY.'>
          {NetAPY?.mul(Hundred).toDecimalMinUnit(2)}%
        </SummaryPanelItem>

        <SummaryPanelItem iconName="i-codicon:heart" title="Health Factor">
          <div className="flex items-center">
            <span className="text-#3AC170">
              {userData?.healthFactor ?? '--'}
            </span>
            <Button variant="outlined" size="mini" color="green" className="!rounded-6px ml-8px translate-y-1px">
              <span className='lt-sm:display-none'>RISK</span>
              <span> DETAILS</span>
            </Button>
          </div>
        </SummaryPanelItem>
      </div>
    </ConfluxEspaceMarket>
  );
};

export default SummaryPanel;
