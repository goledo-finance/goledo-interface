import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as ethereumStore, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import { MasterChefContract, SwappiPaiContract, MulticallContract, LpTokenContract } from '@utils/contracts';
import { debounce } from 'lodash-es';
import { tokensStore } from './Tokens';
import { goledoStore } from './Goledo';

const Zero = Unit.fromMinUnit(0);
const OneDaySeconds = Unit.fromMinUnit(86400);
const OneWeekSeconds = Unit.fromMinUnit(604800);
const OneYearSeconds = Unit.fromMinUnit(31536000);

interface LPStore {
  name: 'GOLCFX';
  symbol: 'GOLCFX';
  decimals: 18;
  address: string;
  stakeAPR?: Unit;
  usdPrice?: Unit;
  balance?: Unit;
  stakedBalance?: Unit;
  stakedPrice?: Unit;
  totalMarketStakedBalance?: Unit;
  totalMarketStakedPrice?: Unit;
  earnedGoledoBalance?: Unit;
  earnedGoledoPrice?: Unit;
  totalRewardsPerDayBalance?: Unit;
  totalRewardsPerDayPrice?: Unit;
  totalRewardsPerWeekBalance?: Unit;
  totalRewardsPerWeekPrice?: Unit;

  rewardsPerSecond?: Unit;
  reserve0?: Unit;
  totalSupply?: Unit;
}

const initState = {
  name: 'GOLCFX',
  symbol: 'GOLCFX',
  decimals: 18,
  address: import.meta.env.VITE_SwappiPairAddress,
  stakeAPR: undefined,
  usdPrice: undefined,
  balance: undefined,
  stakedBalance: undefined,
  stakedPrice: undefined,
  totalMarketStakedBalance: undefined,
  totalMarketStakedPrice: undefined,
  earnedGoledoBalance: undefined,
  earnedGoledoPrice: undefined,
  totalRewardsPerDayBalance: undefined,
  totalRewardsPerDayPrice: undefined,
  totalRewardsPerWeekBalance: undefined,
  totalRewardsPerWeekPrice: undefined,
  rewardsPerSecond: undefined,
  reserve0: undefined,
  totalSupply: undefined,
} as LPStore;
export const lpStore = create(subscribeWithSelector(() => initState));

let unsub: VoidFunction | null = null;

const getData = debounce(() => {
  unsub?.();
  const account = ethereumStore.getState().accounts?.[0];
  if (!account) {
    lpStore.setState(initState);
    return;
  }

  const promises = [
    [import.meta.env.VITE_SwappiPairAddress, SwappiPaiContract.interface.encodeFunctionData('balanceOf', [import.meta.env.VITE_MasterChefAddress])],
    [import.meta.env.VITE_MasterChefAddress, MasterChefContract.interface.encodeFunctionData('userInfo', [import.meta.env.VITE_SwappiPairAddress, account])],
    [import.meta.env.VITE_MasterChefAddress, MasterChefContract.interface.encodeFunctionData('userBaseClaimable', [account])],
    [import.meta.env.VITE_MasterChefAddress, MasterChefContract.interface.encodeFunctionData('claimableReward', [account, [import.meta.env.VITE_SwappiPairAddress]])],
    [import.meta.env.VITE_MasterChefAddress, MasterChefContract.interface.encodeFunctionData('rewardsPerSecond')],
    [import.meta.env.VITE_SwappiPairAddress, SwappiPaiContract.interface.encodeFunctionData('getReserves')],
    [import.meta.env.VITE_SwappiPairAddress, SwappiPaiContract.interface.encodeFunctionData('totalSupply')],
    [import.meta.env.VITE_SwappiPairAddress, LpTokenContract.interface.encodeFunctionData('balanceOf', [account])],
  ];
  
  unsub = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises), {
    intervalTime: 5000,
    callback: ({ returnData }: { returnData?: Array<any> } = { returnData: undefined }) => {
      if (!returnData) return;
      const totalMarketStakedBalance = Unit.fromMinUnit(returnData[0] ?? 0);
      const stakedBalanceData = MasterChefContract.interface.decodeFunctionResult('userInfo', returnData[1]);
      const stakedBalance = Unit.fromMinUnit(stakedBalanceData?.amount?._hex ?? 0);

      // const userBaseClaimable = Unit.fromMinUnit(MasterChefContract.interface.decodeFunctionResult('userBaseClaimable', returnData[2])?.[0]?._hex ?? 0);
      const claimableReward = Unit.fromMinUnit(MasterChefContract.interface.decodeFunctionResult('claimableReward', returnData[3])?.[0]?.[0]?._hex ?? 0);
      // const earnedGoledoBalance = userBaseClaimable.add(claimableReward);
      const earnedGoledoBalance = claimableReward;

      const rewardsPerSecond = Unit.fromMinUnit(MasterChefContract.interface.decodeFunctionResult('rewardsPerSecond', returnData[4])?.[0]?._hex ?? 0);
      const totalRewardsPerDayBalance = rewardsPerSecond.mul(OneDaySeconds);
      const totalRewardsPerWeekBalance = rewardsPerSecond.mul(OneWeekSeconds);

      const reservesData = SwappiPaiContract.interface.decodeFunctionResult('getReserves', returnData[5]);
      const reserve0 = Unit.fromMinUnit(reservesData?._reserve0?._hex ?? 0);
      const totalSupply = Unit.fromMinUnit(SwappiPaiContract.interface.decodeFunctionResult('totalSupply', returnData[6])?.[0]?._hex ?? 0);

      const balance = Unit.fromMinUnit(returnData[7] ?? 0);

      lpStore.setState({ totalMarketStakedBalance, stakedBalance, earnedGoledoBalance, rewardsPerSecond, totalRewardsPerDayBalance, totalRewardsPerWeekBalance, reserve0, totalSupply, balance });
    },
  });
}, 10);

ethereumStore.subscribe((state) => state.accounts, getData, { fireImmediately: true });


const calcLPUsdPrice = debounce(() => {
  const cfxUsdPrice = tokensStore.getState().cfxUsdPrice;
  const { reserve0, totalSupply } = lpStore.getState();
  if (!cfxUsdPrice || !reserve0 || !totalSupply) {
    lpStore.setState({ usdPrice: undefined });
    return;
  }

  let usdPrice = reserve0.mul(Unit.fromMinUnit(2)).mul(cfxUsdPrice).div(totalSupply);
  if (usdPrice.toDecimalMinUnit() === 'NaN') {
    usdPrice = Zero
  }
  const { stakedBalance, totalMarketStakedBalance, earnedGoledoBalance, totalRewardsPerDayBalance, totalRewardsPerWeekBalance } = lpStore.getState();
  lpStore.setState({
    usdPrice,
    stakedPrice: usdPrice.mul(stakedBalance!),
    totalMarketStakedPrice: usdPrice.mul(totalMarketStakedBalance!),
    earnedGoledoPrice: usdPrice.mul(earnedGoledoBalance!),
    totalRewardsPerDayPrice: usdPrice.mul(totalRewardsPerDayBalance!),
    totalRewardsPerWeekPrice: usdPrice.mul(totalRewardsPerWeekBalance!),
  });
}, 50);
lpStore.subscribe((state) => state.reserve0, calcLPUsdPrice, { fireImmediately: true });
tokensStore.subscribe((state) => state.cfxUsdPrice, calcLPUsdPrice, { fireImmediately: true });



const calcStakeAPR = debounce(() => {
  const { rewardsPerSecond, totalMarketStakedBalance, usdPrice } = lpStore.getState();
  const { usdPrice: goledoUsdPrice } = goledoStore.getState();

  if (!rewardsPerSecond || !totalMarketStakedBalance || !usdPrice || !goledoUsdPrice) {
    lpStore.setState({ stakeAPR: undefined });
    return;
  }

  const stakeAPR = rewardsPerSecond.mul(OneYearSeconds).mul(goledoUsdPrice).div(totalMarketStakedBalance.mul(usdPrice));
  lpStore.setState({ stakeAPR: stakeAPR.toDecimalMinUnit() === 'NaN' ? Zero : stakeAPR });
}, 50);
lpStore.subscribe((state) => state.usdPrice, calcStakeAPR, { fireImmediately: true });
goledoStore.subscribe((state) => state.usdPrice, calcStakeAPR, { fireImmediately: true });



const selectors = {
  all: (state: LPStore) => state,
  stakeAPR: (state: LPStore) => state.stakeAPR,
  usdPrice: (state: LPStore) => state.usdPrice,
  balance: (state: LPStore) => state.balance,
  stakedBalance: (state: LPStore) => state.stakedBalance,
  stakedPrice: (state: LPStore) => state.stakedPrice,
  totalMarketStakedBalance: (state: LPStore) => state.totalMarketStakedBalance,
  totalMarketStakedPrice: (state: LPStore) => state.totalMarketStakedPrice,
  earnedGoledoBalance: (state: LPStore) => state.earnedGoledoBalance,
  earnedGoledoPrice: (state: LPStore) => state.earnedGoledoPrice,
  totalRewardsPerDayBalance: (state: LPStore) => state.totalRewardsPerDayBalance,
  totalRewardsPerDayPrice: (state: LPStore) => state.totalRewardsPerDayPrice,
  totalRewardsPerWeekBalance: (state: LPStore) => state.totalRewardsPerWeekBalance,
  totalRewardsPerWeekPrice: (state: LPStore) => state.totalRewardsPerWeekPrice,
};

export const useLp = () => lpStore(selectors.all);
export const useLpStakeAPR = () => lpStore(selectors.stakeAPR);
export const useLpUsdPrice = () => lpStore(selectors.usdPrice);
export const useLpBalance = () => lpStore(selectors.balance);
export const useLpStakedBalance = () => lpStore(selectors.stakedBalance);
export const useLpPStakedPrice = () => lpStore(selectors.stakedPrice);
export const useLpTotalMarketStakedBalance = () => lpStore(selectors.totalMarketStakedBalance);
export const useLpTotalMarketStakedPrice = () => lpStore(selectors.totalMarketStakedPrice);
export const useLpEarnedGoledoBalance = () => lpStore(selectors.earnedGoledoBalance);
export const useLpEarnedGoledoPrice = () => lpStore(selectors.earnedGoledoPrice);
export const useLpTotalRewardsPerDayBalance = () => lpStore(selectors.totalRewardsPerDayBalance);
export const useLpTotalRewardsPerDayPrice = () => lpStore(selectors.totalRewardsPerDayPrice);
export const useLpTotalRewardsPerWeekBalance = () => lpStore(selectors.totalRewardsPerWeekBalance);
export const useLpTotalRewardsPerWeekPrice = () => lpStore(selectors.totalRewardsPerWeekPrice);
