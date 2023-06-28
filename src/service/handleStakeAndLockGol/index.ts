import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { walletStore } from '@store/Wallet';
import { MultiFeeDistributionContract } from '@utils/contracts';
import { walletFunction } from '@utils/wallet';
export { default } from './showModal';

export const handleStakeAndLock = async ({ amount, type }: { amount: Unit; type: 'Stake' | 'Lock' }) => {
  const wallet = walletStore.getState().wallet;
  const sendTransaction = walletFunction[wallet.name].sendTransaction;
  try {
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_MultiFeeDistributionAddress,
      data: MultiFeeDistributionContract.interface.encodeFunctionData('stake', [amount.toHexMinUnit(), type === 'Lock']),
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle ${type} GOL Error`, err);
    throw err;
  }
};
