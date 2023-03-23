import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { store as ethereumStore, Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import { MultiFeeDistributionContract, GoledoTokenContract, MulticallContract, ChefIncentivesControllerContract, SwappiPaiContract } from '@utils/contracts';
import { debounce } from 'lodash-es';
import { tokensStore } from './Tokens';

const OneYearSeconds = Unit.fromMinUnit(31536000);
const Zero = Unit.fromMinUnit(0);

interface GoledoStore {
  name: 'Goledo';
  symbol: 'GOL';
  decimals: 18;
  address: string;
  APR?: Unit;
  stakeAPR?: Unit;
  lockAPR?: Unit;
  usdPrice?: Unit;
  totalMarketLockedBalance?: Unit;
  balance?: Unit;
  stakedBalance?: Unit;
  stakedPrice?: Unit;
  lockedBalance?: Unit;
  lockedPrice?: Unit;
  lockeds?: Array<{ balance: Unit; unlockTime: number }>;
  unlockedableBalance?: Unit;
  earnedBalance?: Unit;
  earnedPrice?: Unit;
  vestingBalance?: Unit;
  vestings?: Array<{ balance: Unit; unlockTime: number }>;
  withdrawableBalance?: { amount: Unit; penaltyAmount: Unit };
  reserves?: [Unit, Unit];
  rewardPerTokens?: Record<string, Unit>;
  rewardDatas?: Record<string, { periodFinish: Unit; rewardRate: Unit; lastUpdateTime: Unit }>;
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
  rewardDatas: undefined,
  rewardPerTokens: undefined,
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
    [
      import.meta.env.VITE_ChefIncentivesControllerContractAddress,
      ChefIncentivesControllerContract.interface.encodeFunctionData('userBaseClaimable', [account]),
    ],
    [
      import.meta.env.VITE_ChefIncentivesControllerContractAddress,
      ChefIncentivesControllerContract.interface.encodeFunctionData('claimableReward', [
        account,
        tokens.map((token) => token.borrowTokenAddress).concat(tokens.map((token) => token.supplyTokenAddress)),
      ]),
    ],
    [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('earnedBalances', [account])],
    [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('withdrawableBalance', [account])],
    [import.meta.env.VITE_SwappiPairAddress, SwappiPaiContract.interface.encodeFunctionData('getReserves')],
    [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('lockedSupply')],
  ];

  const tokensRewardsPromises = [
    [
      import.meta.env.VITE_MultiFeeDistributionAddress,
      MultiFeeDistributionContract.interface.encodeFunctionData('rewardData', [import.meta.env.VITE_GoledoTokenAddress]),
    ],
    ...tokens.map((token) => [
      import.meta.env.VITE_MultiFeeDistributionAddress,
      MultiFeeDistributionContract.interface.encodeFunctionData('rewardData', [token.supplyTokenAddress]),
    ]),
  ];

  const rewardPerTokenPromises = [
    [
      import.meta.env.VITE_MultiFeeDistributionAddress,
      MultiFeeDistributionContract.interface.encodeFunctionData('rewardPerToken', [import.meta.env.VITE_GoledoTokenAddress]),
    ],
    ...tokens.map((token) => [
      import.meta.env.VITE_MultiFeeDistributionAddress,
      MultiFeeDistributionContract.interface.encodeFunctionData('rewardPerToken', [token.supplyTokenAddress]),
    ]),
  ];

  unsub = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises.concat(tokensRewardsPromises, rewardPerTokenPromises)), {
    intervalTime: 5000,
    equalKey: 'goledoToken',
    callback: ({ returnData }: { returnData?: Array<any> } = { returnData: undefined }) => {
      if (!returnData) return;
      const balance = Unit.fromMinUnit(returnData[0] ?? 0);

      const lockedBalancesData = MultiFeeDistributionContract.interface.decodeFunctionResult('lockedBalances', returnData[1]);
      const lockedBalance = Unit.fromMinUnit(lockedBalancesData?.locked?._hex ?? 0);
      const lockeds = lockedBalancesData?.lockData?.map((data: any) => ({
        balance: Unit.fromMinUnit(data?.amount?._hex ?? 0),
        unlockTime: Number(data?.unlockTime?._hex ?? 0) * 1000,
      }));
      const unlockedableBalance = Unit.fromMinUnit(lockedBalancesData?.unlockable?._hex ?? 0);

      let earnedBalance = Unit.fromMinUnit(returnData[2]);
      const eachTokenEarned = ChefIncentivesControllerContract.interface.decodeFunctionResult('claimableReward', returnData[3])?.[0];
      eachTokenEarned?.forEach(({ _hex }: { _hex: string }) => (earnedBalance = earnedBalance.add(Unit.fromMinUnit(_hex))));

      const vestingBalancesData = MultiFeeDistributionContract.interface.decodeFunctionResult('earnedBalances', returnData[4]);
      const vestingBalance = Unit.fromMinUnit(vestingBalancesData?.total?._hex ?? 0);
      const vestings = vestingBalancesData?.earningsData?.map((data: any) => ({
        balance: Unit.fromMinUnit(data?.amount?._hex ?? 0),
        unlockTime: Number(data?.unlockTime?._hex ?? 0) * 1000,
      }));

      const withdrawableBalanceData = MultiFeeDistributionContract.interface.decodeFunctionResult('withdrawableBalance', returnData[5]);
      const withdrawableBalance = {
        amount: Unit.fromMinUnit(withdrawableBalanceData?.amount?._hex ?? 0),
        penaltyAmount: Unit.fromMinUnit(withdrawableBalanceData?.penaltyAmount?._hex ?? 0),
      };
      const stakedBalance = withdrawableBalance.amount.add(withdrawableBalance.penaltyAmount).sub(vestingBalance);

      const reservesData = SwappiPaiContract.interface.decodeFunctionResult('getReserves', returnData[6]);
      const reserves: GoledoStore['reserves'] = [Unit.fromMinUnit(reservesData?.[0]?._hex ?? 0), Unit.fromMinUnit(reservesData?.[1]?._hex ?? 0)];
      const totalMarketLockedBalance = Unit.fromMinUnit(
        MultiFeeDistributionContract.interface.decodeFunctionResult('lockedSupply', returnData[7])?.[0]?._hex ?? 0
      );

      const rewardDatas = {} as GoledoStore['rewardDatas'];
      returnData.slice(8, 8 + tokensRewardsPromises?.length).forEach((data, index) => {
        const rewardDataDecode = MultiFeeDistributionContract.interface.decodeFunctionResult('rewardData', data);

        const rewardData = {
          lastUpdateTime: Unit.fromMinUnit(rewardDataDecode?.lastUpdateTime?._hex ?? 0),
          periodFinish: Unit.fromMinUnit(rewardDataDecode?.periodFinish?._hex ?? 0),
          rewardRate: Unit.fromMinUnit(rewardDataDecode?.rewardRate?._hex ?? 0),
        };

        if (index === 0) {
          rewardDatas![import.meta.env.VITE_GoledoTokenAddress] = rewardData;
        } else if (tokens[index - 1].address) {
          rewardDatas![tokens[index - 1].address] = rewardData;
        }
      });

      const rewardPerTokens = {} as GoledoStore['rewardPerTokens'];
      returnData.slice(8 + tokensRewardsPromises?.length).forEach((data, index) => {
        const rewardPerToken = MultiFeeDistributionContract.interface.decodeFunctionResult('rewardPerToken', data)?.[0];
        if (index === 0) {
          rewardPerTokens![import.meta.env.VITE_GoledoTokenAddress] = Unit.fromMinUnit(rewardPerToken?._hex ?? 0);
        } else if (tokens[index - 1].address) {
          rewardPerTokens![tokens[index - 1].address] = Unit.fromMinUnit(rewardPerToken?._hex ?? 0);
        }
      });

      goledoStore.setState({
        balance,
        stakedBalance,
        lockedBalance,
        lockeds,
        unlockedableBalance,
        earnedBalance,
        vestingBalance,
        vestings,
        withdrawableBalance,
        reserves,
        totalMarketLockedBalance,
        rewardDatas,
        rewardPerTokens,
      });
    },
  });
}, 10);

ethereumStore.subscribe((state) => state.accounts, getData, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokensInPool, getData, { fireImmediately: true });

const calcGoledoPrice = debounce(() => {
  const { reserves, stakedBalance, lockedBalance, earnedBalance } = goledoStore.getState();
  const cfxUsdPrice = tokensStore.getState().cfxUsdPrice;

  if (!cfxUsdPrice || !reserves || !stakedBalance || !lockedBalance || !earnedBalance) {
    goledoStore.setState({ usdPrice: undefined });
    return;
  }
  const goledoUsdPrice = reserves[1]?.equalsWith(Unit.fromMinUnit(0)) ? Unit.fromMinUnit(0) : reserves[0].div(reserves[1]).mul(cfxUsdPrice);
  const stakedPrice = stakedBalance.mul(goledoUsdPrice);
  const lockedPrice = lockedBalance.mul(goledoUsdPrice);
  const earnedPrice = earnedBalance.mul(goledoUsdPrice);

  goledoStore.setState({ usdPrice: goledoUsdPrice, stakedPrice, lockedPrice, earnedPrice });
}, 50);

const calcGoledoAPR = debounce(() => {
  const { usdPrice: goledoUsdPrice, rewardDatas, rewardPerTokens, totalMarketLockedBalance } = goledoStore.getState();
  const tokens = tokensStore.getState().tokens;

  if (
    !tokens?.every((token) => token.usdPrice && token.totalMarketSupplyPrice) ||
    !goledoUsdPrice ||
    !rewardDatas ||
    !rewardPerTokens ||
    !totalMarketLockedBalance
  ) {
    goledoStore.setState({ stakeAPR: undefined, lockAPR: undefined });
    return;
  }

  const APR = (rewardDatas[import.meta.env.VITE_GoledoTokenAddress]?.rewardRate ?? Zero).mul(OneYearSeconds).mul(goledoUsdPrice).div(totalMarketLockedBalance);

  const stakeAPR = tokens.filter(token => rewardPerTokens[token.address] && rewardPerTokens[token.address].greaterThan(Zero))
  .reduce(
    (acc, token) =>
      acc.add(
        (rewardPerTokens[token.address] ?? Zero)
          .div(rewardDatas[token.address].periodFinish.sub(rewardDatas[token.address].lastUpdateTime))
          .div(Unit.fromMinUnit(`1e${token.decimals}`))
          .mul(OneYearSeconds)
          .mul(token.usdPrice!)
          .div(goledoUsdPrice)
      ),
    Unit.fromMinUnit(0)
  );

  const lockAPR = stakeAPR.add(
    (rewardPerTokens[import.meta.env.VITE_GoledoTokenAddress] ?? Zero)
      .div(rewardDatas[import.meta.env.VITE_GoledoTokenAddress].periodFinish.sub(rewardDatas[import.meta.env.VITE_GoledoTokenAddress].lastUpdateTime))
      .div(Unit.fromMinUnit('1e18'))
      .mul(OneYearSeconds)
  );
  
  goledoStore.setState({
    stakeAPR: stakeAPR.toDecimalMinUnit() === 'NaN' ? Zero : stakeAPR.div(Unit.fromMinUnit(1e12)),
    lockAPR: lockAPR.toDecimalMinUnit() === 'NaN' ? Zero : lockAPR.div(Unit.fromMinUnit(1e12)),
    APR: APR.toDecimalMinUnit() === 'NaN' ? Zero : APR.div(Unit.fromMinUnit(1e12)),
  });
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
  APR: (state: GoledoStore) => state.APR,
};

export const useGoledo = () => goledoStore(selectors.all);
export const useGoledoAPR = () => goledoStore(selectors.APR);
export const useGoledoStakeAPR = () => goledoStore(selectors.stakeAPR);
export const useGoledoLockAPR = () => goledoStore(selectors.lockAPR);
export const useGoledoUsdPrice = () => goledoStore(selectors.usdPrice);
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
