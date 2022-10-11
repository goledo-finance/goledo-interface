import create from 'zustand';
import LocalStorage from 'localstorage-enhance';
import { MultiFeeDistributionContract } from '@utils/contracts';

const vestingLockTimestamp = LocalStorage.getItem('vestingLockTimestamp') as number | null;
const store = create<{ vestingLockTimestamp: number | null; isInVestingLockTime: boolean; }>(() => ({
  vestingLockTimestamp,
  isInVestingLockTime: vestingLockTimestamp ? Date.now() <= vestingLockTimestamp : true,
}));

export const checkVestingLockTime = (vestingLockTimestamp?: number) => {
  let timestap: number = vestingLockTimestamp!;
  if (typeof vestingLockTimestamp === 'undefined') {
    timestap = store.getState().vestingLockTimestamp!;
  }
  store.setState({ isInVestingLockTime: Date.now() <= timestap });
}

MultiFeeDistributionContract.callStatic.vestingLockTimestamp().then((res) => {
  const vestingLockTimestampNew = Number(res?._hex) * 1000;
  if (vestingLockTimestampNew === vestingLockTimestamp) {
    return;
  }
  
  LocalStorage.setItem({ data: vestingLockTimestampNew, key: 'vestingLockTimestamp' });
  store.setState({ vestingLockTimestamp: vestingLockTimestampNew });

  const isInVestingLockTime = Date.now() <= vestingLockTimestampNew;
  if (isInVestingLockTime) {
    setTimeout(() => {
      store.setState({ isInVestingLockTime: false });
    }, vestingLockTimestampNew - Date.now() + 1000);
  }
});


const selectors = {
  vestingLockTimestamp: (state: ReturnType<typeof store.getState>) => state.vestingLockTimestamp,
  isInVestingLockTime: (state: ReturnType<typeof store.getState>) => state.isInVestingLockTime,
}
export const useIsInVestingLockTime = () => store(selectors.isInVestingLockTime);
export const useVestingLockTimestamp = () => store(selectors.vestingLockTimestamp);


export * from './Tokens';
export * from './Goledo';
export * from './LP';
