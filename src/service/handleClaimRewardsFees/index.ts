import { MultiFeeDistributionContract } from '@utils/contracts';
import { tokensStore } from '@store/Tokens';
import { sendTransaction } from '@store/wallet';
export { default } from './showModal';

export const handleClaimRewardsFeesV1 = async () => {
  try {
    const claimableFees = tokensStore.getState().claimableFeesV1;
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_MultiFeeDistributionAddressV1,
      data: MultiFeeDistributionContract.interface.encodeFunctionData('getReward', [claimableFees?.slice(1).map((token) => token.supplyTokenAddress)]),
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle claim GOL-V1 Error`, err);
    throw err;
  }
};

export const handleClaimRewardsFeesV2 = async () => {
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
