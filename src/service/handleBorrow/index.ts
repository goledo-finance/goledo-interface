import { sendTransaction, store as walletStore, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { LendingPoolContract, WETHGatewayContract } from '@utils/contracts';
export { default } from './showModal';
console.log(WETHGatewayContract)
export const handleBorrow = async ({ amount, symbol, tokenAddress }: { amount: Unit; symbol:string; tokenAddress: string;}) => {
    const account = walletStore.getState().accounts?.[0];

    try {
        let data: string;
        if (symbol === 'CFX') {
            data = WETHGatewayContract.interface.encodeFunctionData('borrowETH', [import.meta.env.VITE_LendingPoolAddress, amount.toHexMinUnit(), 1, '0']);
        } else {
            data = LendingPoolContract.interface.encodeFunctionData('borrow', [tokenAddress, amount.toHexMinUnit(), account, '0']);
        }

        const TxnHash = await sendTransaction({
            to: symbol === 'CFX' ? import.meta.env.VITE_WETHGatewayAddress : import.meta.env.VITE_LendingPoolAddress,
            value: symbol === 'CFX' ? amount.toHexMinUnit() : '0x0',
            data,
        });
        return TxnHash;
    } catch (err) {
        console.log('handleBorrow Error', err);
        throw err;
    }
}