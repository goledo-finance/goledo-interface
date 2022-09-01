import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as ethereumStore, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import { MultiFeeDistributionContract, GoledoTokenContract, MulticallContract, ChefIncentivesControllerContract, SwappiPaiContract } from '@utils/contracts';
import { debounce } from 'lodash-es';
import { tokensStore } from './Tokens';
const OneYearSeconds = Unit.fromMinUnit(31536000);

interface GoledoStore {
  name: 'Goledo';
  symbol: 'GOL';
  decimals: 18;
  address: string;
  stakeAPR?: Unit;
  lockAPR?: Unit;
  usdPrice?: Unit;
  totalMarketLockedBalance?: Unit;
  balance?: Unit;
  stakedBalance?: Unit;
  stakedPrice?: Unit;
  lockedBalance?: Unit;
  lockedPrice?: Unit;
  lockeds?: Array<{ balance: Unit; unlockTime: number; }>;
  unlockedableBalance?: Unit;
  earnedBalance?: Unit;
  earnedPrice?: Unit;
  vestingBalance?: Unit;
  vestings?: Array<{ balance: Unit; unlockTime: number; }>;
  withdrawableBalance?: { amount: Unit; penaltyAmount: Unit; };
  reserves?: [Unit, Unit];
  rewardRates?: Record<string, Unit>;
}

const initState = {
  name: 'Goledo',
  symbol: 'GOL',
  decimals: 18,
  address: import.meta.env.VITE_GoledoTokenAddress,
  stakeAPR: undefined,
  lockAPR: undefined,
  usdPrice: undefined,
  totalMarketLockedBalance: undefined,
  balance: undefined,
  stakedBalance: undefined,
  stakedPrice: undefined,
  lockedBalance: undefined,
  lockedPrice: undefined,
  lockeds: undefined,
  unlockedableBalance: undefined,
  earnedBalance: undefined,
  earnedPrice: undefined,
  vestingBalance: undefined,
  vestings: undefined,
  withdrawableBalance: undefined,
  reserves: undefined,
  rewardRates: undefined,
} as GoledoStore;
export const goledoStore = create(subscribeWithSelector(() => initState));

let unsub: VoidFunction | null = null;

const getData = debounce(() => {
  unsub?.();
  const tokens = tokensStore.getState().tokensInPool;
  const account = ethereumStore.getState().accounts?.[0];
  if (!account || !tokens?.length) {
    goledoStore.setState(initState);
    return;
  }

  const promises = [
    [import.meta.env.VITE_GoledoTokenAddress, GoledoTokenContract.interface.encodeFunctionData('balanceOf', [account])],
    [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('lockedBalances', [account])],
    [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('unlockedBalance', [account])],
    [
      import.meta.env.VITE_ChefIncentivesControllerContractAddress,
      ChefIncentivesControllerContract.interface.encodeFunctionData('userBaseClaimable', [account]),
    ],
    [
      import.meta.env.VITE_ChefIncentivesControllerContractAddress,
      ChefIncentivesControllerContract.interface.encodeFunctionData('claimableReward', [account, tokens.map(token => token.borrowTokenAddress).concat(tokens.map(token => token.supplyTokenAddress))])
    ],
    [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('earnedBalances', [account])],
    [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('withdrawableBalance', [account])],
    [import.meta.env.VITE_SwappiPairAddress, SwappiPaiContract.interface.encodeFunctionData('getReserves')],
    [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('lockedSupply')],
    [
      import.meta.env.VITE_MultiFeeDistributionAddress,
      MultiFeeDistributionContract.interface.encodeFunctionData('rewardData', [import.meta.env.VITE_GoledoTokenAddress]),
    ]
  ];

  const tokensRewardsPromises = tokens.map(token =>
    [
      import.meta.env.VITE_MultiFeeDistributionAddress,
      MultiFeeDistributionContract.interface.encodeFunctionData('rewardData', [token.address])
    ]);

  
  unsub = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises.concat(tokensRewardsPromises)), {
    intervalTime: 5000,
    equalKey: 'goledoToken',
    callback: ({ returnData }: { returnData?: Array<any> } = { returnData: undefined }) => {
      if (!returnData) return;
      const balance = Unit.fromMinUnit(returnData[0] ?? 0);

      const lockedBalancesData = MultiFeeDistributionContract.interface.decodeFunctionResult('lockedBalances', returnData[1]);
      const lockedBalance = Unit.fromMinUnit(lockedBalancesData?.locked?._hex ?? 0);
      const lockeds = lockedBalancesData?.lockData?.map((data: any) => ({ balance: Unit.fromMinUnit(data?.amount?._hex ?? 0), unlockTime: Number(data?.unlockTime?._hex ?? 0) * 1000 }));
      const unlockedableBalance = Unit.fromMinUnit(lockedBalancesData?.unlockable?._hex ?? 0);

      const stakedBalance = Unit.fromMinUnit(returnData[2] ?? 0);
      
      // let earnedBalance = Unit.fromMinUnit(returnData[3]);
      let earnedBalance = Unit.fromMinUnit(0);
      const eachTokenEarned = ChefIncentivesControllerContract.interface.decodeFunctionResult('claimableReward', returnData[4])?.[0];
      eachTokenEarned?.forEach(({ _hex}: { _hex: string; }) => earnedBalance = earnedBalance.add(Unit.fromMinUnit(_hex)));

      const vestingBalancesData = MultiFeeDistributionContract.interface.decodeFunctionResult('earnedBalances', returnData[5]);
      const vestingBalance = Unit.fromMinUnit(vestingBalancesData?.total?._hex ?? 0);
      const vestings = vestingBalancesData?.earningsData?.map((data: any) => ({ balance: Unit.fromMinUnit(data?.amount?._hex ?? 0), unlockTime: Number(data?.unlockTime?._hex ?? 0) * 1000 }));

      const withdrawableBalanceData = MultiFeeDistributionContract.interface.decodeFunctionResult('withdrawableBalance', returnData[6]);
      const withdrawableBalance = { 
        amount: Unit.fromMinUnit(withdrawableBalanceData?.amount?._hex ?? 0),
        penaltyAmount: Unit.fromMinUnit(withdrawableBalanceData?.penaltyAmount?._hex ?? 0),
      }

      const reservesData = SwappiPaiContract.interface.decodeFunctionResult('getReserves', returnData[7]);
      const reserves: GoledoStore['reserves'] = [Unit.fromMinUnit(reservesData?.[0]?._hex ?? 0), Unit.fromMinUnit(reservesData?.[1]?._hex ?? 0)];
      const totalMarketLockedBalance = Unit.fromMinUnit(MultiFeeDistributionContract.interface.decodeFunctionResult('lockedSupply', returnData[8])?.[0]?._hex ?? 0);

      const rewardRates = {} as GoledoStore['rewardRates'];
      returnData.slice(9).map((data, index) => {
        const rewardData = MultiFeeDistributionContract.interface.decodeFunctionResult('rewardData', data);
        const rewardRate = Unit.fromMinUnit(rewardData?.rewardRate?._hex ?? 0);

        if (index === 0) {
          rewardRates![import.meta.env.VITE_GoledoTokenAddress] = rewardRate;
        } else if (tokens[index - 1].address) {
          rewardRates![tokens[index - 1].address] = rewardRate;
        }
      });

      goledoStore.setState({ balance, stakedBalance, lockedBalance, lockeds, unlockedableBalance, earnedBalance, vestingBalance, vestings, withdrawableBalance, reserves, totalMarketLockedBalance, rewardRates });
    },
  });
}, 10);

ethereumStore.subscribe((state) => state.accounts, getData, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensInPool, getData, { fireImmediately: true });



const calcGoledoPrice = debounce(() => {
  const { reserves, stakedBalance, lockedBalance, earnedBalance } = goledoStore.getState();
  const cfxUsdPrice = tokensStore.getState().cfxUsdPrice;

  if (!cfxUsdPrice || !reserves || !stakedBalance || !lockedBalance || !earnedBalance) {
    goledoStore.setState({ usdPrice: undefined, stakedBalance: undefined, lockedBalance: undefined });
    return;
  }

  const goledoUsdPrice = reserves[0].div(reserves[1]).mul(cfxUsdPrice);
  const stakedPrice = stakedBalance.mul(goledoUsdPrice);
  const lockedPrice = lockedBalance.mul(goledoUsdPrice);
  const earnedPrice = earnedBalance.mul(goledoUsdPrice);

  goledoStore.setState({ usdPrice: goledoUsdPrice, stakedPrice, lockedPrice, earnedPrice });
}, 50);

const calcGoledoAPR = debounce(() => {
  const { usdPrice: goledoUsdPrice, rewardRates, totalMarketLockedBalance } = goledoStore.getState();
  const tokens = tokensStore.getState().tokens;
  
  if (!tokens?.every(token => token.usdPrice && token.totalMarketSupplyPrice) || !goledoUsdPrice || !rewardRates || !totalMarketLockedBalance) {
    goledoStore.setState({ stakeAPR: undefined, lockAPR: undefined });
    return;
  }

  const APR = (rewardRates[import.meta.env.VITE_GoledoTokenAddress] ?? 0).mul(OneYearSeconds).mul(goledoUsdPrice).div(totalMarketLockedBalance);
  const stakeAPR = tokens.reduce((acc, token) => acc.add((rewardRates[token.address] ?? 0).mul(OneYearSeconds).mul(token.usdPrice!).div(token.totalMarketSupplyBalance!.mul(goledoUsdPrice))), Unit.fromMinUnit(0));
  const lockAPR  = stakeAPR.add((rewardRates[import.meta.env.VITE_GoledoTokenAddress] ?? 0).mul(OneYearSeconds).mul(goledoUsdPrice).div(totalMarketLockedBalance.mul(goledoUsdPrice)));
  goledoStore.setState({ stakeAPR, lockAPR });
}, 10);

goledoStore.subscribe((state) => state.reserves, calcGoledoPrice, { fireImmediately: true });
tokensStore.subscribe((state) => state.cfxUsdPrice, calcGoledoPrice, { fireImmediately: true });
goledoStore.subscribe((state) => state.usdPrice, calcGoledoAPR, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokens, calcGoledoAPR, { fireImmediately: true });



const selectors = {
  all: (state: GoledoStore) => state,
  stakeAPR: (state: GoledoStore) => state.stakeAPR,
  lockAPR: (state: GoledoStore) => state.lockAPR,
  usdPrice: (state: GoledoStore) => state.usdPrice,
  balance: (state: GoledoStore) => state.balance,
  stakedBalance: (state: GoledoStore) => state.stakedBalance,
  stakedPrice: (state: GoledoStore) => state.stakedPrice,
  lockedBalance: (state: GoledoStore) => state.lockedBalance,
  lockedPrice: (state: GoledoStore) => state.lockedPrice,
  lockeds: (state: GoledoStore) => state.lockeds,
  unlockedableBalance: (state: GoledoStore) => state.unlockedableBalance,
  earnedBalance: (state: GoledoStore) => state.earnedBalance,
  earnedPrice: (state: GoledoStore) => state.earnedPrice,
  vestingBalance: (state: GoledoStore) => state.vestingBalance,
  vestings: (state: GoledoStore) => state.vestings,
  withdrawableBalance: (state: GoledoStore) => state.withdrawableBalance,
};

export const useGoledo = () => goledoStore(selectors.all);
export const useGoledoStakeAPR = () => goledoStore(selectors.stakeAPR);
export const useGoledoLockAPR = () => goledoStore(selectors.lockAPR);
export const useGoledoUsdPrice = () => goledoStore(selectors.balance);
export const useGoledoBalance = () => goledoStore(selectors.balance);
export const useGoledoStakedBalance = () => goledoStore(selectors.stakedBalance);
export const useGoledoStakedPrice = () => goledoStore(selectors.stakedPrice);
export const useGoledoLockedBalance = () => goledoStore(selectors.lockedBalance);
export const useGoledoLockedPrice = () => goledoStore(selectors.lockedPrice);
export const useGoledoLockeds = () => goledoStore(selectors.lockeds);
export const useGoledoUnlockedableBalance = () => goledoStore(selectors.unlockedableBalance);
export const useGoledoEarnedBalance = () => goledoStore(selectors.earnedBalance);
export const useGoledoEarnedPrice = () => goledoStore(selectors.earnedPrice);
export const useGoledoVestingBalance = () => goledoStore(selectors.vestingBalance);
export const useGoledoVestings = () => goledoStore(selectors.vestings);
export const useGoledoWithdrawableBalance = () => goledoStore(selectors.withdrawableBalance);
