import { sendTransaction, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { MultiFeeDistributionContract } from '@utils/contracts';
export { default } from './showModal';

export const handleStakeAndLock = async ({ amount, type }: { amount: Unit; type: 'Stake' | 'Lock'; }) => {
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
