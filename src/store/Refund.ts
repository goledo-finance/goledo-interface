import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import { MasterChefContract, SwappiPaiContract, MulticallContract, LpTokenContract, RefundContract } from '@utils/contracts';
import { debounce } from 'lodash-es';
import { accountMethodFilter } from './wallet';

const Zero = Unit.fromMinUnit(0);
const OneDaySeconds = Unit.fromMinUnit(86400);
const OneWeekSeconds = Unit.fromMinUnit(604800);
const OneYearSeconds = Unit.fromMinUnit(31536000);

interface RefundStore {
  cfxAmount?: Unit;
  usdtAmount?: Unit;
}

const initState = {
  cfxAmount: undefined,
  usdtAmount: undefined,
} as RefundStore;
export const refundStore = create(subscribeWithSelector(() => initState));

let unsub: VoidFunction | null = null;

const getData = debounce(() => {
  unsub?.();
  const account = accountMethodFilter.getState().accountState;
  if (!account) {
    refundStore.setState(initState);
    return;
  }

  const promises = [
    [import.meta.env.VITE_RefundAddress, RefundContract.interface.encodeFunctionData('cfxAmounts', [account])],
    [import.meta.env.VITE_RefundAddress, RefundContract.interface.encodeFunctionData('usdtAmounts', [account])],
  ];

  unsub = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises), {
    intervalTime: 5000,
    callback: ({ returnData }: { returnData?: Array<any> } = { returnData: undefined }) => {
      if (!returnData) return;
      const cfxAmount = Unit.fromMinUnit(returnData[0] ?? 0);
      const usdtAmount = Unit.fromMinUnit(returnData[1] ?? 0);
      refundStore.setState({
        cfxAmount,
        usdtAmount,
      });
    },
  });
}, 10);

accountMethodFilter.subscribe((state) => state.accountState, getData, { fireImmediately: true });

const selectors = {
  cfxAmount: (state: RefundStore) => state.cfxAmount,
  usdtAmount: (state: RefundStore) => state.usdtAmount,
};

export const useCFXAmount = () => refundStore(selectors.cfxAmount);
export const useUSDTAmount = () => refundStore(selectors.usdtAmount);
