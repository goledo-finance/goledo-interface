import { walletStore } from '@store/Wallet';
import { LendingPoolContract } from '@utils/contracts';
import { walletFunction } from '@utils/wallet';
export { default } from './showModal';

export const handleCollateralChange = async ({ tokenAddress, collateral }: { tokenAddress: string; collateral: boolean }) => {
  const wallet = walletStore.getState().wallet;
  const sendTransaction = walletFunction[wallet.name].sendTransaction;
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
