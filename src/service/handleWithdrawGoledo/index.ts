import { walletStore } from '@store/Wallet';
import { MultiFeeDistributionContract } from '@utils/contracts';
import { walletFunction } from '@utils/wallet';
export { default } from './showModal';

export const handleWithdrawGoledo = async () => {
  const wallet = walletStore.getState().wallet;
  const sendTransaction = walletFunction[wallet.name].sendTransaction;
  try {
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_MultiFeeDistributionAddress,
      data: MultiFeeDistributionContract.interface.encodeFunctionData('withdrawExpiredLocks'),
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle withdraw GOL Error`, err);
    throw err;
  }
};
