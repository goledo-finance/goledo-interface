import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as fluentStore } from '@cfxjs/use-wallet-react/ethereum/Fluent';
export { connect, sendTransaction, watchAsset, addChain, switchChain } from '@cfxjs/use-wallet-react/ethereum/Fluent';

export const walletState = create(
  subscribeWithSelector(
    () =>
      ({
        account: '0xEB606821b7a324304FC652ad0c2F0D38087D0Eee',
        chainId: fluentStore.getState().chainId,
      })
  )
);


(function () {
  fluentStore.subscribe(
    (state) => state.accounts,
    (accounts) => walletState.setState({ account: '0xEB606821b7a324304FC652ad0c2F0D38087D0Eee'})
  );
  fluentStore.subscribe(
    (state) => state.chainId,
    (chainId) => walletState.setState({ chainId })
  );
})();

export const disconnect = () => Promise<void>;