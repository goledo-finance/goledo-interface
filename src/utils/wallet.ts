import MetaMaskIcon from '@assets/icons/MetaMask.svg';
import Halo from '@assets/icons/Halo.svg';
import TokenPocket from '@assets/icons/TokenPocket.svg';
import FluentIcon from '@assets/icons/Fluent.svg';
import OKXIcon from '@assets/icons/OKX.svg';
import WalletConnetIcon from '@assets/icons/WalletConnect.svg';
import {
  connect as MetaMaskConnect,
  useStatus as useMetaMaskStatus,
  useChainId as useMetaMaskChainId,
  switchChain as switchMetaMaskChain,
  addChain as addMetaMaskChain,
  useAccount as useMetaMaskAccount,
  sendTransaction as sendMetaMaskTransation,
  useBalance as useMetaMaskBalance,
  Unit,
  store as MetaMaskStore,
} from '@cfxjs/use-wallet-react/ethereum';
import {
  connect as FluentConnect,
  useStatus as useFluentStatus,
  useChainId as useFluentChainId,
  switchChain as switchFluentChain,
  addChain as addFluentChain,
  useAccount as useFluentAccount,
  sendTransaction as sendFluentTransaction,
  useBalance as useFluentBalance,
  store as FluentStore,
} from '@cfxjs/use-wallet-react/ethereum/Fluent';
import {
  connect as OKXConnect,
  useStatus as useOKXStatus,
  useChainId as useOKXChainId,
  switchChain as switchOKXChain,
  addChain as addOKXChain,
  useAccount as useOKXAccount,
  sendTransaction as sendOKXTransaction,
  useBalance as useOKXBalance,
  store as OKXStore,
} from '@cfxjs/use-wallet-react/ethereum/OKX';
import { AddChainParameter, TransactionParameters } from '@cfxjs/use-wallet-react/ethereum/type';

export interface Wallet {
  name: string;
  icon: Array<string>;
}

export interface WalletFunction {
  connect: () => Promise<string[]>;
  useStatus: () => 'in-detecting' | 'not-installed' | 'not-active' | 'in-activating' | 'active' | 'chain-error';
  useChainId: () => string | undefined;
  switchChain: (chainId: string) => Promise<string>;
  addChain: (params: AddChainParameter) => Promise<string>;
  useAccount: () => string | undefined;
  sendTransaction: (params: Omit<TransactionParameters, 'from'>) => Promise<string>;
  useBalance: () => Unit | undefined;
  store: typeof MetaMaskStore;
}

export const walletFunction: Record<string, WalletFunction> = {
  'MetaMask Compatible': {
    connect: MetaMaskConnect,
    useStatus: useMetaMaskStatus,
    useChainId: useMetaMaskChainId,
    switchChain: switchMetaMaskChain,
    addChain: addMetaMaskChain,
    useAccount: useMetaMaskAccount,
    sendTransaction: sendMetaMaskTransation,
    useBalance: useMetaMaskBalance,
    store: MetaMaskStore,
  },
  Fluent: {
    connect: FluentConnect,
    useStatus: useFluentStatus,
    useChainId: useFluentChainId,
    switchChain: switchFluentChain,
    addChain: addFluentChain,
    useAccount: useFluentAccount,
    sendTransaction: sendFluentTransaction,
    useBalance: useFluentBalance,
    store: FluentStore,
  },
  OKX: {
    connect: OKXConnect,
    useStatus: useOKXStatus,
    useChainId: useOKXChainId,
    switchChain: switchOKXChain,
    addChain: addOKXChain,
    useAccount: useOKXAccount,
    sendTransaction: sendOKXTransaction,
    useBalance: useOKXBalance,
    store: OKXStore,
  },
  WalletConnect: {
    connect: MetaMaskConnect, //
    useStatus: useMetaMaskStatus, //
    useChainId: useMetaMaskChainId, //
    switchChain: switchMetaMaskChain, //
    addChain: addMetaMaskChain, //
    useAccount: useMetaMaskAccount, //
    sendTransaction: sendMetaMaskTransation, //
    useBalance: useMetaMaskBalance, //
    store: MetaMaskStore, //
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
