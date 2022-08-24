import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as ethereumStore, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import { MultiFeeDistributionContract, GoledoTokenContract, MulticallContract, ChefIncentivesControllerContract } from '@utils/contracts';
import { debounce } from 'lodash-es';
import { tokensStore } from './Tokens';

const Zero = Unit.fromMinUnit(0);
interface GoledoStore {
  usdPrice?: Unit;
  balance?: Unit;
  stakedBalance?: Unit;
  lockedBalance?: Unit;
  earnedBalance?: Unit;
  unlockTime?: number;
}

const initState = {
  usdPrice: undefined,
  balance: undefined,
  stakedBalance: undefined,
  lockedBalance: undefined,
  earnedBalance: undefined,
  unlockTime: undefined,
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
    [
      import.meta.env.VITE_MultiFeeDistributionAddress,
      MultiFeeDistributionContract.interface.encodeFunctionData('rewardData', [import.meta.env.VITE_GoledoTokenAddress]),
    ],
  ];
  unsub = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises), {
    intervalTime: 1000,
    equalKey: 'goledoToken',
    callback: ({ returnData }: { returnData?: Array<any> } = { returnData: undefined }) => {
      if (!returnData) return;
      const balance = Unit.fromMinUnit(returnData[0] ?? 0);

      const lockedBalancesData = MultiFeeDistributionContract.interface.decodeFunctionResult('lockedBalances', returnData[1]);
      const lockedBalance = Unit.fromMinUnit(lockedBalancesData?.lockData?.[0]?.[0]?._hex ?? Zero);
      const unlockTime = Number(lockedBalancesData?.lockData?.[0]?.[1]?._hex);

      const stakedBalance = Unit.fromMinUnit(returnData[2] ?? 0);

      let earnedBalance = Unit.fromMinUnit(returnData[3]);
      const eachTokenEarned = ChefIncentivesControllerContract.interface.decodeFunctionResult('claimableReward', returnData[4])?.[0];
      eachTokenEarned?.forEach(({ _hex}: { _hex: string; }) => earnedBalance = earnedBalance.add(Unit.fromMinUnit(_hex)));

      goledoStore.setState({ balance, stakedBalance, lockedBalance, unlockTime, earnedBalance });
    },
  });
}, 10);

ethereumStore.subscribe((state) => state.accounts, getData, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensInPool, getData, { fireImmediately: true });



const selectors = {
  balance: (state: GoledoStore) => state.balance,
  stakedBalance: (state: GoledoStore) => state.stakedBalance,
  lockedBalance: (state: GoledoStore) => state.lockedBalance,
  earnedBalance: (state: GoledoStore) => state.earnedBalance,
};

export const useGoledoBalance = () => goledoStore(selectors.balance);
export const useGoledoStakedBalance = () => goledoStore(selectors.stakedBalance);
export const useGoledoLockedBalance = () => goledoStore(selectors.lockedBalance);
export const useGoledoEarnedBalance = () => goledoStore(selectors.earnedBalance);
