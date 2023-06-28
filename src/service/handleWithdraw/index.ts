import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { walletStore } from '@store/Wallet';
import { LendingPoolContract, WETHGatewayContract } from '@utils/contracts';
import { walletFunction } from '@utils/wallet';
export { default } from './showModal';

export const handleWithdraw = async ({ amount, tokenAddress, symbol }: { amount: Unit; tokenAddress: string; symbol: string }) => {
  const wallet = walletStore.getState().wallet;
  const account = walletFunction[wallet.name].store.getState().accounts?.[0];
  const sendTransaction = walletFunction[wallet.name].sendTransaction;

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
