import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'localstorage-enhance';
import { store as ethereumStore, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import { UiPoolDataContract, MulticallContract, createERC20Contract } from '@utils/contracts';
import { isEqual, debounce } from 'lodash-es';

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  supplyTokenAddress: string;
  borrowTokenAddress: string;
}

interface TokenData extends Token {
  /** Token's USD price */
  usdPrice: Unit;
  supplyAPY: Unit;
  borrowAPY: Unit;
  availableLiquidity: Unit;
  canBecollateral: boolean;
  reserveLiquidationThreshold: Unit;
  reserveLiquidationBonus: Unit;
  maxLTV: number;
}

interface UserTokenData {
  address: string;
  collateral: boolean;

  aTokenincentivesUserIndex: Unit;
  principalStableDebt: Unit;
  sTokenincentivesUserIndex: Unit;
  scaledATokenBalance: Unit;
  scaledVariableDebt: Unit;
  stableBorrowLastUpdateTimestamp: Unit;
  stableBorrowRate: Unit;
  vTokenincentivesUserIndex: Unit;
}

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;

  usdPrice?: Unit;
  collateral?: boolean;
  reserveLiquidationThreshold?: Unit;
  availableLiquidity?: Unit;
  maxLTV?: string;
  liquidationThreshold?: string;
  liquidationPenalty?: string;
  canBecollateral?: boolean;

  balance?: Unit;
  supplyBalance?: Unit;
  supplyPrice?: Unit;
  supplyAPY?: Unit;
  totalSupplyBalance?: Unit;
  totalSupplyPrice?: Unit;
  borrowBalance?: Unit;
  borrowPrice?: Unit;
  borrowAPY?: Unit;
  totalBorrowBalance?: Unit;
  totalBorrowPrice?: Unit;
}

interface TokensStore {
  tokensInPool?: Array<Token>;

  tokensData?: Record<string, TokenData>;
  userTokensData?: Record<string, UserTokenData>;
  tokensBalance?: Record<
    string,
    {
      balance?: Unit;
      supplyBalance?: Unit;
      borrowBalance?: Unit;
      totalSupplyBalance?: Unit;
      totalBorrowBalance?: Unit;
    }
  >;

  tokensPrice?: Record<
    string,
    | {
        supplyPrice?: Unit;
        borrowPrice?: Unit;
        totalSupplyPrice?: Unit;
        totalBorrowPrice?: Unit;
      }
    | undefined
  >;

  tokens?: Array<TokenInfo>;
}

export const tokensStore = create(
  subscribeWithSelector(
    () =>
      ({
        tokensInPool: LocalStorage.getItem(`tokensInPool-${import.meta.env.MODE}`) ?? [],
        tokensData: undefined,
        userTokensData: undefined,
        tokensBalance: undefined,
        tokensPrice: undefined,
      } as TokensStore)
  )
);



let unsub: VoidFunction | null = null;
ethereumStore.subscribe(
  (state) => state.accounts,
  (accounts) => {
    unsub?.();

    const account = accounts?.[0];
    if (!account) {
      tokensStore.setState({ tokensData: undefined, userTokensData: undefined });
      return;
    }

    unsub = intervalFetchChain(() => UiPoolDataContract.getReservesData(import.meta.env.VITE_LendingPoolAddressesProviderAddress, account), {
      intervalTime: 1000,
      equalKey: 'UiPoolData',
      callback: (result: any) => {
        const tokensPoolDataArr: Array<TokenData> = result[0]?.map(convertOriginTokenData);
        const tokensData: Record<string, TokenData> = Object.fromEntries(tokensPoolDataArr.map((tokenData: TokenData) => [tokenData.address, tokenData]));
        const tokensInPool = tokensPoolDataArr.map(({ address, name, symbol, decimals, supplyTokenAddress, borrowTokenAddress }) => ({
          address,
          name,
          symbol: symbol === 'WCFX' ? 'CFX' : symbol,
          decimals,
          supplyTokenAddress,
          borrowTokenAddress,
        }));

        if (!isEqual(tokensInPool, tokensStore.getState().tokensInPool)) {
          tokensStore.setState({ tokensInPool });
          LocalStorage.setItem({ key: `tokensInPool-${import.meta.env.MODE}`, data: tokensInPool });
        }

        const userTokensPoolDataArr: Array<UserTokenData> = result[1]?.map(convertOriginUserTokenData);
        const userTokensData: Record<string, UserTokenData> = Object.fromEntries(
          userTokensPoolDataArr.map((userTokenData: UserTokenData) => [userTokenData.address, userTokenData])
        );

        tokensStore.setState({ tokensData, userTokensData });
      },
    });
  },
  { fireImmediately: true }
);



// get token balance && supplyBalance
let unsubBalance: VoidFunction | null = null;
const calcUserBalance = debounce(() => {
  const account = ethereumStore.getState().accounts?.[0];
  const cfxBalance = ethereumStore.getState().balance;
  const tokens = tokensStore.getState().tokensInPool;
  unsubBalance?.();

  if (!account || !tokens?.length) {
    tokensStore.setState({ tokensBalance: undefined });
    return;
  }

  const getBalancePromises = tokens.map(({ address }) => {
    const tokenContract = createERC20Contract(address);
    return [address, tokenContract.interface.encodeFunctionData('balanceOf', [account])];
  });
  const getSupplyBalancePromises = tokens.map(({ supplyTokenAddress }) => {
    const tokenContract = createERC20Contract(supplyTokenAddress);
    return [supplyTokenAddress, tokenContract.interface.encodeFunctionData('balanceOf', [account])];
  });
  const getBrrowBalancePromises = tokens.map(({ borrowTokenAddress }) => {
    const tokenContract = createERC20Contract(borrowTokenAddress);
    return [borrowTokenAddress, tokenContract.interface.encodeFunctionData('balanceOf', [account])];
  });
  const getTotalSupplyBalancePromises = tokens.map(({ supplyTokenAddress }) => {
    const tokenContract = createERC20Contract(supplyTokenAddress);
    return [supplyTokenAddress, tokenContract.interface.encodeFunctionData('totalSupply')];
  });
  const getTotalBrrowBalancePromises = tokens.map(({ borrowTokenAddress }) => {
    const tokenContract = createERC20Contract(borrowTokenAddress);
    return [borrowTokenAddress, tokenContract.interface.encodeFunctionData('totalSupply')];
  });
  const promises = getBalancePromises
    .concat(getSupplyBalancePromises)
    .concat(getBrrowBalancePromises)
    .concat(getTotalSupplyBalancePromises)
    .concat(getTotalBrrowBalancePromises);

  unsubBalance = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises), {
    intervalTime: 1000,
    equalKey: 'tokensBalance',
    callback: (result: { returnData: Array<string> }) => {
      const tokensBalance: TokensStore['tokensBalance'] = Object.fromEntries(tokens.map((token) => [token.address, {}]));

      tokens.forEach((token, index) => {
        if (token.symbol === 'CFX') {
          tokensBalance[token.address].balance = cfxBalance;
        } else {
          tokensBalance[token.address].balance = Unit.fromMinUnit(result?.['returnData']?.[index] ?? 0);
        }

        tokensBalance[token.address].supplyBalance = Unit.fromMinUnit(result?.['returnData']?.[index + tokens.length] ?? 0);
        tokensBalance[token.address].borrowBalance = Unit.fromMinUnit(result?.['returnData']?.[index + tokens.length * 2] ?? 0);
        tokensBalance[token.address].totalSupplyBalance = Unit.fromMinUnit(result?.['returnData']?.[index + tokens.length * 3] ?? 0);
        tokensBalance[token.address].totalBorrowBalance = Unit.fromMinUnit(result?.['returnData']?.[index + tokens.length * 4] ?? 0);
      });
      tokensStore.setState({ tokensBalance });
    },
  });
}, 10);
tokensStore.subscribe((state) => state.tokensInPool, calcUserBalance, { fireImmediately: true });
ethereumStore.subscribe((state) => state.accounts, calcUserBalance, { fireImmediately: true });
ethereumStore.subscribe((state) => state.balance, calcUserBalance, { fireImmediately: true });



// calc supply & borrow Price
const Zero = Unit.fromMinUnit(0);
const calcSupplyTokenPrice = debounce(() => {
  const { tokensData, tokensBalance } = tokensStore.getState();
  if (!tokensData || !tokensBalance) {
    tokensStore.setState({ tokensPrice: undefined });
    return;
  }
  const tokensPrice = Object.fromEntries(
    Object.entries(tokensBalance).map(([address, balances]) => {
      const token: TokenData | undefined = tokensData?.[address];
      if (!balances || !token?.usdPrice) return [address, undefined];
      return [
        address,
        {
          supplyPrice: token.usdPrice.mul(balances.supplyBalance ?? Zero),
          totalSupplyPrice: token.usdPrice.mul(balances.totalSupplyBalance ?? Zero),
          borrowPrice: token.usdPrice.mul(balances.borrowBalance ?? Zero),
          totalBorrowPrice: token.usdPrice.mul(balances.totalBorrowBalance ?? Zero),
        },
      ];
    })
  );
  tokensStore.setState({ tokensPrice });
}, 10);

tokensStore.subscribe((state) => state.tokensBalance, calcSupplyTokenPrice, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensData, calcSupplyTokenPrice, { fireImmediately: true });

const aggregateData = debounce(() => {
  const { tokensInPool, tokensData, userTokensData, tokensBalance, tokensPrice } = tokensStore.getState();
  if (!tokensInPool) {
    tokensStore.setState({ tokens: [] });
    return;
  }
  const tokens = tokensInPool?.map(({ address, symbol, name, decimals }) => ({ address, symbol, name, decimals })) as Array<TokenInfo>;
  tokens.forEach((token) => {
    if (tokensBalance?.[token.address]) {
      Object.assign(token, tokensBalance[token.address])
    }
    if (tokensPrice?.[token.address]) {
      Object.assign(token, tokensPrice[token.address])
    }
    token.supplyAPY = tokensData?.[token.address]?.supplyAPY;
    token.borrowAPY = tokensData?.[token.address]?.borrowAPY;
    token.reserveLiquidationThreshold = tokensData?.[token.address]?.reserveLiquidationThreshold;
    token.availableLiquidity = tokensData?.[token.address]?.availableLiquidity;
    token.usdPrice = tokensData?.[token.address]?.usdPrice;
    token.collateral = userTokensData?.[token.address]?.collateral;
    token.maxLTV = tokensData?.[token.address]?.maxLTV?.toFixed(2);
    token.canBecollateral = tokensData?.[token.address]?.canBecollateral;

    if (tokensData?.[token.address]?.reserveLiquidationThreshold) {
      token.liquidationThreshold = tokensData[token.address].reserveLiquidationThreshold.div(HUNDRED).toDecimalMinUnit(2);
    }
    if (tokensData?.[token.address]?.reserveLiquidationBonus) {
      token.liquidationPenalty = tokensData[token.address].reserveLiquidationBonus.div(HUNDRED).sub(HUNDRED).toDecimalMinUnit();
    }
    // if (token.borrowPrice && token.reserveLiquidationThreshold) {
    //   token.max_borrow_balance = borrowPrice
    // }
  });
  tokensStore.setState({ tokens });
}, 10);

tokensStore.subscribe((state) => state.tokensInPool, aggregateData, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensData, aggregateData, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensBalance, aggregateData, { fireImmediately: true });
tokensStore.subscribe((state) => state.userTokensData, aggregateData, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensPrice, aggregateData, { fireImmediately: true });

const selectors = {
  tokens: (state: TokensStore) => state.tokens,
};

export const useTokens = () => tokensStore(selectors.tokens);





const DECIMAL = Unit.fromMinUnit(10 ** 18);
const RAY = Unit.fromMinUnit(10 ** 27);
const SECONDS_PER_YEAR = Unit.fromMinUnit(31536000);
const ONE = Unit.fromMinUnit(1);
const HUNDRED = Unit.fromMinUnit(100);

const convertOriginTokenData = (originData: any) => {
  const res = {
    address: originData.underlyingAsset,
    name: originData.name,
    symbol: originData.symbol,
    decimals: Number(originData.decimals._hex),
    supplyTokenAddress: originData.aTokenAddress,
    borrowTokenAddress: originData.variableDebtTokenAddress,
    usdPrice: Unit.fromMinUnit(originData.priceInEth._hex).div(DECIMAL),
    availableLiquidity: Unit.fromMinUnit(originData.availableLiquidity._hex),
    canBecollateral: originData.borrowingEnabled,
    reserveLiquidationThreshold: Unit.fromMinUnit(originData.reserveLiquidationThreshold._hex),
    reserveLiquidationBonus: Unit.fromMinUnit(originData.reserveLiquidationBonus._hex),
    maxLTV: Number(originData.baseLTVasCollateral._hex) / 100
  } as TokenData;
  const liquidityRate = Unit.fromMinUnit(originData.liquidityRate._hex);
  const supplyAPR = liquidityRate.div(RAY);
  const supplyAPY = ONE.add(supplyAPR.div(SECONDS_PER_YEAR)).pow(SECONDS_PER_YEAR).sub(ONE);
  res.supplyAPY = supplyAPY;
  const variableBorrowRate = Unit.fromMinUnit(originData.variableBorrowRate._hex);
  const borrowARR = variableBorrowRate.div(RAY);
  const borrowAPY = ONE.add(borrowARR.div(SECONDS_PER_YEAR)).pow(SECONDS_PER_YEAR).sub(ONE);
  res.borrowAPY = borrowAPY;
  return res;
};

const convertOriginUserTokenData = (originData: any) => {
  const res: UserTokenData = {
    address: originData.underlyingAsset,
    collateral: originData.usageAsCollateralEnabledOnUser,

    aTokenincentivesUserIndex: Unit.fromMinUnit(originData.aTokenincentivesUserIndex._hex),
    principalStableDebt: Unit.fromMinUnit(originData.principalStableDebt._hex),
    sTokenincentivesUserIndex: Unit.fromMinUnit(originData.sTokenincentivesUserIndex._hex),
    scaledATokenBalance: Unit.fromMinUnit(originData.scaledATokenBalance._hex),
    scaledVariableDebt: Unit.fromMinUnit(originData.scaledVariableDebt._hex),
    stableBorrowLastUpdateTimestamp: Unit.fromMinUnit(originData.stableBorrowLastUpdateTimestamp._hex),
    stableBorrowRate: Unit.fromMinUnit(originData.stableBorrowRate._hex),
    vTokenincentivesUserIndex: Unit.fromMinUnit(originData.vTokenincentivesUserIndex._hex),
  };
  return res;
};
