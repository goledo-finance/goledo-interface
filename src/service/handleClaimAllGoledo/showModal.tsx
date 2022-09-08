import React, { useState, useEffect } from 'react';
import { type Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledoBalance, useGoledoStakedBalance, useGoledoVestingBalance, useGoledoWithdrawableBalance, useGoledoUsdPrice } from '@store/index';
import { showModal, hideAllModal } from '@components/showPopup/Modal';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import useTransaction from '@hooks/useTransaction';
import Success from '@assets/icons/success.svg';
import Error from '@assets/icons/error.svg';
import { handleClaimAllGoledo } from './index';

const ModalContent: React.FC = () => {
  const balance = useGoledoBalance();
  const stakedBalance = useGoledoStakedBalance();
  const vestingBalance = useGoledoVestingBalance();
  const withdrawableBalance = useGoledoWithdrawableBalance();
  const usdPrice = useGoledoUsdPrice();
  const { status: transactionStatus, scanUrl, error, sendTransaction } = useTransaction(handleClaimAllGoledo);

  const [balanceBefore, setBalanceBefore] = useState<Unit | undefined>(undefined);
  const [stakedBalanceBefore, setStakedBalanceBefore] = useState<Unit | undefined>(undefined);
  const [vestingBalanceBefore, setVestingBalanceBefore] = useState<Unit | undefined>(undefined);
  const [withdrawableBalanceBefore, setWithdrawableBalanceBefore] = useState<typeof withdrawableBalance | undefined>(undefined);
  useEffect(() => {
    if (transactionStatus === 'sending') {
      setBalanceBefore(balance);
      setStakedBalanceBefore(stakedBalance);
      setVestingBalanceBefore(vestingBalance);
      setWithdrawableBalanceBefore(withdrawableBalance);
    }
  }, [transactionStatus]);

  if (!balance || !stakedBalance || !vestingBalance || !withdrawableBalance) return null;

  const amount = (stakedBalanceBefore || stakedBalance).add(vestingBalanceBefore || vestingBalance);
  const claimable = (stakedBalanceBefore || stakedBalance).add(withdrawableBalanceBefore?.penaltyAmount || withdrawableBalance.penaltyAmount);
  return (
    <div className="relative">
      {transactionStatus !== 'success' && transactionStatus !== 'failed' && (
        <>
          <p className="mt-30px mb-4px text-14px text-#62677B">Transaction overview.</p>
          <div className="flex flex-col gap-16px p-12px rounded-4px border-1px border-#EAEBEF text-14px text-#303549">
            <div className="flex justify-between">
              <span>Amount</span>
              <div className="text-right">
                <BalanceText balance={amount} symbol="Goledo" />
                <p className="mt-2px text-12px text-#62677B">
                  <BalanceText balance={amount.mul(usdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Penalty</span>
              <div className="text-right">
                <BalanceText balance={withdrawableBalanceBefore?.penaltyAmount || withdrawableBalance.penaltyAmount} symbol="Goledo" />
                <p className="mt-2px text-12px text-#62677B">
                  <BalanceText
                    balance={(withdrawableBalanceBefore?.penaltyAmount || withdrawableBalance.penaltyAmount).mul(usdPrice!)}
                    abbrDecimals={2}
                    symbolPrefix="$"
                  />
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Actual claimable</span>
              <div className="text-right">
                <BalanceText balance={claimable} symbol="Goledo" decimals={18} />
                <p className="mt-2px text-12px text-#62677B">
                  <BalanceText balance={claimable.mul(usdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Your Goledo balance</span>
              <div className="text-right">
                <p>
                  <BalanceText balance={balanceBefore || balance} />
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-12px translate-y-[-1px]" />
                  <BalanceText balance={(balanceBefore || balance).add(claimable)} />
                </p>
                <p className="mt-2px text-12px text-#62677B">
                  <BalanceText balance={(balanceBefore || balance).mul(usdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-10px translate-y-[-1px]" />
                  <BalanceText balance={(balanceBefore || balance).add(claimable).mul(usdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                </p>
              </div>
            </div>
          </div>

          <Button
            fullWidth
            size="large"
            className="mt-48px"
            disabled={transactionStatus === 'sending'}
            loading={transactionStatus === 'sending' ? 'start' : undefined}
            onClick={sendTransaction}
          >
            {transactionStatus === 'waiting' && 'Claim Anyway'}
            {transactionStatus === 'sending' && 'Claiming All Goledo...'}
          </Button>
        </>
      )}
      {(transactionStatus === 'success' || transactionStatus === 'failed') && (
        <>
          <img src={transactionStatus === 'success' ? Success : Error} alt={transactionStatus} className="block w-48px h-48px mt-24px mx-auto" />
          <p className="mt-12px mb-8px text-20px text-#303549 text-center font-semibold">
            {transactionStatus === 'success' && 'All done!'}
            {transactionStatus === 'failed' && 'Transaction failed!'}
          </p>
          <p className="text-14px text-#303549 text-center">
            {transactionStatus === 'success' && (
              <>
                You claimed all of <BalanceText className="font-semibold" balance={claimable} symbol="Goledo" />
              </>
            )}
            {transactionStatus === 'failed' && error}
          </p>
          {scanUrl && (
            <a
              className="absolute bottom-50px right-0px text-12px text-#383515 no-underline hover:underline"
              href={scanUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Review tx details
              <span className="i-charm:link-external ml-3px text-10px translate-y-[-.5px]" />
            </a>
          )}
          <Button fullWidth size="large" className="mt-48px" onClick={hideAllModal}>
            OK
          </Button>
        </>
      )}
    </div>
  );
};

const showVestingGoledoModal = () => showModal({ Content: <ModalContent />, title: 'Claim All Goledo' });

export default showVestingGoledoModal;
