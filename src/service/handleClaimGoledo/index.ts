import { MultiFeeDistributionContract } from '@utils/contracts';
import { goledoStore } from '@store/Goledo';
import { walletStore } from '@store/Wallet';
import { walletFunction } from '@utils/wallet';
export { default } from './showModal';

export const handleClaimGoledo = async () => {
  const wallet = walletStore.getState().wallet;
  const sendTransaction = walletFunction[wallet.name].sendTransaction;
  try {
    const stakedBalance = goledoStore.getState().stakedBalance;
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_MultiFeeDistributionAddress,
      data: MultiFeeDistributionContract.interface.encodeFunctionData('withdraw', [stakedBalance?.toHexMinUnit()]),
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle claim GOL Error`, err);
    throw err;
  }
};
