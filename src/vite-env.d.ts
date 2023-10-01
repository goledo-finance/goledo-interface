/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.styl' {
  const classes: { [key: string]: string };
  export default classes;
}

interface ImportMetaEnv {
  readonly VITE_ESpaceRpcUrl: string;
  readonly VITE_ESpaceScanUrl: string;
  readonly VITE_UiPoolDataProviderAddress: string;
  readonly VITE_LendingPoolAddress: string;
  readonly VITE_LendingPoolAddressesProviderAddress: string;
  readonly VITE_MulticallContract: string;
  readonly VITE_MultiFeeDistributionAddress: string;
  readonly VITE_MultiFeeDistributionAddressV1: string;
  readonly VITE_GoledoTokenAddress: string;
  readonly VITE_ChefIncentivesControllerContractAddress: string;
  readonly VITE_MasterChefAddress: string;
  readonly VITE_SwappiPairAddress: string;
  readonly VITE_WETHGatewayAddress: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type OverWrite<T, U> = Omit<T, keyof U> & U;
type PartialOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type PartialOmit<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
