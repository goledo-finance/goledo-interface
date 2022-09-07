import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { TokenInfo, useTokens, useUserData } from '@store/Tokens';
import { showModal, hideAllModal } from '@components/showPopup/Modal';
import BalanceInput from '@components/BalanceInput';
import Button from '@components/Button';
import Toggle from '@components/Toggle';
import BalanceText from '@components/BalanceText';
import useEstimateHealthFactor from '@hooks/useEstimateHealthFactor';
import useERC20Token from '@hooks/useERC20Token';
import useEstimateCfxGasFee from '@hooks/useEstimateCfxGasFee';
import useTransaction from '@hooks/useTransaction';
import Success from '@assets/icons/success.svg';
import Error from '@assets/icons/error.svg';
import { handleRepay, createCFXData } from './index';

const Zero = Unit.fromMinUnit(0);

const ModalContent: React.FC<{ address: string }> = ({ address }) => {
  const { register, handleSubmit: withForm } = useForm();
  const tokens = useTokens();
  const token = tokens?.find((t) => t.address === address)!;
  const userData = useUserData();

  const [confirmAmount, setConfirmAmount] = useState<string | null>(null);
  const [repayAllAmount, setRepayAllAmount] = useState<string | null>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [repayAll, setRepayAll] = useState<boolean>(false);
  const confirmAmountUnit = useMemo(() => (confirmAmount ? Unit.fromStandardUnit(confirmAmount || 0, token?.decimals) : undefined), [confirmAmount]);

  const estimateToken = useMemo(() => {
    const res: PartialOmit<TokenInfo, 'symbol'> = { symbol: token.symbol };
    if (!confirmAmountUnit || !token.borrowBalance || !token.usdPrice) return res;
    const borrowBalance = token.borrowBalance?.sub?.(confirmAmountUnit);
    const borrowPrice = token.usdPrice?.mul?.(borrowBalance);
    res.borrowBalance = borrowBalance;
    res.borrowPrice = borrowPrice;
    return res;
  }, [token, confirmAmountUnit]);
  const estimateHealthFactor = useEstimateHealthFactor(estimateToken);

  const cfxGasFee = useEstimateCfxGasFee({
    createData: createCFXData,
    to: import.meta.env.VITE_WETHGatewayAddress,
    amount: token?.borrowBalance && token.balance ? Unit.min(token?.borrowBalance, token.balance) : undefined,
    isCFX: token?.symbol === 'CFX',
  });

  const handleContinue = useCallback(() => {
    if (!repayAll) {
      withForm(({ amount }) => {
        setConfirmAmount(amount);
      });
    } else {
      if (repayAllAmount && token?.balance && Unit.fromStandardUnit(repayAllAmount)?.greaterThan(token?.balance)) {
        setShowError(true);
      } else {
        setConfirmAmount(repayAllAmount);
      }
    }
  }, [repayAll, repayAllAmount, token?.balance]);

  const { status: approveStatus, handleApprove } = useERC20Token({
    needApprove: token?.symbol !== 'CFX',
    tokenAddress: address,
    contractAddress: import.meta.env.VITE_LendingPoolAddress,
    amount: confirmAmountUnit,
  });

  const { status: transactionStatus, scanUrl, error, sendTransaction } = useTransaction(handleRepay);

  const maxBalance =
    token?.symbol !== 'CFX'
      ? token?.balance
      : cfxGasFee && token?.balance
      ? token.balance.greaterThan(cfxGasFee)
        ? token.balance.sub(cfxGasFee)
        : Zero
      : undefined;
  const debt = token?.borrowBalance;
  const safeAmountToRepayAll = debt?.mul(Unit.fromMinUnit(1.0025));
  const max = debt && maxBalance ? Unit.min(debt, maxBalance) : undefined;
  const debtAfterRepay = confirmAmount ? debt?.sub(Unit.fromStandardUnit(confirmAmount)) : undefined;

  if (!token) return null;
  return (
    <div className="relative">
      {!confirmAmount && (
        <form onSubmit={handleContinue} className="mt-10px">
          <span className="flex items-center justify-between mb-4px text-14px text-#62677B">
            How much do you want to repay?
            <Toggle
              name="repayAll"
              checked={repayAll}
              onToggle={(e) => {
                e.stopPropagation();
                setRepayAll(!repayAll);
                safeAmountToRepayAll && setRepayAllAmount(safeAmountToRepayAll?.toDecimalStandardUnit(undefined, token.decimals));
              }}
              // onLeft={() => setShowError(false)}
            />
          </span>
          {!repayAll && (
            <BalanceInput
              {...register('amount', {
                required: true,
                min: Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, token.decimals),
                max: max?.toDecimalStandardUnit(),
              })}
              step={String(`1e-${token?.decimals}`)}
              symbol={token?.symbol}
              decimals={token?.decimals}
              usdPrice={token?.usdPrice!}
              min={Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, token.decimals)}
              max={max}
            />
          )}
          {repayAll && (
            <>
              <div className="flex flex-col mt-16px gap-8px text-14px text-#62677B">
                <span>
                  Debt: <BalanceText balance={debt} symbol={token?.symbol} decimals={token?.decimals} placement="top" />
                </span>
                <span className={`${showError ? 'text-#FE6060' : 'text-#62677B'}`}>
                  Required Balance:{' '}
                  <BalanceText balance={Unit.fromStandardUnit(repayAllAmount!)} symbol={token?.symbol} decimals={token?.decimals} placement="top" />
                </span>
              </div>
              {!showError && (
                <span className="text-14px text-#F89F1A inline-block mt-16px">According to the actual deduction, the remainder will be refunded.</span>
              )}
              {showError && <span className="text-14px text-#FE6060 inline-block mt-16px">Insufficient balance</span>}
            </>
          )}

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
              <span>Remaining debt</span>
              <div className="text-right">
                <p>
                  <BalanceText balance={debt} symbol={token?.symbol} decimals={token?.decimals} placement="top" />
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-12px translate-y-[-1px]" />
                  <BalanceText balance={debtAfterRepay} symbol={token?.symbol} decimals={token?.decimals} placement="top" />
                </p>
                <p className="mt-6px text-12px text-#303549">
                  <span className="mt-2px">
                    $<BalanceText balance={debt?.mul(token?.usdPrice ?? Zero)} decimals={18} symbol="" />
                  </span>
                  <span className="i-fa6-solid:arrow-right-long mx-6px text-12px translate-y-[-1px]" />
                  <span className="mt-2px">
                    $<BalanceText balance={debtAfterRepay?.mul(token?.usdPrice ?? Zero)} decimals={18} symbol="" />
                  </span>
                </p>
              </div>
            </div>

            {estimateHealthFactor && (
              <div className="flex justify-between">
                <span>Health factor</span>
                <div className="text-right">
                  <p className="text-#F89F1A">
                    <span>{userData?.healthFactor ?? ''}</span>
                    <span className="i-fa6-solid:arrow-right-long mx-6px text-12px translate-y-[-1px]" />
                    <span>{estimateHealthFactor}</span>
                  </p>
                  <p className="mt-6px text-12px text-#62677B">{`Liquidation at <1.0`}</p>
                </div>
              </div>
            )}
          </div>

          <Button
            fullWidth
            size="large"
            className="mt-48px"
            disabled={approveStatus === 'checking-approve' || approveStatus === 'approving' || transactionStatus === 'sending'}
            loading={approveStatus === 'checking-approve' || approveStatus === 'approving' || transactionStatus === 'sending' ? 'start' : undefined}
            onClick={() => {
              if (approveStatus === 'approved') {
                sendTransaction({ amount: confirmAmountUnit, symbol: token.symbol, tokenAddress: address });
              } else if (approveStatus === 'need-approve') {
                handleApprove();
              }
            }}
          >
            {transactionStatus === 'waiting' && (
              <>
                {approveStatus === 'checking-approve' && 'Checking Approve...'}
                {approveStatus === 'approving' && 'Approving...'}
                {approveStatus === 'need-approve' && `Approve ${token?.symbol}`}
                {approveStatus === 'approved' && `Repay ${token?.symbol}`}
              </>
            )}
            {transactionStatus === 'sending' && `Repaying ${token?.symbol}...`}
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
                You Repaid <span className="font-semibold">{confirmAmountUnit?.toDecimalStandardUnit(2)}</span> {token?.symbol}
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

const showRepayModal = ({ symbol, address }: { symbol: string; address: string }) =>
  showModal({ Content: <ModalContent address={address} />, title: `Repay ${symbol}` });

export default showRepayModal;
