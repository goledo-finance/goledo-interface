import { useState, useEffect, useMemo, useCallback } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { createERC20Contract, createDebtTokenContract } from '@utils/contracts';
import waitTransactionReceipt from '@utils/waitTranscationReceipt';
import { sendTransaction, useAccount } from '@store/wallet';

export type Status = 'checking-approve' | 'need-approve' | 'approving' | 'approved';

const useERC20Token = ({
  tokenAddress,
  contractAddress,
  amount,
  needApprove = true,
  isDebtToken,
}: {
  tokenAddress: string;
  contractAddress: string;
  amount: Unit | undefined;
  needApprove?: boolean;
  isDebtToken?: boolean;
}) => {
  const [status, setStatus] = useState<Status>('checking-approve');
  const tokenContract = useMemo(
    () => (tokenAddress ? (!isDebtToken ? createERC20Contract : createDebtTokenContract)(tokenAddress) : undefined),
    [tokenAddress]
  );
  const account = useAccount();

  const checkApprove = useCallback(async () => {
    if (!tokenContract || !account || !contractAddress || !amount) return;
    try {
      setStatus('checking-approve');
      const res = await tokenContract[!isDebtToken ? 'allowance' : 'borrowAllowance'](account, contractAddress);
      const approveBalance = Unit.fromMinUnit(res._hex);
      if (approveBalance.greaterThanOrEqualTo(amount)) {
        setStatus('approved');
      } else {
        setStatus('need-approve');
      }
    } catch (err) {
      setStatus('need-approve');
      console.log('Check approve err', err);
    }
  }, [amount]);

  const handleApprove = useCallback(async () => {
    if (!tokenContract) return;
    try {
      setStatus('approving');
      const txnHash = await sendTransaction({
        to: tokenAddress,
        data: tokenContract.interface.encodeFunctionData(!isDebtToken ? 'approve' : 'approveDelegation', [
          contractAddress,
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        ]),
      });
      const txReceipt = await waitTransactionReceipt(txnHash);
      checkApprove();
      return txReceipt;
    } catch (err) {
      setStatus('need-approve');
      console.log('Handle approve err', err);
    }
  }, [checkApprove]);

  useEffect(() => {
    if (!needApprove || !amount) return;
    checkApprove();
  }, [amount, needApprove]);

  return {
    status: !needApprove ? 'approved' : status,
    handleApprove,
  };
};

export default useERC20Token;
