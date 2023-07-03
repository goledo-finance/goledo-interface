import { WalletFunction } from '@utils/wallet';
import { create } from 'zustand';
import { Web3Modal } from '@web3modal/standalone';
import { subscribeWithSelector } from 'zustand/middleware';
import CurrentNetwork from '@utils/Network';
import { type sendTransaction as sendTransactionWithMetamask, type watchAsset as watchAssetWithMetamask } from '@cfxjs/use-wallet-react/ethereum';
import { SignClient } from '@walletconnect/sign-client/dist/types/client';
import { SessionTypes } from '@walletconnect/types';

const projectId = '';
const web3Modal = new Web3Modal({
  walletConnectVersion: 2,
  projectId,
  standaloneChains: [`eip155:${CurrentNetwork.chainId}`],
});

let signClient: SignClient;
let session: ReturnType<SignClient['session']['getAll']>[number] | undefined;

export const disconnect = async () => await handleSessionUpdate(undefined);

type ConnectWalletStore = {
  account: string | undefined;
  chainId: string | undefined;
  updateAccount: (_account: string | undefined) => void;
  updateChainId: (_chainId: string | undefined) => void;
};

export const connectWalletStore = create<ConnectWalletStore>()(
  (set) =>
    ({
      account: undefined,
      chainId: undefined,
      updateAccount: (_account: string | undefined) => {
        set({ account: _account });
      },
      updateChainId: (_chainId: string | undefined) => {
        set({ chainId: _chainId });
      },
    } as ConnectWalletStore)
);

export const connect = async () => {
  try {
    console.log(session);
    if (session) return;
    const { uri, approval } = await signClient.connect({
      pairingTopic: signClient.core.pairing.getPairings()?.at(-1)?.topic,
      requiredNamespaces: {
        eip155: {
          methods: ['eth_sendTransaction'],
          chains: [`eip155:${CurrentNetwork.chainId}`],
          events: ['chainChanged', 'accountsChanged'],
        },
      },
    });
    if (uri) {
      web3Modal.openModal({ uri, standaloneChains: ['eip155:1'] });
    }

    const newSession = await approval();
    if (newSession) {
      session = newSession;
      handleSessionUpdate(newSession);
    }
  } catch (e) {
    console.error('err', e);
  } finally {
    web3Modal.closeModal();
  }
};

export const sendTransaction: typeof sendTransactionWithMetamask = async (params) => {
  return signClient.request({
    topic: session!.topic,
    chainId: `eip155:${CurrentNetwork.chainId}`,
    request: {
      method: 'eth_sendTransaction',
      params: [params],
    },
  });
};

export const watchAsset: typeof watchAssetWithMetamask = async (params) => {
  return signClient.request({
    topic: session!.topic,
    chainId: `eip155:${CurrentNetwork.chainId}`,
    request: {
      method: 'wallet_watchAsset',
      params: [params],
    },
  });
};

export const addChain = async () => '';
export const switchChain = async () => '';

const getAccountAndChainIdFromSession = (_session: SessionTypes.Struct | undefined) => {
  if (!_session || (session?.expiry && session.expiry * 1000 - Date.now() < 0)) {
    return {
      account: undefined,
      chainId: undefined,
    };
  }
  const allNamespaceAccounts = Object.values(_session.namespaces)
    .map((namespace) => namespace.accounts)
    .flat();
  const allNamespaceChainIds = Object.values(_session.namespaces)
    .map((namespace) => namespace.chains)
    .flat();

  const _account = allNamespaceAccounts?.[0];
  const _chainId = allNamespaceChainIds?.[0];
  let account: string | undefined;
  let chainId: string | undefined;
  if (!account || !account.startsWith(`eip155:${CurrentNetwork.chainId}:`)) {
    account = undefined;
  } else {
    account = _account.split(`eip155:${CurrentNetwork.chainId}:`)?.[1];
  }

  if (!_chainId || !_chainId.startsWith('eip155:')) {
    chainId = undefined;
  } else {
    chainId = _chainId.split('eip155:')?.[1];
  }

  return {
    account,
    chainId,
  };
};

const handleSessionUpdate = async (_session: SessionTypes.Struct | undefined) => {
  const { account, chainId } = getAccountAndChainIdFromSession(_session);
  if (account) {
    connectWalletStore.getState().updateAccount(account);
    if (chainId) {
      connectWalletStore.getState().updateChainId(chainId);
    }
  } else {
    connectWalletStore.getState().updateAccount(undefined);
    connectWalletStore.getState().updateChainId(undefined);

    const lastTopic = signClient.core.pairing.getPairings()?.at(-1);
    if (lastTopic) {
      signClient.core.pairing.disconnect({
        topic: lastTopic?.topic!,
      });
    }
    if (session) {
      await signClient.disconnect({
        topic: session?.topic!,
        reason: {
          code: 12,
          message: 'disconnect',
        },
      });
      session = undefined;
    }
  }
};

(async function () {
  const client = await SignClient.init({
    projectId,
    metadata: {
      name: 'Example Dapp',
      description: 'Example Dapp',
      url: window.location.host,
      icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
  });
  signClient = client;
  session = signClient.session.getAll()?.at(-1);
  const lastTopic = signClient.core.pairing.getPairings()?.at(-1);
  if (session) {
    handleSessionUpdate(session);
  }
  if (!session && lastTopic) {
    signClient.core.pairing.disconnect({
      topic: lastTopic?.topic!,
    });
  }

  signClient.on('session_update', ({ topic, params }) => {
    console.log('session_update');
    handleSessionUpdate(signClient.session.get(topic));
  });

  signClient.on('session_delete', () => {
    console.log('session_delete');
    handleSessionUpdate(undefined);
  });
})();
