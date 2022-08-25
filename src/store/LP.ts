import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as ethereumStore, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import { MultiFeeDistributionContract, GoledoTokenContract, MulticallContract, ChefIncentivesControllerContract } from '@utils/contracts';
import { debounce } from 'lodash-es';

const Zero = Unit.fromMinUnit(0);
interface LPStore {

}

const initState = {

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
  ];
  
  unsub = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises), {
    intervalTime: 5000,
    equalKey: 'LP',
    callback: ({ returnData }: { returnData?: Array<any> } = { returnData: undefined }) => {
      if (!returnData) return;
    
      lpStore.setState({  });
    },
  });
}, 10);

ethereumStore.subscribe((state) => state.accounts, getData, { fireImmediately: true });



const selectors = {

};


