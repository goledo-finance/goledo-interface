import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { accountMethodFilter, sendTransaction } from '@store/wallet';
import { LendingPoolContract, WETHGatewayContract } from '@utils/contracts';
export { default } from './showModal';

export const handleBorrow = async ({ amount, symbol, tokenAddress }: { amount: Unit; symbol: string; tokenAddress: string }) => {
  const account = accountMethodFilter.getState().accountState;

  try {
    let data: string;
    if (symbol === 'CFX') {
      data = WETHGatewayContract.interface.encodeFunctionData('borrowCFX', [import.meta.env.VITE_LendingPoolAddress, amount.toHexMinUnit(), 2, 0]);
    } else {
      data = LendingPoolContract.interface.encodeFunctionData('borrow', [tokenAddress, amount.toHexMinUnit(), 2, 0, account]);
    }

    const TxnHash = await sendTransaction({
      to: symbol === 'CFX' ? import.meta.env.VITE_WETHGatewayAddress : import.meta.env.VITE_LendingPoolAddress,
      data,
    });
    return TxnHash;
  } catch (err) {
    console.log('handleBorrow Error', err);
    throw err;
  }
};
