import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { walletStore } from '@store/Wallet';
import { LendingPoolContract, WETHGatewayContract } from '@utils/contracts';
import { walletFunction } from '@utils/wallet';
export { default } from './showModal';

export const createCFXData = ({ account }: { account: string }) =>
  WETHGatewayContract.interface.encodeFunctionData('depositCFX', [import.meta.env.VITE_LendingPoolAddress, account, '0']);

export const handleSupply = async ({ amount, symbol, tokenAddress }: { amount: Unit; symbol: string; tokenAddress: string }) => {
  const wallet = walletStore.getState().wallet;
  const account = walletFunction[wallet.name].store.getState().accounts?.[0];
  const sendTransaction = walletFunction[wallet.name].sendTransaction;

  try {
    let data: string;
    if (symbol === 'CFX') {
      data = WETHGatewayContract.interface.encodeFunctionData('depositCFX', [import.meta.env.VITE_LendingPoolAddress, account, '0']);
    } else {
      data = LendingPoolContract.interface.encodeFunctionData('deposit', [tokenAddress, amount.toHexMinUnit(), account, '0']);
    }

    const TxnHash = await sendTransaction({
      to: symbol === 'CFX' ? import.meta.env.VITE_WETHGatewayAddress : import.meta.env.VITE_LendingPoolAddress,
      value: symbol === 'CFX' ? amount.toHexMinUnit() : '0x0',
      data,
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle Supply ${symbol} Error`, err);
    throw err;
  }
};
