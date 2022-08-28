import { showToast } from '@components/showPopup/Toast';
import { connect, switchChain, addChain } from '@cfxjs/use-wallet-react/ethereum';
import Network from '@utils/Network';

export async function connectToWallet() {
    try {
        const accounts = await connect();
        showToast(`Connect to Wallet Success!`, { type: 'success' });
        return accounts?.[0];
    } catch (err) {
        if ((err as any)?.code === 4001) {
            showToast('You cancel the connection reqeust.', { type: 'failed' });
        }
    }
    return undefined;
}

export async function switchToChain() {
    try {
        await switchChain('0x' + Number(Network.chainId).toString(16));
        showToast(`Switch Wallet to ${Network.chainName} Success!`, { type: 'success' });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if ((switchError as any)?.code === 4902) {
            try {
                await addChain({
                    ...Network,
                    chainId: '0x' + Number(Network.chainId).toString(16),
                });
                showToast(`Add ${Network.chainName} to Wallet Success!`, { type: 'success' });
            } catch (addError) {
                if ((addError as any)?.code === 4001) {
                    showToast('You cancel the add chain reqeust.', { type: 'failed' });
                }
            }
        } else if ((switchError as any)?.code === 4001) {
            showToast('You cancel the switch chain reqeust.', { type: 'failed' });
        }
    }
}
