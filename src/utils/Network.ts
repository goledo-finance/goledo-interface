export interface Network {
    chainId: string;
    chainName: string;
    rpcUrls: [string, ...string[]];
    blockExplorerUrls: [string, ...string[]];
    nativeCurrency: {
        name:  string;
        symbol: string;
        decimals: number;
    },
}

const TestNet: Network = {
    chainId: "71",
    chainName: "Conflux eSpace (Testnet)",
    rpcUrls: ["https://evmtestnet.confluxrpc.com"],
    blockExplorerUrls: ["https://evmtestnet.confluxscan.net"],
    nativeCurrency: {
        name: 'Conflux',
        symbol: 'CFX',
        decimals: 18,
    }
};

const MainNet: Network = {
    chainId: "1030",
    chainName: "Conflux eSpace",
    rpcUrls: ["https://evm.confluxrpc.com"],
    blockExplorerUrls: ["https://evm.confluxscan.net"],
    nativeCurrency: {
        name: 'Conflux',
        symbol: 'CFX',
        decimals: 18,
    }
}

const CurrentNetwork = import.meta.env.MODE === 'production' ? MainNet : TestNet;

export default CurrentNetwork;