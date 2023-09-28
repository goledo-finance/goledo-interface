import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'localstorage-enhance';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import {
  UiPoolDataContract,
  LendingPoolContract,
  MultiFeeDistributionContract,
  MulticallContract,
  ChefIncentivesControllerContract,
  createERC20Contract,
} from '@utils/contracts';
import { isEqual, debounce } from 'lodash-es';
import { accountMethodFilter, balanceStore } from './wallet';

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
  canBeCollateral: boolean;
  reserveLiquidationThreshold: Unit;
  reserveLiquidationBonus: Unit;
  maxLTV: number;
  availableBorrowBalance: Unit;
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

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  supplyTokenAddress: string;
  borrowTokenAddress: string;

  usdPrice?: Unit;
  collateral?: boolean;
  reserveLiquidationThreshold?: Unit;
  availableLiquidity?: Unit;
  maxLTV?: string;
  liquidationThreshold?: string;
  liquidationPenalty?: string;
  canBeCollateral?: boolean;

  balance?: Unit;
  wcfxBalance?: Unit;
  supplyBalance?: Unit;
  supplyPrice?: Unit;
  supplyAPY?: Unit;
  totalMarketSupplyBalance?: Unit;
  totalMarketSupplyPrice?: Unit;
  borrowBalance?: Unit;
  borrowPrice?: Unit;
  borrowAPY?: Unit;
  totalMarketBorrowBalance?: Unit;
  totalMarketBorrowPrice?: Unit;
  availableBorrowBalance?: Unit;
  earnedGoledoBalance?: Unit;
}

export interface TokensStore {
  cfxUsdPrice?: Unit;
  tokensInPool?: Array<Token>;

  tokensData?: Record<string, TokenData>;
  userTokensData?: Record<string, UserTokenData>;
  tokensBalance?: Record<
    string,
    {
      name?: string;
      balance?: Unit;
      wcfxBalance?: Unit;
      supplyBalance?: Unit;
      borrowBalance?: Unit;
      totalMarketSupplyBalance?: Unit;
      totalMarketBorrowBalance?: Unit;
      earnedGoledoBalance?: Unit;
    }
  >;

  tokensPrice?: Record<
    string,
    | {
        supplyPrice?: Unit;
        borrowPrice?: Unit;
        totalMarketSupplyPrice?: Unit;
        totalMarketBorrowPrice?: Unit;
      }
    | undefined
  >;

  tokens?: Array<TokenInfo>;
  curUserSupplyPrice?: Unit;
  curUserSupplyAPY?: Unit;
  curUserBorrowPrice?: Unit;
  curUserBorrowAPY?: Unit;
  userData?: {
    healthFactor: string;
    borrowPowerUsed: string;
    availableBorrowsUSD: Unit;
    loanToValue: string;
  };
  claimableFees?: Array<{ name: string; symbol: string; address: string; supplyTokenAddress: string; decimals: number; balance: Unit; price: Unit }>;
  claimableFeesV1?: Array<{ name: string; symbol: string; address: string; supplyTokenAddress: string; decimals: number; balance: Unit; price: Unit }>;
}

export const tokensStore = create(subscribeWithSelector(() => ({ tokensInPool: LocalStorage.getItem(`tokensInPool-${import.meta.env.MODE}`) } as TokensStore)));

let unsub: VoidFunction | null = null;

accountMethodFilter.subscribe(
  (state) => state.accountState,
  (account) => {
    unsub?.();

    if (!account) {
      tokensStore.setState({
        tokensData: undefined,
        userTokensData: undefined,
        curUserSupplyPrice: undefined,
        curUserSupplyAPY: undefined,
        curUserBorrowPrice: undefined,
        curUserBorrowAPY: undefined,
        userData: undefined,
      });
      return;
    }

    const promises = [
      [import.meta.env.VITE_LendingPoolAddress, LendingPoolContract.interface.encodeFunctionData('getUserAccountData', [account])],
      [
        import.meta.env.VITE_UiPoolDataProviderAddress,
        UiPoolDataContract.interface.encodeFunctionData('getReservesData', [import.meta.env.VITE_LendingPoolAddressesProviderAddress, account]),
      ],
      [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('claimableRewards', [account])],
      [import.meta.env.VITE_MultiFeeDistributionAddressV1, MultiFeeDistributionContract.interface.encodeFunctionData('claimableRewards', [account])],
    ];
    
    unsub = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises), {
      intervalTime: 5000,
      callback: ({ returnData }: { returnData?: Array<any> } = { returnData: undefined }) => {
        const userAccountData = LendingPoolContract.interface.decodeFunctionResult('getUserAccountData', returnData?.[0]);
        const availableBorrowsUSD = Unit.fromMinUnit(userAccountData?.availableBorrowsETH?._hex ?? 0);
        const totalDebtUSD = Unit.fromMinUnit(userAccountData?.totalDebtETH?._hex ?? 0);
        const userData = {
          healthFactor: Unit.fromMinUnit(userAccountData?.healthFactor?._hex ?? 0).toDecimalStandardUnit(),
          borrowPowerUsed: totalDebtUSD.div(totalDebtUSD.add(availableBorrowsUSD)).mul(Hundred).toDecimalMinUnit(2),
          availableBorrowsUSD,
          loanToValue: Unit.fromMinUnit(userAccountData?.ltv?._hex ?? 0)
            .div(Unit.fromMinUnit(10000))
            .toDecimalMinUnit(),
        };
        if (userData.healthFactor.indexOf('e+') !== -1) {
          userData.healthFactor = 'Infinity';
        } else if (userData.healthFactor.indexOf('e-') !== -1) {
          userData.healthFactor = '0';
        } else userData.healthFactor = Unit.fromMinUnit(userAccountData?.healthFactor?._hex ?? 0).toDecimalStandardUnit(2);

        const reservesData = UiPoolDataContract.interface.decodeFunctionResult('getReservesData', returnData?.[1]);
        const tokensPoolDataArr: Array<TokenData> = reservesData[0]?.map((token: any) => convertOriginTokenData(token, availableBorrowsUSD));
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

        const userTokensPoolDataArr: Array<UserTokenData> = reservesData[1]?.map(convertOriginUserTokenData);
        const userTokensData: Record<string, UserTokenData> = Object.fromEntries(
          userTokensPoolDataArr.map((userTokenData: UserTokenData) => [userTokenData.address, userTokenData])
        );

        const claimableFeesData = MultiFeeDistributionContract.interface.decodeFunctionResult('claimableRewards', returnData?.[2]);
        const claimableFees: TokensStore['claimableFees'] = claimableFeesData?.[0]?.map((data: any) => {
          const targetToken = tokensInPool.find((token) => token.supplyTokenAddress === data.token);
          const balance = Unit.fromMinUnit(data.amount._hex ?? 0);
          if (!targetToken) {
            return {
              address: import.meta.env.VITE_GoledoTokenAddress,
              supplyTokenAddress: import.meta.env.VITE_GoledoTokenAddress,
              balance,
              name: 'Goledo',
              symbol: 'GOL',
              decimals: 18,
            };
          }
          return {
            address: targetToken?.address,
            supplyTokenAddress: targetToken?.supplyTokenAddress,
            balance,
            price: tokensData[targetToken?.address]?.usdPrice?.mul(balance),
            name: targetToken?.name,
            symbol: targetToken?.symbol,
            decimals: targetToken?.decimals,
          };
        });

        const claimableFeesDataV1 = MultiFeeDistributionContract.interface.decodeFunctionResult('claimableRewards', returnData?.[3]);
        const claimableFeesV1: TokensStore['claimableFeesV1'] = claimableFeesDataV1?.[0]?.map((data: any) => {
          const targetToken = tokensInPool.find((token) => token.supplyTokenAddress === data.token);
          const balance = Unit.fromMinUnit(data.amount._hex ?? 0);
          if (!targetToken) {
            return {
              address: import.meta.env.VITE_GoledoTokenAddress,
              supplyTokenAddress: import.meta.env.VITE_GoledoTokenAddress,
              balance,
              name: 'Goledo',
              symbol: 'GOL',
              decimals: 18,
            };
          }
          return {
            address: targetToken?.address,
            supplyTokenAddress: targetToken?.supplyTokenAddress,
            balance,
            price: tokensData[targetToken?.address]?.usdPrice?.mul(balance),
            name: targetToken?.name,
            symbol: targetToken?.symbol,
            decimals: targetToken?.decimals,
          };
        });

        tokensStore.setState({ tokensData, userTokensData, userData, claimableFees, claimableFeesV1 });
      },
    });
  },
  { fireImmediately: true }
);

// get balances
let unsubBalance: VoidFunction | null = null;
const calcUserBalance = debounce(() => {
  const account = accountMethodFilter.getState().accountState;
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
  const getNamePromises = tokens.map(({ address }) => {
    const tokenContract = createERC20Contract(address);
    return [address, tokenContract.interface.encodeFunctionData('name')];
  });

  const promises = getBalancePromises
    .concat(getSupplyBalancePromises)
    .concat(getBrrowBalancePromises)
    .concat(getTotalSupplyBalancePromises)
    .concat(getTotalBrrowBalancePromises)
    .concat(getNamePromises);

  promises.push([
    import.meta.env.VITE_ChefIncentivesControllerContractAddress,
    ChefIncentivesControllerContract.interface.encodeFunctionData('claimableReward', [
      account,
      tokens.map((token) => token.borrowTokenAddress).concat(tokens.map((token) => token.supplyTokenAddress)),
    ]),
  ]);

  unsubBalance = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises), {
    intervalTime: 5000,
    equalKey: 'tokensBalance',
    callback: (result: { returnData: any }) => {
      const tokensBalance: TokensStore['tokensBalance'] = Object.fromEntries(tokens.map((token) => [token.address, {}]));
      const eachTokenEarnedGoledoBalance = ChefIncentivesControllerContract.interface.decodeFunctionResult(
        'claimableReward',
        result?.['returnData']?.at(-1)
      )?.[0];

      tokens.forEach((token, index) => {
        if (token.symbol === 'CFX') {
          tokensBalance[token.address].name = 'CFX';
          tokensBalance[token.address].balance = balanceStore.getState().balance;
          tokensBalance[token.address].wcfxBalance = Unit.fromMinUnit(result?.['returnData']?.[index] ?? 0);
        } else {
          tokensBalance[token.address].balance = Unit.fromMinUnit(result?.['returnData']?.[index] ?? 0);
          const tokenContract = createERC20Contract(token.address);
          tokensBalance[token.address].name = tokenContract.interface.decodeFunctionResult('name', result?.['returnData']?.[index + tokens.length * 5])?.[0];
        }

        tokensBalance[token.address].supplyBalance = Unit.fromMinUnit(result?.['returnData']?.[index + tokens.length] ?? 0);
        tokensBalance[token.address].borrowBalance = Unit.fromMinUnit(result?.['returnData']?.[index + tokens.length * 2] ?? 0);
        tokensBalance[token.address].totalMarketSupplyBalance = Unit.fromMinUnit(result?.['returnData']?.[index + tokens.length * 3] ?? 0);
        tokensBalance[token.address].totalMarketBorrowBalance = Unit.fromMinUnit(result?.['returnData']?.[index + tokens.length * 4] ?? 0);
        tokensBalance[token.address].earnedGoledoBalance = Unit.fromMinUnit(eachTokenEarnedGoledoBalance?.[index]?._hex ?? 0).add(
          Unit.fromMinUnit(eachTokenEarnedGoledoBalance?.[index + tokens.length]?._hex ?? 0)
        );
      });

      tokensStore.setState({ tokensBalance });
    },
  });
}, 10);
tokensStore.subscribe((state) => state.tokensInPool, calcUserBalance, { fireImmediately: true });
accountMethodFilter.subscribe((state) => state.accountFilter, calcUserBalance, { fireImmediately: true });
accountMethodFilter.subscribe((state) => state.accountState, calcUserBalance, { fireImmediately: true });
accountMethodFilter.subscribe((state) => state.chainIdState, calcUserBalance, { fireImmediately: true });
balanceStore.subscribe((state) => state.balance, calcUserBalance, { fireImmediately: true });

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
          totalMarketSupplyPrice: token.usdPrice.mul(balances.totalMarketSupplyBalance ?? Zero),
          borrowPrice: token.usdPrice.mul(balances.borrowBalance ?? Zero),
          totalMarketBorrowPrice: token.usdPrice.mul(balances.totalMarketBorrowBalance ?? Zero),
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
  const account = accountMethodFilter.getState().accountState;
  if (!account || !tokensInPool?.length) {
    tokensStore.setState({
      tokens: undefined,
      curUserSupplyPrice: undefined,
      curUserSupplyAPY: undefined,
      curUserBorrowPrice: undefined,
      curUserBorrowAPY: undefined,
    });
    return;
  }

  const tokens = tokensInPool?.map(({ address, symbol, name, decimals, supplyTokenAddress, borrowTokenAddress }) => ({
    address,
    symbol,
    name,
    decimals,
    supplyTokenAddress,
    borrowTokenAddress,
  })) as Array<TokenInfo>;
  tokens.forEach((token) => {
    if (tokensBalance?.[token.address]) {
      Object.assign(token, tokensBalance[token.address]);
    }
    if (tokensPrice?.[token.address]) {
      Object.assign(token, tokensPrice[token.address]);
    }
    token.supplyAPY = tokensData?.[token.address]?.supplyAPY;
    token.borrowAPY = tokensData?.[token.address]?.borrowAPY;
    token.reserveLiquidationThreshold = tokensData?.[token.address]?.reserveLiquidationThreshold;
    token.usdPrice = tokensData?.[token.address]?.usdPrice;
    token.collateral = userTokensData?.[token.address]?.collateral;
    token.maxLTV = tokensData?.[token.address]?.maxLTV?.toFixed(2);
    token.canBeCollateral = tokensData?.[token.address]?.canBeCollateral;
    token.availableLiquidity = tokensData?.[token.address]?.availableLiquidity;
    token.availableBorrowBalance = tokensData?.[token.address]?.availableBorrowBalance;
    if (tokensData?.[token.address]?.reserveLiquidationThreshold) {
      token.liquidationThreshold = tokensData[token.address].reserveLiquidationThreshold.div(Hundred).toDecimalMinUnit(2);
    }
    if (tokensData?.[token.address]?.reserveLiquidationBonus) {
      token.liquidationPenalty = tokensData[token.address].reserveLiquidationBonus.div(Hundred).sub(Hundred).toDecimalMinUnit();
    }
  });

  const hasBorrowed = tokens.some((token) => token.borrowBalance?.greaterThan(Zero));
  tokens.forEach((token) => {
    if (token.availableLiquidity && token.availableBorrowBalance && (hasBorrowed || token.availableBorrowBalance.greaterThan(token.availableLiquidity))) {
      token.availableBorrowBalance = Unit.min(token.availableBorrowBalance, token.availableLiquidity).mul(Unit.fromMinUnit(0.99));
      token.availableBorrowBalance = Unit.fromStandardUnit(token.availableBorrowBalance.toDecimalStandardUnit(token.decimals, token.decimals), token.decimals);
    }
  });

  const supplyTokens = tokens.filter((token) => token.supplyBalance?.greaterThan(Zero));
  if (supplyTokens.length) {
    const curUserSupplyPrice = supplyTokens.reduce((pre, cur) => pre.add(cur.supplyPrice ?? Zero), Zero);
    tokensStore.setState({ curUserSupplyPrice });
    if (curUserSupplyPrice.greaterThan(Zero) && supplyTokens.every((token) => token.supplyAPY)) {
      tokensStore.setState({
        curUserSupplyAPY: supplyTokens.reduce((pre, cur) => pre.add((cur.supplyPrice ?? Zero).mul(cur.supplyAPY ?? Zero).div(curUserSupplyPrice)), Zero),
      });
    }
  } else {
    tokensStore.setState({ curUserSupplyPrice: Zero, curUserSupplyAPY: Zero });
  }

  const borrowTokens = tokens.filter((token) => token.borrowBalance?.greaterThan(Zero));
  if (borrowTokens.length) {
    const curUserBorrowPrice = borrowTokens.reduce((pre, cur) => pre.add(cur.borrowPrice ?? Zero), Zero);
    tokensStore.setState({ curUserBorrowPrice });
    if (borrowTokens.every((token) => token.borrowAPY)) {
      tokensStore.setState({
        curUserBorrowAPY: borrowTokens.reduce((pre, cur) => pre.add((cur.borrowPrice ?? Zero).mul(cur.borrowAPY ?? Zero).div(curUserBorrowPrice)), Zero),
      });
    }
  } else {
    tokensStore.setState({ curUserBorrowPrice: Zero, curUserBorrowAPY: Zero });
  }

  tokensStore.setState({ tokens });
}, 10);

tokensStore.subscribe((state) => state.tokensInPool, aggregateData, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensData, aggregateData, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensBalance, aggregateData, { fireImmediately: true });
tokensStore.subscribe((state) => state.userTokensData, aggregateData, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensPrice, aggregateData, { fireImmediately: true });
accountMethodFilter.subscribe((state) => state.accountFilter, aggregateData, { fireImmediately: true });
accountMethodFilter.subscribe((state) => state.accountState, aggregateData, { fireImmediately: true });
accountMethodFilter.subscribe((state) => state.chainIdState, aggregateData, { fireImmediately: true });

tokensStore.subscribe(
  (state) => state.tokens,
  (tokens) => {
    const cfxUsdPrice = tokens?.find((token) => token.symbol === 'CFX')?.usdPrice;
    const prePrice = tokensStore.getState().cfxUsdPrice;
    if (cfxUsdPrice && prePrice && cfxUsdPrice.equalsWith(prePrice)) return;
    tokensStore.setState({ cfxUsdPrice });
  },
  { fireImmediately: true }
);

const selectors = {
  tokens: (state: TokensStore) => state.tokens,
  curUserSupplyPrice: (state: TokensStore) => state.curUserSupplyPrice,
  curUserSupplyAPY: (state: TokensStore) => state.curUserSupplyAPY,
  curUserBorrowPrice: (state: TokensStore) => state.curUserBorrowPrice,
  curUserBorrowAPY: (state: TokensStore) => state.curUserBorrowAPY,
  userData: (state: TokensStore) => state.userData,
  claimableFees: (state: TokensStore) => state.claimableFees,
  claimableFeesV1: (state: TokensStore) => state.claimableFeesV1,
};

export const useTokens = () => tokensStore(selectors.tokens);
export const useCurUserSupplyPrice = () => tokensStore(selectors.curUserSupplyPrice);
export const useCurUserSupplyAPY = () => tokensStore(selectors.curUserSupplyAPY);
export const useCurUserBorrowPrice = () => tokensStore(selectors.curUserBorrowPrice);
export const useCurUserBorrowAPY = () => tokensStore(selectors.curUserBorrowAPY);
export const useUserData = () => tokensStore(selectors.userData);
export const useClaimableFees = () => tokensStore(selectors.claimableFees);
export const useClaimableFeesV1 = () => tokensStore(selectors.claimableFeesV1);

const Decimal = Unit.fromMinUnit(10 ** 18);
const Ray = Unit.fromMinUnit(10 ** 27);
const SecondsPerYear = Unit.fromMinUnit(31536000);
const One = Unit.fromMinUnit(1);
const Hundred = Unit.fromMinUnit(100);

const convertOriginTokenData = (originData: any, availableBorrowsUSD: Unit) => {
  const res = {
    address: originData.underlyingAsset,
    name: originData.name,
    symbol: originData.symbol,
    decimals: Number(originData.decimals._hex),
    supplyTokenAddress: originData.aTokenAddress,
    borrowTokenAddress: originData.variableDebtTokenAddress,
    usdPrice: Unit.fromMinUnit(originData.priceInEth._hex).div(Decimal),
    availableLiquidity: Unit.fromMinUnit(originData.availableLiquidity._hex),
    canBeCollateral: originData.usageAsCollateralEnabled,
    reserveLiquidationThreshold: Unit.fromMinUnit(originData.reserveLiquidationThreshold._hex),
    reserveLiquidationBonus: Unit.fromMinUnit(originData.reserveLiquidationBonus._hex),
    maxLTV: Number(originData.baseLTVasCollateral._hex) / 100,
  } as TokenData;

  res.availableBorrowBalance = Unit.fromStandardUnit(availableBorrowsUSD.div(res.usdPrice).toDecimalStandardUnit(res.decimals, res.decimals), res.decimals);
  if (res.availableBorrowBalance.lessThan(Unit.fromStandardUnit(0.000001, res.decimals))) {
    res.availableBorrowBalance = Zero;
  }
  const liquidityRate = Unit.fromMinUnit(originData.liquidityRate._hex);
  const supplyAPR = liquidityRate.div(Ray);
  const supplyAPY = One.add(supplyAPR.div(SecondsPerYear)).pow(SecondsPerYear).sub(One);
  res.supplyAPY = supplyAPY;
  const variableBorrowRate = Unit.fromMinUnit(originData.variableBorrowRate._hex);
  const borrowARR = variableBorrowRate.div(Ray);
  const borrowAPY = One.add(borrowARR.div(SecondsPerYear)).pow(SecondsPerYear).sub(One);
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
