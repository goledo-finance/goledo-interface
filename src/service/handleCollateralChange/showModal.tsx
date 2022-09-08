import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { TokenInfo, useTokens, useUserData } from '@store/index';
import { showModal, hideAllModal } from '@components/showPopup/Modal';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import HealthFactor from '@modules/HealthFactor';
import useEstimateHealthFactor from '@hooks/useEstimateHealthFactor';
import useTransaction from '@hooks/useTransaction';
import Success from '@assets/icons/success.svg';
import Error from '@assets/icons/error.svg';
import { handleCollateralChange } from './index';

const Zero = Unit.fromMinUnit(0);

export enum ErrorType {
  DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY,
  CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL,
  CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE,
}

const ModalContent: React.FC<{ address: string }> = ({ address }) => {
  const tokens = useTokens();
  const token = tokens?.find((t) => t.address === address)!;
  const hasBorrowed = !!tokens?.find(token => token.borrowBalance?.greaterThan(Zero));
  const userData = useUserData();

  const { status: transactionStatus, scanUrl, error, sendTransaction } = useTransaction(handleCollateralChange);

  const { collateral, canBeCollateral } = token;
  const estimateToken = useMemo(() => {
    const res: PartialOmit<TokenInfo, 'symbol'> = { symbol: token.symbol };
    if (token.collateral === undefined) return res;
    res.collateral = !token.collateral;
    return res;
  }, [token]);
  const estimateHealthFactor = useEstimateHealthFactor(estimateToken);

  // error handling
  let blockingError: ErrorType | undefined = undefined;
  if (token?.supplyBalance?.equals(Zero)) {
    blockingError = ErrorType.DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY;
  } else if (!canBeCollateral) {
    blockingError = ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL;
  } else if (collateral && token?.borrowBalance?.greaterThan(Zero) && estimateHealthFactor && (Number(estimateHealthFactor) < 1)) {
    blockingError = ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE;
  }

  // error render handling
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY:
        return 'You do not have supplies in this currency';
      case ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL:
        return 'You can not use this currency as collateral';
      case ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE:
        return 'You can not switch usage as collateral mode for this currency, because it will cause collateral call';
      default:
        return null;
    }
  };
  
  const collateralAfterSwitch = !collateral;
  if (!token) return null;
  return (
    <div className="relative">
      {transactionStatus !== 'success' && transactionStatus !== 'failed' && (
        <>
          <p className="px-12px py-8px mb-12px bg-#FEF5E8 text-#63400A text-12px leading=16px">
            {collateralAfterSwitch
              ? <>Enabling this asset as collateral increases your borrowing power and Health Factor. <br/>However, it can get liquidated if your health factor drops below 1.</>
              : 'Disabling this asset as collateral affects your borrowing power and Health Factor.'}
          </p>
          <div className="flex flex-col pt-20px">
            <p className="mb-4px text-12px tracking-wide">Transaction overview</p>
            <div className="flex flex-col border border-#EAEBEF rounded p-12px text-14px">
              <div className="flex justify-between">
                <span className="text-#303549">Supply Balance</span>
                <div className="text-right">
                  <BalanceText balance={token?.supplyBalance} symbol={token?.symbol} decimals={token?.decimals} placement="top" />
                </div>
              </div>
              {hasBorrowed &&
                <div className="flex justify-between">
                  <span className="text-#303549">Health Factor</span>
                  <div className="text-right">
                    <p>
                      <HealthFactor value={userData?.healthFactor} />
                      <span className="i-fa6-solid:arrow-right-long mx-6px text-12px translate-y-[-1px]" />
                      <HealthFactor value={estimateHealthFactor} />
                    </p>
                    <p className="mt-6px text-12px text-#62677B">{`Liquidation at <1.0`}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          {blockingError !== undefined && <p className="text-#bc0000b8 mt-24px text-12px tracking-wide">{handleBlocked()}</p>}

          <Button
            fullWidth
            size="large"
            className="mt-48px"
            disabled={transactionStatus === 'sending' || blockingError !== undefined}
            loading={transactionStatus === 'sending' ? 'start' : undefined}
            onClick={() => sendTransaction({ tokenAddress: token.address, collateral: collateralAfterSwitch })}
          >
            {transactionStatus === 'waiting' && (collateralAfterSwitch ? `Enable ${token.symbol} as collateral` : `Disable ${token.symbol} as collateral`)}
            {transactionStatus === 'sending' && 'Pending...'}
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
              <>{collateralAfterSwitch ? `You Enable ${token.symbol} as collateral` : `You Disable ${token.symbol} as collateral`}</>
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

const showCollateralChangeModal = ({ address, symbol }: { address: string; symbol: string }) =>
  showModal({ Content: <ModalContent address={address} />, title: `Review tx ${symbol}` });

export default showCollateralChangeModal;
