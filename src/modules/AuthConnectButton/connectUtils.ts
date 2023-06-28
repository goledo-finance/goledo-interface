import { showToast } from '@components/showPopup/Toast';
import Network from '@utils/Network';
import { walletStore } from '@store/Wallet';
import { walletFunction } from '@utils/wallet';

export async function switchToChain() {
  const wallet = walletStore.getState().wallet;
  const switchChain = walletFunction[wallet.name].switchChain;
  const addChain = walletFunction[wallet.name].addChain;
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
