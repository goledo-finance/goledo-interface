import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { showModal, hideAllModal } from '@components/showPopup/Modal';
import HealthFactor from '@modules/HealthFactor';
import { useHealthFactorColor } from '@modules/HealthFactor';
import { useUserData } from '@store/Tokens';
import { useTokens } from '@store/Tokens';

const colorBgDic: { [key: string]: string } = {
  '#3AC170': 'bg-green-100',
  '#FE6060': 'bg-red-100',
  '#F89F1A': 'bg-yellow-100'
}
const Zero = Unit.fromMinUnit(0);
const Red = Unit.fromMinUnit(0.85);
const Yellow = Unit.fromMinUnit(0.5);

const useLtvColor = (maxLTV?: Unit, ltv?: string) => {
  maxLTV = maxLTV ?? Zero;
  let ltvUnit = Unit.fromMinUnit(ltv ?? 0);
  let value = ltvUnit.div(maxLTV);
  let color = '#3AC170';
  if (value.greaterThanOrEqualTo(Red)) {
    color = '#FE6060';
  } else if (value.greaterThanOrEqualTo(Yellow)) {
    color = '#F89F1A';
  }
  return color;
}

const ModalContent: React.FC = () => {
  const userData = useUserData();
  const userTokens = useTokens();

  const MaxLTV = useMemo(
    () => {
      let numerator = userTokens?.reduce((pre, token) => {
        let item = token.borrowPrice?.mul(Unit.fromMinUnit(token.maxLTV ?? 0));
        return pre.add(item ?? Zero);
      }, Zero);
      let demoniator = userTokens?.reduce((pre, token) => {
        return pre ? pre.add(token.borrowPrice ?? Zero) : Zero
      }, Zero)
      if (!demoniator) { return Zero }
      if (demoniator?.equals(Zero)) { return Zero }
      return numerator?.div(demoniator);
    }
    ,
    [userTokens]
  )

  const healthColor = useHealthFactorColor(userData?.healthFactor);
  const ltvColor = useLtvColor(MaxLTV, userData?.loanToValue);

  return (
    <div className='text-sm'>
      <p className='my-6'>Your health factor an loan to value determine the assurance of your collateral. To avoid liquidations you can supply more collateral or repay borrow positions.</p>
      <div className='flex flex-row items-center mb-6'>
        <div className='flex flex-col max-w-xs mr-auto'>
          <p className='font-semibold mb-1'>Health Factor</p>
          <p className='text-xs'>Safety of your deposited collateral against the borrow assets and its underlying value. If the health factor goes below 1, the liquidation of your collateral might be triggered.</p>
        </div>
        <div className={`w-[84px] h-[84px] min-w-[84px] rounded-full border-solid border flex justify-center items-center ${colorBgDic[healthColor]} ml-1`} style={{ borderColor: healthColor }}>
          <HealthFactor value={userData?.healthFactor} />
        </div>
      </div>
      <div className='flex flex-row items-center'>
        <div className='flex flex-col max-w-xs mr-auto'>
          <p className='font-semibold mb-1'>Current LTV</p>
          <p className='text-xs'>Your current loan to value based on your collateral supplied. If your loan to value goes above the liquidation threshold your collateral supplied may be liquidated.</p>
        </div>
        <div className={`w-[84px] h-84px min-w-[84px] rounded-full border-solid border flex justify-center items-center ${colorBgDic[ltvColor]} ml-1`} style={{ borderColor: ltvColor }}>
          <span className={`text-${ltvColor}`}>{userData?.loanToValue ?? 0}%</span>
        </div>
      </div>
    </div>
  )
}

const showRiskDetails = () => {
  showModal({ Content: <ModalContent />, title: 'Liquidation Risk Parametres' })
}

export default showRiskDetails;