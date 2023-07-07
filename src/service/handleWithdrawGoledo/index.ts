import { sendTransaction } from '@store/wallet';
import { MultiFeeDistributionContract } from '@utils/contracts';
export { default } from './showModal';

export const handleWithdrawGoledo = async () => {
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
