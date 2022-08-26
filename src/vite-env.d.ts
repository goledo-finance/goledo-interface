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
  readonly VITE_UiPoolDataProviderAddress: string;
  readonly VITE_LendingPoolAddress: string;
  readonly VITE_LendingPoolAddressesProviderAddress: string;
  readonly VITE_MulticallContract: string;
  readonly VITE_MultiFeeDistributionAddress: string;
  readonly VITE_GoledoTokenAddress: string;
  readonly VITE_ChefIncentivesControllerContractAddress: string;
  readonly VITE_MasterChefAddress: string;
  readonly VITE_SwappiPairAddress: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type OverWrite<T, U> = Omit<T, keyof U> & U;
type PartialOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
