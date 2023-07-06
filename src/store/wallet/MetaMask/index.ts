import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as metamaskStore } from '@cfxjs/use-wallet-react/ethereum';
export { connect, sendTransaction, watchAsset, addChain, switchChain } from '@cfxjs/use-wallet-react/ethereum';

export const walletState = create(
  subscribeWithSelector(
    () =>
      ({
        account: metamaskStore.getState().accounts?.[0],
        chainId: metamaskStore.getState().chainId,
      })
  )
);


(function () {
  metamaskStore.subscribe(
    (state) => state.accounts,
    (accounts) => {
      walletState.setState({ account: accounts?.[0] });
      console.log('metamaskStore.subscribe', accounts?.[0])
    }
  );
  metamaskStore.subscribe(
    (state) => state.chainId,
    (chainId) => walletState.setState({ chainId })
  );
})();

export const disconnect = () => Promise<void>;