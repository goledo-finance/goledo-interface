import React, { useState, useEffect } from 'react';
import { useLpEarnedGoledoBalance, useGoledoEarnedBalance, useTokens, useGoledoUsdPrice, useGoledoVestingBalance } from '@store/index';
import { showModal, hideAllModal } from '@components/showPopup/Modal';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import useTransaction from '@hooks/useTransaction';
import Success from '@assets/icons/success.svg';
import Error from '@assets/icons/error.svg';
import { handleVestingGoledo } from './index';

const ModalContent: React.FC<{ tokenAddress: string | 'lp' | 'all' }> = ({ tokenAddress }) => {
  const tokens = useTokens();
  const lpEarnedGoledoBalance = useLpEarnedGoledoBalance();
  const gledoEarnedBalance = useGoledoEarnedBalance();
  const goledoUsdPrice = useGoledoUsdPrice();
  const goledoVestingBalance = useGoledoVestingBalance();
  const amount =
    tokenAddress === 'lp'
      ? lpEarnedGoledoBalance
      : tokenAddress === 'all'
        ? gledoEarnedBalance
        : tokens?.find((token) => token.address === tokenAddress)?.earnedGoledoBalance;

  const { status: transactionStatus, scanUrl, error, sendTransaction } = useTransaction(handleVestingGoledo);

  const [vestingBalanceBefore, setVestingBalanceBefore] = useState<typeof amount | undefined>(undefined);
  const [vestingAmount, setVestingAmount] = useState<typeof amount | undefined>(undefined);
  useEffect(() => {
    if (transactionStatus === 'sending') {
      setVestingBalanceBefore(goledoVestingBalance);
      setVestingAmount(amount);
    }
  }, [transactionStatus]);

  const usedVestingBalance = vestingBalanceBefore || goledoVestingBalance;
  if (!goledoUsdPrice || !amount) return null;
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
                  <BalanceText balance={amount?.mul(goledoUsdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Vesting Goledo</span>
              <div className="text-right">
                <p>
                  <BalanceText balance={usedVestingBalance} />
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-12px translate-y-[-1px]" />
                  <BalanceText balance={usedVestingBalance?.add(vestingAmount || amount)} />
                </p>
                <p className="mt-2px text-12px text-#62677B">
                  <BalanceText balance={usedVestingBalance?.mul(goledoUsdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-10px translate-y-[-1px]" />
                  <BalanceText balance={usedVestingBalance?.add(vestingAmount || amount)?.mul(goledoUsdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                </p>
              </div>
            </div>
          </div>

          <Button
            id='handle-vesting-goledo'
            fullWidth
            size="large"
            className="mt-48px"
            disabled={transactionStatus === 'sending'}
            loading={transactionStatus === 'sending' ? 'start' : undefined}
            onClick={() => sendTransaction({ tokenAddress })}
          >
            {transactionStatus === 'waiting' && 'Vest'}
            {transactionStatus === 'sending' && 'Vesting Goledo...'}
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
                You are vesting <BalanceText className="font-semibold" balance={vestingAmount} symbol="Goledo" />
              </>
            )}
            {transactionStatus === 'failed' && error}
          </p>
          {scanUrl && (
            <a
              id='handle-vesting-goledo-reviewTx-link'
              className="absolute bottom-50px right-0px text-12px text-#383515 no-underline hover:underline"
              href={scanUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Review tx details
              <span className="i-charm:link-external ml-3px text-10px translate-y-[-.5px]" />
            </a>
          )}
          <Button id='handle-vesting-goledo-ok-btn' fullWidth size="large" className="mt-48px" onClick={hideAllModal}>
            OK
          </Button>
        </>
      )}
    </div>
  );
};

const showVestingGoledoModal = ({ tokenAddress }: { tokenAddress: string | 'lp' | 'all' }) =>
  showModal({ Content: <ModalContent tokenAddress={tokenAddress} />, title: 'Vesting Goledo' });

export default showVestingGoledoModal;
