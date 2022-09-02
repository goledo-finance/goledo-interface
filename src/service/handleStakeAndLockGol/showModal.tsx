import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledo } from '@store/index';
import { showModal, hideAllModal } from '@components/showPopup/Modal';
import BalanceInput from '@components/BalanceInput';
import Button from '@components/Button';
import BalanceText from '@components/BalanceText';
import useERC20Token from '@hooks/useERC20Token';
import useTransaction from '@hooks/useTransaction';
import Success from '@assets/icons/success.svg';
import Error from '@assets/icons/error.svg';
import { handleStakeAndLock } from './index';

const ModalContent: React.FC<{ type: 'Stake' | 'Lock'  }> = ({ type }) => {
  const { register, handleSubmit: withForm } = useForm();
  const goledo = useGoledo();

  const [confirmAmount, setConfirmAmount] = useState<string | null>(null);
  const confirmAmountUnit = useMemo(() => (confirmAmount ? Unit.fromStandardUnit(confirmAmount || 0, goledo?.decimals) : undefined), [confirmAmount]);

  const handleContinue = useCallback(withForm(({ amount }) => setConfirmAmount(amount)),[]);

  const { status: approveStatus, handleApprove } = useERC20Token({
    tokenAddress: goledo.address,
    contractAddress: import.meta.env.VITE_MultiFeeDistributionAddress,
    amount: confirmAmountUnit,
  });

  const { status: transactionStatus, scanUrl, error, sendTransaction } = useTransaction(handleStakeAndLock);

  const max = goledo?.balance;
  if (!goledo) return null;
  return (
    <div className='relative'>
      {!confirmAmount && (
        <form onSubmit={handleContinue} className="mt-10px">
          <BalanceInput
            {...register('amount', {
              required: true,
              min: Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, goledo.decimals),
              max: max?.toDecimalStandardUnit(),
            })}
            title={`How much do you want to ${type.toLowerCase()}?`}
            step={String(`1e-${goledo?.decimals}`)}
            symbol={goledo?.symbol}
            decimals={goledo?.decimals}
            usdPrice={goledo?.usdPrice!}
            min={Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, goledo.decimals)}
            max={max}
          />

          <Button fullWidth size="large" className="mt-48px">
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
                <BalanceText balance={confirmAmountUnit} symbol={goledo?.symbol} decimals={goledo?.decimals} placement="top" />
                <p className="mt-2px text-12px text-#62677B">${confirmAmountUnit.mul(goledo?.usdPrice!).toDecimalStandardUnit(2)}</p>
              </div>
            </div>

            <div className="flex justify-between">
              <span>{type === 'Stake' ? 'Staked' : 'Locked'} GOL</span>
              <div className="text-right">
                <p>
                  <BalanceText balance={type === 'Stake' ? goledo?.stakedBalance : goledo?.lockedBalance} symbol={goledo?.symbol} decimals={goledo?.decimals} placement="top" />
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-12px translate-y-[-1px]" />
                  <BalanceText balance={(type === 'Stake' ? goledo?.stakedBalance : goledo?.lockedBalance)?.add(confirmAmountUnit)} symbol={goledo?.symbol} decimals={goledo?.decimals} placement="top" />
                </p>
                <p className="mt-2px text-12px text-#62677B">
                  <span>${(type === 'Stake' ? goledo?.stakedBalance : goledo?.lockedBalance)?.mul(goledo?.usdPrice!).toDecimalStandardUnit(2)}</span>
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-10px translate-y-[-1px]" />
                  <span>${(type === 'Stake' ? goledo?.stakedBalance : goledo?.lockedBalance)?.add(confirmAmountUnit).mul(goledo?.usdPrice!).toDecimalStandardUnit(2)}</span>
                </p>
              </div>
            </div>
          </div>

          <Button
            fullWidth
            size="large"
            className="mt-48px"
            disabled={approveStatus === 'checking-approve' || approveStatus === 'approving' || transactionStatus === 'sending'}
            loading={(approveStatus === 'checking-approve' || approveStatus === 'approving' || transactionStatus === 'sending') ? 'start' : undefined}
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
                {approveStatus === 'need-approve' && `Approve Goledo`}
                {approveStatus === 'approved' && `${type == 'Stake' ? 'Staking' : 'Locking'} Goledo`}
              </>
            )}
            {transactionStatus === 'sending' && `${type == 'Stake' ? 'Staking' : 'Locking'} Goledo...`}
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
                You {type == 'Stake' ? 'staked' : 'locked'} <span className='font-semibold'>{confirmAmountUnit?.toDecimalStandardUnit(2)}</span> {goledo?.symbol}
              </>
            )}
            {transactionStatus === 'failed' && error}
          </p>
          {scanUrl &&
            <a
              className='absolute bottom-50px right-0px text-12px text-#383515 no-underline hover:underline'
              href={scanUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Review tx details
              <span className='i-charm:link-external ml-3px text-10px translate-y-[-.5px]' />
            </a>
          }
          <Button fullWidth size="large" className="mt-48px" onClick={hideAllModal}>
            OK
          </Button>
        </>
      )}
    </div>
  );
};

const showWithdrawModal = ({ type }: { type: 'Stake' | 'Lock'; }) =>
  showModal({ Content: <ModalContent type={type} />, title: `${type} Goledo` });

export default showWithdrawModal;
