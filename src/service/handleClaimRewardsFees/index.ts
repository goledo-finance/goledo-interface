import { MultiFeeDistributionContract } from '@utils/contracts';
import { tokensStore } from '@store/Tokens';
import { walletStore } from '@store/Wallet';
import { walletFunction } from '@utils/wallet';
export { default } from './showModal';

export const handleClaimRewardsFees = async () => {
  const walet = walletStore.getState().wallet;
  const sendTransaction = walletFunction[walet.name].sendTransaction;
  try {
    const claimableFees = tokensStore.getState().claimableFees;
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_MultiFeeDistributionAddress,
      data: MultiFeeDistributionContract.interface.encodeFunctionData('getReward', [claimableFees?.map((token) => token.supplyTokenAddress)]),
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle claim GOL Error`, err);
    throw err;
  }
};
