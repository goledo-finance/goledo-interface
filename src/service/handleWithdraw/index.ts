import { sendTransaction, store as walletStore, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { LendingPoolContract, WETHGatewayContract } from '@utils/contracts';
export { default } from './showModal';

export const handleWithdraw = async ({ amount, tokenAddress, symbol }: { amount: Unit; tokenAddress: string; symbol: string }) => {
  const account = walletStore.getState().accounts?.[0];

  try {
    let data: string;
    if (symbol === 'CFX') {
      data = WETHGatewayContract.interface.encodeFunctionData('withdrawETH', [import.meta.env.VITE_LendingPoolAddress, amount.toHexMinUnit(), account]);
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
