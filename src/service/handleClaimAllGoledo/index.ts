import { sendTransaction } from '@cfxjs/use-wallet-react/ethereum';
import { MultiFeeDistributionContract } from '@utils/contracts';
export { default } from './showModal';

export const handleClaimAllGoledo = async () => {
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
