import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import LocalStorage from 'localstorage-enhance';
import MetaMaskIcon from '@assets/icons/MetaMask.svg';
import Halo from '@assets/icons/Halo.svg';
import TokenPocket from '@assets/icons/TokenPocket.svg';
import FluentIcon from '@assets/icons/Fluent.svg';
import OKXIcon from '@assets/icons/OKX.svg';
import WalletConnetIcon from '@assets/icons/WalletConnect.svg';
import {
  walletState as fluentState,
  connect as connectFluent,
  disconnect as disconnectFluent,
  switchChain as switchChainFluent,
  addChain as addChainFluent,
  sendTransaction as sendTransactionWithFluent,
  watchAsset as watchAssetFluent,
} from '@store/wallet/Fluent';
import {
  walletState as metamaskState,
  connect as connectMetamask,
  disconnect as disconnectMetamask,
  switchChain as switchChainMetamask,
  addChain as addChainMetamask,
  sendTransaction as sendTransactionWithMetamask,
  watchAsset as watchAssetMetamask,
} from '@store/wallet/MetaMask';
import {
  walletState as OKXState,
  connect as connectOKX,
  disconnect as disconnectOKX,
  switchChain as switchChainOKX,
  addChain as addChainOKX,
  sendTransaction as sendTransactionWithOKX,
  watchAsset as watchAssetOKX,
} from '@store/wallet/OKX';
import {
  walletState as walletConnectState,
  connect as connectWalletConnect,
  disconnect as disconnectWalletConnect,
  switchChain as switchChainWalletConnect,
  addChain as addChainWalletConnect,
  sendTransaction as sendTransactionWithWalletConnect,
  watchAsset as watchAssetWalletConnect,
} from '@store/wallet/WalletConnect';
import CurrentNetwork from '@utils/Network';
import { showToast } from '@components/showPopup/Toast';
import { debounce } from 'lodash-es';
import { intervalFetchChain } from '@utils/fetchChain';

export interface Wallet {
  name: string;
  icon: Array<string>;
}

export const walletFunction = {
  'MetaMask Compatible': {
    walletState: metamaskState,
    connect: connectMetamask,
    switchChain: switchChainMetamask,
    addChain: addChainMetamask,
    sendTransaction: sendTransactionWithMetamask,
    disconnect: disconnectMetamask,
    watchAsset: watchAssetMetamask,
  },
  Fluent: {
    walletState: fluentState,
    connect: connectFluent,
    switchChain: switchChainFluent,
    addChain: addChainFluent,
    sendTransaction: sendTransactionWithFluent,
    disconnect: disconnectFluent,
    watchAsset: watchAssetFluent,
  },
  OKX: {
    walletState: OKXState,
    connect: connectOKX,
    switchChain: switchChainOKX,
    addChain: addChainOKX,
    sendTransaction: sendTransactionWithOKX,
    disconnect: disconnectOKX,
    watchAsset: watchAssetOKX,
  },
  WalletConnect: {
    walletState: walletConnectState,
    connect: connectWalletConnect,
    switchChain: switchChainWalletConnect,
    addChain: addChainWalletConnect,
    sendTransaction: sendTransactionWithWalletConnect,
    disconnect: disconnectWalletConnect,
    watchAsset: watchAssetWalletConnect,
  },
};

export const walletConfig: Array<Wallet> = [
  {
    name: 'MetaMask Compatible',
    icon: [MetaMaskIcon, Halo, TokenPocket],
  },
  {
    name: 'Fluent',
    icon: [FluentIcon],
  },
  {
    name: 'OKX',
    icon: [OKXIcon],
  },
  {
    name: 'WalletConnect',
    icon: [WalletConnetIcon],
  },
];

export type Methods = keyof typeof walletFunction;
interface AccountMethodFilter {
  accountFilter: Methods | null;
  accountState: null | string | undefined;
  chainIdState: null | string | undefined;
}

export const accountMethodFilter = create(
  subscribeWithSelector(
    () =>
      ({
        accountFilter: (LocalStorage.getItem('accountFilter') as Methods) ?? null,
        accountState: LocalStorage.getItem('accountState'),
        chainIdState: LocalStorage.getItem('chainIdState'),
      } as AccountMethodFilter)
  )
);

const selectors = {
  accountMethodFilter: (state: AccountMethodFilter) => state.accountFilter,
  accountState: (state: AccountMethodFilter) => state.accountState,
  chainIdState: (state: AccountMethodFilter) => state.chainIdState,
};

let unsubAccount: VoidFunction | null = null;
let unsubChainId: VoidFunction | null = null;
const updateState = debounce(() => {
  if (unsubAccount) {
    unsubAccount();
    unsubAccount = null;
  }
  if (unsubChainId) {
    unsubChainId();
    unsubChainId = null;
  }
  const method = accountMethodFilter.getState().accountFilter;
  if (!method) {
    setAccountState(null);
    setChainIdState(null);
    return;
  }
  const walletState = walletFunction[method]?.walletState;
  setAccountState(walletState.getState().account);
  setChainIdState(walletState.getState().chainId);
  unsubAccount = walletState.subscribe(
    (state) => state.account,
    (account) => setAccountState(account)
  );
  unsubChainId = walletState.subscribe(
    (state) => state.chainId,
    (chainId) => setChainIdState(chainId)
  );
});

accountMethodFilter.subscribe((state) => state.accountFilter, updateState, { fireImmediately: true });

export const connect = async (method: Methods) => {
  try {
    await walletFunction[method].connect();
    setAccountMethod(method);
  } catch (err) {
    throw err;
  }
};

export const disconnect = async () => {
  try {
    const currentMethod = accountMethodFilter.getState().accountFilter;
    if (currentMethod) {
      await walletFunction[currentMethod].disconnect();
    }
    setAccountMethod(null);
  } catch (err) {
    throw err;
  }
};

export const switchChain = async () => {
  const method = accountMethodFilter.getState().accountFilter;
  if (!method) return;
  try {
    await walletFunction[method].switchChain('0x' + Number(CurrentNetwork.chainId).toString(16));
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if ((switchError as any)?.code === 4902) {
      try {
        await walletFunction[method].addChain({
          ...CurrentNetwork,
          chainId: '0x' + Number(CurrentNetwork.chainId).toString(16),
        });
        showToast(`Add ${CurrentNetwork.chainName} to ${method.charAt(0).toUpperCase() + method.slice(1)} Success!`, { type: 'success' });
      } catch (addError) {
        if ((addError as any)?.code === 4001) {
          showToast('You cancel the add chain reqeust.', { type: 'failed' });
        }
      }
    } else if ((switchError as any)?.code === 4001) {
      showToast('You cancel the switch chain reqeust.', { type: 'failed' });
    }
  }
};

export const sendTransaction = async (params: Parameters<typeof sendTransactionWithFluent>[0]) => {
  const accountMethod = accountMethodFilter.getState().accountFilter;
  if (!accountMethod) {
    throw new Error('No account connected');
  }
  return walletFunction[accountMethod].sendTransaction(params);
};

export const watchAsset = (params: Parameters<typeof watchAssetFluent>[0]) => {
  const method = useAccountMethod();
  if (!method) return;
  return walletFunction[method].watchAsset(params);
};

export const useAccountMethod = () => accountMethodFilter(selectors.accountMethodFilter);
export const setAccountMethod = (method: Methods | null) => {
  LocalStorage.setItem({ key: 'accountFilter', data: method });
  accountMethodFilter.setState({ accountFilter: method });
};
export const useAccount = () => accountMethodFilter(selectors.accountState);
export const setAccountState = (account: string | undefined | null) => {
  LocalStorage.setItem({ key: 'accountStatus', data: account });
  accountMethodFilter.setState({ accountState: account });
};
export const useChainId = () => accountMethodFilter(selectors.chainIdState);
export const setChainIdState = (chainId: string | undefined | null) => {
  LocalStorage.setItem({ key: 'chainIdStatus', data: chainId });
  accountMethodFilter.setState({ chainIdState: chainId });
};

export const balanceStore = create(
  subscribeWithSelector(() => ({
    balance: undefined as Unit | undefined,
  }))
);

export const useBalance = () => balanceStore((state) => state.balance);

(function () {
  let unsub: VoidFunction | null = null;

  accountMethodFilter.subscribe(
    (state) => state.accountState,
    (account) => {
      if (unsub) {
        unsub?.();
        unsub = null;
      }
      if (!account) {
        balanceStore.setState({ balance: undefined });
        return;
      }
      unsub = intervalFetchChain(
        {
          rpcUrl: import.meta.env.VITE_ESpaceRpcUrl,
          method: 'eth_getBalance',
          params: [account, 'latest'],
        },
        {
          intervalTime: 5000,
          equalKey: 'cfxBalance',
          callback: (data: string) => {
            balanceStore.setState({ balance: Unit.fromMinUnit(data) });
          },
        }
      );
    }
  );
})();
