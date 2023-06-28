import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { walletStore } from '@store/Wallet';
import { MasterChefContract } from '@utils/contracts';
import { walletFunction } from '@utils/wallet';
export { default } from './showModal';

export const handleStake = async ({ amount, type }: { amount: Unit; type: 'Stake' | 'Unstake' }) => {
  const wallet = walletStore.getState().wallet;
  const sendTransaction = walletFunction[wallet.name].sendTransaction;
  try {
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_MasterChefAddress,
      data:
        type === 'Stake'
          ? MasterChefContract.interface.encodeFunctionData('deposit', [import.meta.env.VITE_SwappiPairAddress, amount.toHexMinUnit()])
          : MasterChefContract.interface.encodeFunctionData('withdraw', [import.meta.env.VITE_SwappiPairAddress, amount.toHexMinUnit()]),
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle ${type} GOLCFX Error`, err);
    throw err;
  }
};
