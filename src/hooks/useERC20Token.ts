import { useState, useEffect, useMemo, useCallback } from 'react';
import { sendTransaction, useAccount, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { createERC20Contract } from '@utils/contracts';
import waitTransactionReceipt from '@utils/waitTranscationReceipt';

export type Status = 'checking-approve' | 'need-approve' | 'approving' | 'approved';

const useERC20Token = ({
  tokenAddress,
  contractAddress,
  amount,
  needApprove = true,
}: {
  tokenAddress: string;
  contractAddress: string;
  amount: Unit | undefined;
  needApprove?: boolean;
}) => {
  const [status, setStatus] = useState<Status>('checking-approve');
  const tokenContract = useMemo(() => (tokenAddress ? createERC20Contract(tokenAddress) : undefined), [tokenAddress]);
  const account = useAccount();

  const checkApprove = useCallback(async () => {
    if (!tokenContract || !account || !contractAddress || !amount) return;
    try {
      setStatus('checking-approve');
      const res = await tokenContract.allowance(account, contractAddress);
      const approveBalance = Unit.fromMinUnit(res._hex);
      if (approveBalance.greaterThanOrEqualTo(amount)) {
        setStatus('approved');
      } else {
        setStatus('need-approve');
      }
    } catch (err) {
      console.log('Check approve err', err);
    }
  }, [amount]);

  const handleApprove = useCallback(async () => {
    if (!tokenContract) return;
    try {
      setStatus('approving');
      const txnHash = await sendTransaction({
        to: tokenAddress,
        data: tokenContract.interface.encodeFunctionData('approve', [contractAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff']),
      });
      const txReceipt = await waitTransactionReceipt(txnHash);
      checkApprove();
      console.log('TxnHash', txnHash);
      console.log('txReceipt', txReceipt);
    } catch (err) {
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
