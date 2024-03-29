import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { accountMethodFilter, sendTransaction } from '@store/wallet';
import { LendingPoolContract, WETHGatewayContract } from '@utils/contracts';
export { default } from './showModal';

export const createCFXData = ({ amount, account }: { amount: string; account: string }) =>
  WETHGatewayContract.interface.encodeFunctionData('repayCFX', [import.meta.env.VITE_LendingPoolAddress, amount, 2, account]);

export const handleRepay = async ({ amount, symbol, tokenAddress }: { amount: Unit; symbol: string; tokenAddress: string }) => {
  const account = accountMethodFilter.getState().accountState;
  try {
    let data: string;
    if (symbol === 'CFX') {
      data = WETHGatewayContract.interface.encodeFunctionData('repayCFX', [import.meta.env.VITE_LendingPoolAddress, amount.toHexMinUnit(), 2, account]);
    } else {
      data = LendingPoolContract.interface.encodeFunctionData('repay', [tokenAddress, amount.toHexMinUnit(), 2, account]);
    }

    const TxnHash = await sendTransaction({
      to: symbol === 'CFX' ? import.meta.env.VITE_WETHGatewayAddress : import.meta.env.VITE_LendingPoolAddress,
      value: symbol === 'CFX' ? amount.toHexMinUnit() : '0x0',
      data,
    });
    return TxnHash;
  } catch (err) {
    console.log('handleRepay Error', err);
    throw err;
  }
};
