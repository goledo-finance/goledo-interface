import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as OKXStore } from '@cfxjs/use-wallet-react/ethereum/OKX';
export { connect, sendTransaction, watchAsset, addChain, switchChain } from '@cfxjs/use-wallet-react/ethereum/OKX';

export const walletState = create(
  subscribeWithSelector(() => ({
    account: OKXStore.getState().accounts?.[0],
    chainId: OKXStore.getState().chainId,
  }))
);

(function () {
  OKXStore.subscribe(
    (state) => state.accounts,
    (accounts) => walletState.setState({ account: accounts?.[0] })
  );
  OKXStore.subscribe(
    (state) => state.chainId,
    (chainId) => walletState.setState({ chainId })
  );
})();

export const disconnect = () => Promise<void>;
