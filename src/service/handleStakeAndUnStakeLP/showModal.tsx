import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useLp } from '@store/index';
import { showModal, hideAllModal } from '@components/showPopup/Modal';
import BalanceInput from '@modules/BalanceInput';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import useERC20Token from '@hooks/useERC20Token';
import useTransaction from '@hooks/useTransaction';
import Success from '@assets/icons/success.svg';
import Error from '@assets/icons/error.svg';
import { handleStake } from './index';

const ModalContent: React.FC<{ type: 'Stake' | 'Unstake' }> = ({ type }) => {
  const { register, handleSubmit: withForm } = useForm();
  const lpToken = useLp();

  const [confirmAmount, setConfirmAmount] = useState<string | null>(null);
  const confirmAmountUnit = useMemo(() => (confirmAmount ? Unit.fromStandardUnit(confirmAmount || 0, lpToken?.decimals) : undefined), [confirmAmount]);

  const handleContinue = useCallback(
    withForm(({ amount }) => setConfirmAmount(amount)),
    []
  );

  const { status: approveStatus, handleApprove } = useERC20Token({
    tokenAddress: lpToken.address,
    contractAddress: import.meta.env.VITE_MasterChefAddress,
    amount: confirmAmountUnit,
  });

  const { status: transactionStatus, scanUrl, error, sendTransaction } = useTransaction(handleStake);

  const max = lpToken?.[type === 'Stake' ? 'balance' : 'stakedBalance'];
  if (!lpToken) return null;
  return (
    <div className="relative">
      {!confirmAmount && (
        <form id='handle-stake-unstakeLP-form' onSubmit={handleContinue} className="mt-10px">
          <BalanceInput
            id='handle-stake-unstakelp-amount-input'
            {...register('amount', {
              required: true,
              min: Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, lpToken.decimals),
              max: max?.toDecimalStandardUnit(),
            })}
            title={`How much do you want to ${type.toLowerCase()}?`}
            step={String(`1e-${lpToken?.decimals}`)}
            symbol={lpToken?.symbol}
            decimals={lpToken?.decimals}
            usdPrice={lpToken?.usdPrice!}
            min={Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, lpToken.decimals)}
            max={max}
          />

          <Button id='handle-stake-unstakeLP-continue-btn' fullWidth size="large" className="mt-48px">
            Continue
          </Button>
        </form>
      )}
      {confirmAmount && confirmAmountUnit && transactionStatus !== 'success' && transactionStatus !== 'failed' && (
        <>
          <p className="mt-30px mb-4px text-14px text-#62677B">These are your transaction details. Make sure to check if this is correct before submitting.</p>
          <div className="flex flex-col gap-16px p-12px rounded-4px border-1px border-#EAEBEF text-14px text-#303549">
            <div className="flex justify-between">
              <span>Amount</span>
              <div className="text-right">
                <BalanceText balance={confirmAmountUnit} symbol={lpToken?.symbol} decimals={lpToken?.decimals} />
                <p className="mt-2px text-12px text-#62677B">
                  <BalanceText balance={confirmAmountUnit.mul(lpToken?.usdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Staked GOLCFX</span>
              <div className="text-right">
                <p>
                  <BalanceText balance={lpToken?.stakedBalance} decimals={lpToken?.decimals} />
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-12px translate-y-[-1px]" />
                  <BalanceText
                    balance={lpToken?.stakedBalance?.[type === 'Stake' ? 'add' : 'sub']?.(confirmAmountUnit)}
                    decimals={lpToken?.decimals}
                  />
                </p>
                <p className="mt-2px text-12px text-#62677B">
                  <BalanceText balance={lpToken?.stakedBalance?.mul(lpToken?.usdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-10px translate-y-[-1px]" />
                  <BalanceText balance={lpToken?.stakedBalance?.[type === 'Stake' ? 'add' : 'sub']?.(confirmAmountUnit).mul(lpToken?.usdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                </p>
              </div>
            </div>
          </div>

          <Button
            id='handle-stake-unstakeLP-confirm-btn'
            fullWidth
            size="large"
            className="mt-48px"
            disabled={approveStatus === 'checking-approve' || approveStatus === 'approving' || transactionStatus === 'sending'}
            loading={approveStatus === 'checking-approve' || approveStatus === 'approving' || transactionStatus === 'sending' ? 'start' : undefined}
            onClick={() => {
              if (approveStatus === 'approved') {
                sendTransaction({ amount: confirmAmountUnit, type });
              } else if (approveStatus === 'need-approve') {
                handleApprove();
              }
            }}
          >
            {transactionStatus === 'waiting' && (
              <>
                {approveStatus === 'checking-approve' && 'Checking Approve...'}
                {approveStatus === 'approving' && 'Approving...'}
                {approveStatus === 'need-approve' && `Approve ${lpToken?.symbol}`}
                {approveStatus === 'approved' && `${type == 'Stake' ? 'Staking' : 'Unstaking'} ${lpToken?.symbol}`}
              </>
            )}
            {transactionStatus === 'sending' && `${type == 'Stake' ? 'Staking' : 'Unstaking'} ${lpToken?.symbol}...`}
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
                You {type == 'Stake' ? 'staked' : 'Unstaked'} <BalanceText className="font-semibold" balance={confirmAmountUnit} symbol={lpToken?.symbol} />
              </>
            )}
            {transactionStatus === 'failed' && error}
          </p>
          {scanUrl && (
            <a
              id='handle-stake-unstakeLP-reviewTx-link'
              className="absolute bottom-50px right-0px text-12px text-#383515 no-underline hover:underline"
              href={scanUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Review tx details
              <span className="i-charm:link-external ml-3px text-10px translate-y-[-.5px]" />
            </a>
          )}
          <Button id='handle-stake-unstakeLP-ok-btn' fullWidth size="large" className="mt-48px" onClick={hideAllModal}>
            OK
          </Button>
        </>
      )}
    </div>
  );
};

const showWithdrawModal = ({ type }: { type: 'Stake' | 'Unstake' }) => showModal({ Content: <ModalContent type={type} />, title: `${type} GOLCFX` });

export default showWithdrawModal;
