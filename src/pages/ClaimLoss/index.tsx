import React, { useState, useCallback } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import PageWrapper from '@modules/Layout/PageWrapper';
import AuthConnectPage from '@modules/AuthConnectPage';
import useIsAuthed from '@hooks/useIsAuthed';
import { useCFXAmount, useUSDTAmount } from '@store/Refund';
import BalanceText from '@modules/BalanceText';
import Button from '@components/Button';
import tokensIcon from '@assets/tokens';
import useTransaction from '@hooks/useTransaction';
import { sendTransaction } from '@store/wallet';
import { RefundContract } from '@utils/contracts';
import './index.css';

const handleClaim = async () => {
  try {
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_RefundAddress,
      data: RefundContract.interface.encodeFunctionData('claim', []),
    });
    return TxnHash;
  } catch (err) {
    console.log('handleBorrow Error', err);
    throw err;
  }
};

const zero = Unit.fromMinUnit(0);
const ClaimLoss: React.FC = () => {
  const isAuthed = useIsAuthed();
  const cfxAmount = useCFXAmount();
  const usdtAmount = useUSDTAmount();
  const { status: transactionStatus, sendTransaction } = useTransaction(handleClaim);
  const canCliam = (cfxAmount && Unit.greaterThan(cfxAmount, zero)) || (usdtAmount && Unit.greaterThan(usdtAmount, zero));

  return (
    <>
      <PageWrapper className="pt-[120px]">
        <div className="mx-auto mb-[8px] flex items-center px-[16px] w-[576px] h-[68px] lt-md:w-[95%] lt-md:h-[56px] bg-white rounded-[6px] text-left text-[16px] text-[#111] font-600">
          Claim your losses
        </div>
        {!isAuthed && (
          <AuthConnectPage
            className="relative mx-auto !w-[576px] !lt-md:w-[95%]"
            childrenPrefix={
              <div className="absolute top-32px left-24px right-24px text-left text-[16px] text-[#111] leading-[24px]">
                This is a reimbursement for users who lost assets in this attack, as follows 🔗
                <a target="_blank" rel="noopener noreferrer" href="https://forms.gle/MuA6YyiXwdXAAjBR9" className="ml-[4px] text-[16px] text-[#111] font-600">
                  &nbsp;:&nbsp;https://forms.gle/MuA6YyiXwdXAAjBR9
                </a>
              </div>
            }
          >
            {(action) => <p className="text-14px text-#62677B">{action} to see your loss.</p>}
          </AuthConnectPage>
        )}
        {isAuthed && (
          <div className="mx-auto px-[16px] py-[32px] w-[576px] lt-md:w-[95%] bg-white rounded-[6px] text-left">
            <div className="text-[16px] text-[#111] leading-[24px]">
              This is a reimbursement for users who lost assets in this attack, as follows 🔗
              <a target="_blank" rel="noopener noreferrer" href="https://forms.gle/MuA6YyiXwdXAAjBR9" className="ml-[4px] text-[16px] text-[#111] font-600">
                &nbsp;:&nbsp;https://forms.gle/MuA6YyiXwdXAAjBR9
              </a>
            </div>

            <div className="text-[16px] leading-[24p] text-[#111] font-600 mt-[40px] mb-[24px]">Claimable</div>
            <div className="w-full h-full flex justify-start items-center">
              <img className="w-24px h-24px mr-8px rounded-full" src={tokensIcon.CFX} alt={'CFX'} />
              CFX
              <BalanceText className="ml-auto" balance={cfxAmount} decimals={18} />
            </div>
            <div className="mt-[16px] mb-[170px] lt-md:mb-120px w-full h-full flex justify-start items-center">
              <img className="w-24px h-24px mr-8px rounded-full" src={tokensIcon.USDT} alt={'CFX'} />
              USDT
              <BalanceText className="ml-auto" balance={usdtAmount} decimals={18} />
            </div>

            <Button className="mx-auto !flex w-154px rounded-100px" color="green" loading={transactionStatus === 'sending'} disabled={!canCliam} onClick={sendTransaction}>
              Claim
            </Button>

            <div className="mt-[16px] mb-[80px] lt-md:mb-0 text-center text-16px leading-24px text-[#111]">
              No reimbursement or have questions?
              <br />
              Contact : goledofc@gmail.com
            </div>
          </div>
        )}
      </PageWrapper>
    </>
  );
};

export default ClaimLoss;
