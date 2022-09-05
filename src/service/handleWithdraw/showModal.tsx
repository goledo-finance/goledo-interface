import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { TokenInfo, useTokens, useUserData } from '@store/Tokens';
import { showModal, hideAllModal } from '@components/showPopup/Modal';
import BalanceInput from '@modules/BalanceInput';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import HealthFactor from '@modules/HealthFactor';
import useEstimateHealthFactor from '@hooks/useEstimateHealthFactor';
import useERC20Token from '@hooks/useERC20Token';
import useTransaction from '@hooks/useTransaction';
import Success from '@assets/icons/success.svg';
import Error from '@assets/icons/error.svg';
import { handleWithdraw } from './index';

const Zero = Unit.fromMinUnit(0);

const ModalContent: React.FC<{ address: string }> = ({ address }) => {
  const { register, handleSubmit: withForm } = useForm();
  const tokens = useTokens();
  const token = tokens?.find((t) => t.address === address)!;
  const hasBorrowed = !!tokens?.find((token) => token.borrowBalance?.greaterThan(Zero));
  const userData = useUserData();

  const [confirmAmount, setConfirmAmount] = useState<string | null>(null);
  const confirmAmountUnit = useMemo(() => (confirmAmount ? Unit.fromStandardUnit(confirmAmount || 0, token?.decimals) : undefined), [confirmAmount]);

  const estimateToken = useMemo(() => {
    const res: PartialOmit<TokenInfo, 'symbol'> = { symbol: token.symbol };
    if (!confirmAmountUnit || !token.supplyBalance || !token.usdPrice) return res;
    const supplyBalance = token.supplyBalance.sub(confirmAmountUnit);
    const supplyPrice = token.usdPrice.mul(supplyBalance);
    res.supplyBalance = supplyBalance;
    res.supplyPrice = supplyPrice;
    return res;
  }, [token, confirmAmountUnit]);
  const estimateHealthFactor = useEstimateHealthFactor(estimateToken);

  const handleContinue = useCallback(
    withForm(({ amount }) => setConfirmAmount(amount)),
    []
  );

  const { status: approveStatus, handleApprove } = useERC20Token({
    needApprove: token?.symbol === 'CFX',
    tokenAddress: token?.supplyTokenAddress,
    contractAddress: import.meta.env.VITE_WETHGatewayAddress,
    amount: confirmAmountUnit,
  });

  const { status: transactionStatus, scanUrl, error, sendTransaction } = useTransaction(handleWithdraw);

  const isEstimateHealthFactorUnsafe = estimateHealthFactor && Number(estimateHealthFactor) < 1;
  const max = token?.supplyBalance;
  if (!token) return null;
  return (
    <div className="relative">
      {!confirmAmountUnit && (
        <form onSubmit={handleContinue} className="mt-10px">
          <BalanceInput
            {...register('amount', {
              required: true,
              min: Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, token.decimals),
              max: max?.toDecimalStandardUnit(),
            })}
            title="Available to withdraw"
            step={String(`1e-${token?.decimals}`)}
            symbol={token?.symbol}
            decimals={token?.decimals}
            usdPrice={token?.usdPrice!}
            min={Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, token.decimals)}
            max={max}
          />

          <Button fullWidth size="large" className="mt-48px" disabled={Number(estimateHealthFactor) < 1}>
            Continue
          </Button>
        </form>
      )}
      {confirmAmountUnit && transactionStatus !== 'success' && transactionStatus !== 'failed' && (
        <>
          <p className="mt-30px mb-4px text-14px text-#62677B">These are your transaction details. Make sure to check if this is correct before submitting.</p>
          <div className="relative flex flex-col gap-16px p-12px rounded-4px border-1px border-#EAEBEF text-14px text-#303549">
            <div className="flex justify-between">
              <span>Amount</span>
              <div className="text-right">
                <BalanceText balance={confirmAmountUnit} symbol={token?.symbol} decimals={token?.decimals} placement="top" />
                <p className="mt-2px text-12px text-#62677B">
                  <BalanceText balance={confirmAmountUnit.mul(token?.usdPrice!)} abbrDecimals={2} symbolPrefix="$" />
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Remaining supply</span>
              <div className="text-right">
                <BalanceText balance={token?.supplyBalance?.sub(confirmAmountUnit)} symbol={token?.symbol} decimals={token?.decimals} placement="top" />
              </div>
            </div>

            {hasBorrowed && (
              <div className="flex justify-between">
                <span>Health factor</span>
                <div className="text-right">
                  <p>
                    <HealthFactor value={userData?.healthFactor} />
                    <span className="i-fa6-solid:arrow-right-long mx-6px text-12px translate-y-[-1px]" />
                    <HealthFactor value={estimateHealthFactor} />
                  </p>
                  <p className="mt-6px text-12px text-#62677B">{`Liquidation at <1.0`}</p>
                </div>
              </div>
            )}

            {isEstimateHealthFactorUnsafe &&
              <p className='absolute bottom-0px left-0px translate-y-[calc(100%+6px)] text-12px text-#FE6060'>
                Health factor after withdraw can not less than 1.0
              </p>
            }
          </div>

          <Button
            fullWidth
            size="large"
            className="mt-48px"
            disabled={approveStatus === 'checking-approve' || approveStatus === 'approving' || transactionStatus === 'sending'}
            loading={approveStatus === 'checking-approve' || approveStatus === 'approving' || transactionStatus === 'sending' ? 'start' : undefined}
            onClick={() => {
              if (isEstimateHealthFactorUnsafe) {
                setConfirmAmount('');
                return;
              }
              if (approveStatus === 'approved') {
                sendTransaction({ amount: confirmAmountUnit, tokenAddress: token.address, symbol: token.symbol });
              } else if (approveStatus === 'need-approve') {
                handleApprove();
              }
            }}
          >
            {isEstimateHealthFactorUnsafe ? (
              'Go back'
            ) : (
              <>
                {transactionStatus === 'waiting' && (
                  <>
                    {approveStatus === 'checking-approve' && 'Checking Approve...'}
                    {approveStatus === 'approving' && 'Approving...'}
                    {approveStatus === 'need-approve' && `Approve ${token?.symbol}`}
                    {approveStatus === 'approved' && `Withdraw ${token?.symbol}`}
                  </>
                )}
                {transactionStatus === 'sending' && `Withdrawing ${token?.symbol}...`}
              </>
            )}
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
                You withdrew <BalanceText className="font-semibold" balance={confirmAmountUnit} placement="top" symbol={token?.symbol} />
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

const showWithdrawModal = ({ symbol, address }: { symbol: string; address: string }) =>
  showModal({ Content: <ModalContent address={address} />, title: `Withdraw ${symbol}` });

export default showWithdrawModal;
