import { useState, useCallback } from 'react';
import waitTransactionReceipt from '@utils/waitTranscationReceipt';
import Network from '@utils/Network';

export type Status = 'waiting' | 'sending' | 'failed' | 'success';

const useTransaction = <T extends (...params: any) => Promise<string>>(transactionAction: T) => {
  const [status, setStatus] = useState<Status>('waiting');
  const [scanUrl, setScanUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecAction = useCallback(async (..._params: Parameters<T>) => {
    try {
      setStatus('sending');
      const txnHash = await transactionAction(..._params as any);
      const txReceipt = await waitTransactionReceipt(txnHash);
      setStatus('success');
      setScanUrl(`${Network.blockExplorerUrls[0]}/tx/${txReceipt?.transactionHash}`);
    } catch (err: any) {
      setStatus('failed');
      if (err?.code === 4001) {
        setError('You cancel the transaction.');
      } else {
        setError(err?.message || 'Unknown error');
      }
      console.log('Handle action err', err);
    }
  }, [transactionAction]);

  return {
    status,
    scanUrl,
    error,
    sendTransaction: handleExecAction,
  };
};

export default useTransaction;
