import { sendTransaction, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { MasterChefContract } from '@utils/contracts';
export { default } from './showModal';

export const handleStake = async ({ amount, type }: { amount: Unit; type: 'Stake' | 'Unstake'; }) => {
  try {
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_MasterChefAddress,
      data: type === 'Stake' ?
        MasterChefContract.interface.encodeFunctionData('deposit', [import.meta.env.VITE_SwappiPairAddress, amount.toHexMinUnit()])
        : MasterChefContract.interface.encodeFunctionData('withdraw', [import.meta.env.VITE_SwappiPairAddress, amount.toHexMinUnit()]),
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle ${type} GOLCFX Error`, err);
    throw err;
  }
};
