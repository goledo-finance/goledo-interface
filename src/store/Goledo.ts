import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as ethereumStore, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import { MultiFeeDistributionContract, GoledoTokenContract } from '@utils/contracts';
import { isEqual, debounce } from 'lodash-es';
import { tokensStore } from './Tokens';

interface GoledoStore {
  usdPrice?: Unit;
  balance?: Unit;
  stakedBalance?: Unit;
  lockedBalance?: Unit;
  earnedBalance?: Unit;
}

export const goledoStore = create(
  subscribeWithSelector(
    () =>
      ({
        usdPrice: undefined,
        balance: undefined,
        stakedBalance: undefined,
        lockedBalance: undefined,
        earnedBalance: undefined,
      } as GoledoStore)
  )
);

let unsub: VoidFunction | null = null;
ethereumStore.subscribe(
  (state) => state.accounts,
  (accounts) => {
    unsub?.();

    const account = accounts?.[0];
    if (!account) {
      goledoStore.setState({ balance: undefined });
      return;
    }

    unsub = intervalFetchChain(() => GoledoTokenContract.balanceOf(account), {
      intervalTime: 1000,
      equalKey: 'goledoBalance',
      callback: (result: any) => {
        goledoStore.setState({ balance: Unit.fromMinUnit(result?._hex) });
      },
    });


    intervalFetchChain(() => MultiFeeDistributionContract.rewardData(import.meta.env.VITE_GoledoTokenAddress), {
        intervalTime: 1000,
        equalKey: 'abc',
        callback: (result: any) => {
            console.log('test', result)
        },
      });
  },
  { fireImmediately: true }
);
