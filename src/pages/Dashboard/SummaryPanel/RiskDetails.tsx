import React from 'react';
import { showModal } from '@components/showPopup/Modal';
import HealthFactor from '@modules/HealthFactor';
import { useHealthFactorColor } from '@modules/HealthFactor';
import { useUserData } from '@store/Tokens';

const colorBgDic: { [key: string]: string } = {
  '#3AC170': 'bg-green-100',
  '#FE6060': 'bg-red-100',
  '#F89F1A': 'bg-yellow-100'
}

const ModalContent: React.FC = () => {
  const userData = useUserData();
  const healthColor = useHealthFactorColor(userData?.healthFactor);

  return (
    <div className='text-sm text-#303549'>
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
        <div className={`w-[84px] h-84px min-w-[84px] rounded-full border-solid border flex justify-center items-center ${colorBgDic[healthColor]} ml-1`} style={{ borderColor: healthColor }}>
          <span className={`text-${healthColor}`}>{userData?.loanToValue}</span>
        </div>
      </div>
    </div>
  )
}

const showRiskDetails = () => {
  showModal({ Content: <ModalContent />, title: 'Liquidation Risk Parametres' })
}

export default showRiskDetails;