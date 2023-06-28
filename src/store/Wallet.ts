import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { walletConfig, Wallet } from '@utils/wallet';
import LocalStorage from 'localstorage-enhance';

interface WalletStore {
  wallet: Wallet;
}

export const walletStore = create(
  subscribeWithSelector(
    () =>
      ({
        wallet: (LocalStorage.getItem('wallet') as Wallet) ?? walletConfig[0],
      } as WalletStore)
  )
);

const selectors = {
  wallet: (state: WalletStore) => state.wallet,
};

export const useWalletStore = () => walletStore(selectors.wallet);

export const setWalletStore = (wallet: Wallet) => {
  LocalStorage.setItem({ key: 'wallet', data: wallet });
  walletStore.setState({ wallet });
};
