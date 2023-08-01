import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore } from '@cfxjs/use-wallet-react/ethereum/Fluent';
export { connect, sendTransaction, watchAsset, addChain, switchChain } from '@cfxjs/use-wallet-react/ethereum/Fluent';

export const walletState = create(
  subscribeWithSelector(
    () =>
      ({
        account: fluentStore.getState().accounts?.[0],
        chainId: fluentStore.getState().chainId,
      })
  )
);


(function () {
  fluentStore.subscribe(
    (state) => state.accounts,
    (accounts) => walletState.setState({ account: accounts?.[0] })
  );
  fluentStore.subscribe(
    (state) => state.chainId,
    (chainId) => walletState.setState({ chainId })
  );
})();

export const disconnect = () => Promise<void>;