import { walletStore } from '@store/Wallet';
import { MultiFeeDistributionContract } from '@utils/contracts';
import { walletFunction } from '@utils/wallet';
export { default } from './showModal';

export const handleClaimAllGoledo = async () => {
  const wallet = walletStore.getState().wallet;
  const sendTransaction = walletFunction[wallet.name].sendTransaction;
  try {
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_MultiFeeDistributionAddress,
      data: MultiFeeDistributionContract.interface.encodeFunctionData('exit', [false]),
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle claim all GOL Error`, err);
    throw err;
  }
};
