import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { accountMethodFilter, sendTransaction } from '@store/wallet';
import { LendingPoolContract, WETHGatewayContract } from '@utils/contracts';
export { default } from './showModal';

export const handleWithdraw = async ({ amount, tokenAddress, symbol }: { amount: Unit; tokenAddress: string; symbol: string }) => {
  const account = accountMethodFilter.getState().accountState;

  try {
    let data: string;
    if (symbol === 'CFX') {
      data = WETHGatewayContract.interface.encodeFunctionData('withdrawCFX', [import.meta.env.VITE_LendingPoolAddress, amount.toHexMinUnit(), account]);
    } else {
      data = LendingPoolContract.interface.encodeFunctionData('withdraw', [tokenAddress, amount.toHexMinUnit(), account]);
    }

    const TxnHash = await sendTransaction({
      to: symbol === 'CFX' ? import.meta.env.VITE_WETHGatewayAddress : import.meta.env.VITE_LendingPoolAddress,
      data,
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle withdraw ${symbol} Error`, err);
    throw err;
  }
};
