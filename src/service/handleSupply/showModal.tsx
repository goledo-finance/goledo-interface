import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { TokenInfo, useTokens, useUserData } from '@store/Tokens';
import { showModal } from '@components/showPopup/Modal';
import BalanceInput from '@components/BalanceInput';
import ToolTip from '@components/Tooltip';
import Button from '@components/Button';
import BalanceText from '@components/BalanceText';
import useEstimateHealthFactor from '@hooks/useEstimateHealthFactor';
import useERC20Token from '@hooks/useERC20Token';
import { handleSupply } from './index';

const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const ModalContent: React.FC<{ address: string }> = ({ address }) => {
  const [confirmAmount, setConfirmAmount] = useState<string | null>(null);
  const confirmAmountUnit = useMemo(() => (confirmAmount ? Unit.fromStandardUnit(confirmAmount || 0) : undefined), [confirmAmount]);

  const { register, handleSubmit: withForm, setValue, watch } = useForm();

  const userData = useUserData();
  const tokens = useTokens();
  const token = tokens?.find((t) => t.address === address)!;

  const estimateToken = useMemo(() => {
    const supplyBalance = confirmAmountUnit ? token.supplyBalance?.add(confirmAmountUnit) : undefined;
    const supplyPrice = supplyBalance ? token?.usdPrice?.mul(supplyBalance) : undefined;
    const res: PartialOmit<TokenInfo, 'symbol'> = { symbol: token.symbol };
    if (supplyBalance) res.supplyBalance = supplyBalance;
    if (supplyPrice) res.supplyPrice = supplyPrice;
    return res;
  }, [token, confirmAmountUnit]);
  const estimateHealthFactor = useEstimateHealthFactor(estimateToken);

  const { status, handleApprove } = useERC20Token({
    isCFX: token.symbol === 'CFX',
    tokenAddress: address,
    contractAddress: import.meta.env.VITE_LendingPoolAddress,
    amount: confirmAmountUnit,
  });

  const onSubmit = useCallback(
    withForm(({ amount }) => setConfirmAmount(amount)),
    []
  );

  if (!token) return null;
  return (
    <div>
      {!confirmAmount && (
        <form onSubmit={onSubmit} className="mt-10px">
          <BalanceInput
            {...register('amount', {
              required: true,
              min: Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, token.decimals),
              max: token?.balance?.toDecimalStandardUnit(),
            })}
            title={
              <span>
                Available to supply
                <ToolTip text="This is the total amount that you are able to supply to in this reserve. You are able to supply your wallet balance up until the supply cap is reached.">
                  <span className="i-bi:info-circle ml-4px text-12px cursor-pointer" />
                </ToolTip>
              </span>
            }
            step={String(`1e-${token?.decimals}`)}
            symbol={token?.symbol}
            decimals={token?.decimals}
            usdPrice={token?.usdPrice!}
            min={Unit.fromMinUnit(1).toDecimalStandardUnit(undefined, token.decimals)}
            max={token?.balance!}
          />

          <Button fullWidth size="large" className="mt-40px">
            Continue
          </Button>
        </form>
      )}
      {confirmAmount && confirmAmountUnit && (
        <>
          <p className="mt-30px mb-4px text-14px text-#62677B">These are your transaction details. Make sure to check if this is correct before submitting.</p>
          <div className="flex flex-col gap-16px p-12px rounded-4px border-1px border-#EAEBEF text-14px text-#303549">
            <div className="flex justify-between">
              <span>Amount</span>
              <div className="text-right">
                <BalanceText balance={confirmAmountUnit} symbol={token?.symbol} decimals={token?.decimals} placement="top" />
                <p className="mt-2px text-12px text-#62677B">${confirmAmountUnit.mul(token?.usdPrice!).toDecimalStandardUnit(2)}</p>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Supply</span>
              <div className="text-right">
                {`${token?.supplyAPY?.greaterThan(PointZeroOne) ? `${token?.supplyAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}`}
              </div>
            </div>

            <div className="flex justify-between">
              <span>Collateralization</span>
              <div className="text-right">Disabled</div>
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
            className="mt-40px"
            disabled={status === 'checking-approve' || status === 'approving'}
            onClick={() => {
              if (status === 'approved') {
                handleSupply({ amount: confirmAmountUnit, symbol: token.symbol, address: token.address });
              } else if (status === 'need-approve') {
                handleApprove();
              }
            }}
          >
            {status === 'checking-approve' && 'Checking Approve...'}
            {status === 'approving' && 'Approving...'}
            {status === 'need-approve' && `Approve ${token?.symbol}`}
            {status === 'approved' && `Supply ${token?.symbol}`}
          </Button>
        </>
      )}
    </div>
  );
};

const showSupplyModal = ({ symbol, address }: { symbol: string; address: string }) =>
  showModal({ Content: <ModalContent address={address} />, title: `Supply ${symbol}` });

export default showSupplyModal;
