import { MultiFeeDistributionContract } from '@utils/contracts';
import { goledoStore } from '@store/Goledo';
import { sendTransaction } from '@store/wallet';
export { default } from './showModal';

export const handleClaimGoledo = async () => {
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
