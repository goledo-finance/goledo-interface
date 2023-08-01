import { sendTransaction } from '@store/wallet';
import { LendingPoolContract } from '@utils/contracts';
export { default } from './showModal';

export const handleCollateralChange = async ({ tokenAddress, collateral }: { tokenAddress: string; collateral: boolean }) => {
  try {
    const data = LendingPoolContract.interface.encodeFunctionData('setUserUseReserveAsCollateral', [tokenAddress, collateral]);
    const TxnHash = await sendTransaction({
      to: import.meta.env.VITE_LendingPoolAddress,
      data,
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle Collateral Change Error`, err);
    throw err;
  }
};
