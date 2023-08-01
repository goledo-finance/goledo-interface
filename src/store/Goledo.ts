import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { intervalFetchChain } from '@utils/fetchChain';
import { MultiFeeDistributionContract, GoledoTokenContract, MulticallContract, ChefIncentivesControllerContract, SwappiPaiContract } from '@utils/contracts';
import { debounce } from 'lodash-es';
import { tokensStore } from './Tokens';
import { accountMethodFilter } from './wallet';

const OneYearSeconds = Unit.fromMinUnit(31536000);
const Zero = Unit.fromMinUnit(0);

interface GoledoStore {
  name: 'Goledo';
  symbol: 'GOL';
  decimals: 18;
  address: string;
  rewardsPerSecond?: Unit;
  totalAllocPoint?: Unit;
  tokensPoolInfo?: Record<string, { allocPoint: Unit; totalSupply: Unit }>;
  tokensAPR?: Record<string, Unit>;
  APR?: Unit;
  stakeAPR?: Unit;
  lockAPR?: Unit;
  usdPrice?: Unit;
  totalMarketLockedBalance?: Unit;
  totalMarketSupplyBalance?: Unit;
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
  rewardRates?: Record<string, Unit>;
}

const initState = {
  name: 'Goledo',
  symbol: 'GOL',
  decimals: 18,
  address: import.meta.env.VITE_GoledoTokenAddress,
  rewardsPerSecond: undefined,
  totalAllocPoint: undefined,
  tokensPoolInfo: undefined,
  stakeAPR: undefined,
  lockAPR: undefined,
  usdPrice: undefined,
  totalMarketLockedBalance: undefined,
  totalMarketSupplyBalance: undefined,
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
  const account = accountMethodFilter.getState().accountState;
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
    [import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistributionContract.interface.encodeFunctionData('totalSupply')],
    [import.meta.env.VITE_ChefIncentivesControllerContractAddress, ChefIncentivesControllerContract.interface.encodeFunctionData('rewardsPerSecond')],
    [import.meta.env.VITE_ChefIncentivesControllerContractAddress, ChefIncentivesControllerContract.interface.encodeFunctionData('totalAllocPoint')],
    [
      import.meta.env.VITE_MultiFeeDistributionAddress,
      MultiFeeDistributionContract.interface.encodeFunctionData('rewardData', [import.meta.env.VITE_GoledoTokenAddress]),
    ],
  ];

  const tokensRewardsPromises = tokens.map((token) => [
    import.meta.env.VITE_MultiFeeDistributionAddress,
    MultiFeeDistributionContract.interface.encodeFunctionData('rewardData', [token.supplyTokenAddress]),
  ]);
  const supplyAndBorrowTokens = [...tokens.map((token) => token.supplyTokenAddress), ...tokens.map((token) => token.borrowTokenAddress)];
  const tokensPoolInfoPromises = supplyAndBorrowTokens.map((tokenAddress) => [
    import.meta.env.VITE_ChefIncentivesControllerContractAddress,
    ChefIncentivesControllerContract.interface.encodeFunctionData('poolInfo', [tokenAddress]),
  ]);
  unsub = intervalFetchChain(() => MulticallContract.callStatic.aggregate(promises.concat(tokensRewardsPromises, tokensPoolInfoPromises)), {
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
      const totalMarketSupplyBalance = Unit.fromMinUnit(
        MultiFeeDistributionContract.interface.decodeFunctionResult('totalSupply', returnData[8])?.[0]?._hex ?? 0
      );
      const rewardsPerSecond = Unit.fromMinUnit(
        ChefIncentivesControllerContract.interface.decodeFunctionResult('rewardsPerSecond', returnData[9])?.[0]?._hex ?? 0
      );
      const totalAllocPoint = Unit.fromMinUnit(
        ChefIncentivesControllerContract.interface.decodeFunctionResult('totalAllocPoint', returnData[10])?.[0]?._hex ?? 0
      );

      const rewardRates = {} as GoledoStore['rewardRates'];
      returnData.slice(11, 11 + tokens.length + 1).map((data, index) => {
        const rewardData = MultiFeeDistributionContract.interface.decodeFunctionResult('rewardData', data);
        const rewardRate = Unit.fromMinUnit(rewardData?.rewardRate?._hex ?? 0);

        if (index === 0) {
          rewardRates![import.meta.env.VITE_GoledoTokenAddress] = rewardRate;
        } else if (tokens[index - 1].address) {
          rewardRates![tokens[index - 1].address] = rewardRate;
        }
      });

      const tokensPoolInfo = {} as GoledoStore['tokensPoolInfo'];
      returnData.slice(11 + tokens.length + 1).map((data, index) => {
        const poolInfo = ChefIncentivesControllerContract.interface.decodeFunctionResult('poolInfo', data);
        tokensPoolInfo![supplyAndBorrowTokens[index]] = {
          allocPoint: new Unit(poolInfo?.allocPoint?._hex ?? 0),
          totalSupply: new Unit(poolInfo?.totalSupply?._hex ?? 0),
        };
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
        totalMarketSupplyBalance,
        rewardRates,
        tokensPoolInfo,
        rewardsPerSecond,
        totalAllocPoint,
      });
    },
  });
}, 10);

accountMethodFilter.subscribe((state) => state.accountState, getData, { fireImmediately: true });
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
  const {
    usdPrice: goledoUsdPrice,
    rewardRates,
    totalMarketLockedBalance,
    totalMarketSupplyBalance,
    rewardsPerSecond,
    tokensPoolInfo,
    totalAllocPoint,
  } = goledoStore.getState();
  const tokens = tokensStore.getState().tokens;

  if (
    !tokens?.every((token) => token.usdPrice && token.totalMarketSupplyPrice) ||
    !goledoUsdPrice ||
    !rewardRates ||
    !totalMarketLockedBalance ||
    !rewardsPerSecond ||
    !tokensPoolInfo ||
    !totalAllocPoint
  ) {
    goledoStore.setState({ stakeAPR: undefined, lockAPR: undefined });
    return;
  }

  // const APR = (rewardRates[import.meta.env.VITE_GoledoTokenAddress] ?? 0).mul(OneYearSeconds).mul(goledoUsdPrice).div(totalMarketLockedBalance);
  const stakeAPR = tokens.reduce(
    (acc, token) => acc.add((rewardRates[token.address] ?? Zero).mul(OneYearSeconds).mul(token.usdPrice!).div(totalMarketSupplyBalance!.mul(goledoUsdPrice))),
    new Unit(0)
  );
  const lockAPR = stakeAPR.add((rewardRates[import.meta.env.VITE_GoledoTokenAddress] ?? Zero).mul(OneYearSeconds).div(totalMarketLockedBalance));

  const supplyAndBorrowTokens = [...tokens.map((token) => token.supplyTokenAddress), ...tokens.map((token) => token.borrowTokenAddress)];
  const tokensAPR = {} as GoledoStore['tokensAPR'];
  supplyAndBorrowTokens.forEach((tokenAddress, index) => {
    tokensAPR![tokenAddress] = rewardsPerSecond
      .mul(tokensPoolInfo[tokenAddress].allocPoint.mul(goledoUsdPrice).mul(OneYearSeconds))
      .div(tokens[index % tokens.length].usdPrice!.mul(totalAllocPoint).mul(tokensPoolInfo[tokenAddress].totalSupply));
  });
  const supplyTokens = tokens?.filter((token) => token.supplyBalance?.greaterThan(Unit.fromStandardUnit('0.0001', token.decimals)));
  const borrowTokens = tokens.filter((token) => token.borrowBalance?.greaterThan(Zero));
  const supplyTokensAPR = supplyTokens.reduce((acc, token) => acc.add(token.supplyPrice!.mul(tokensAPR![token.supplyTokenAddress])), new Unit(0));
  const borrowTokensAPR = borrowTokens.reduce((acc, token) => acc.add(token.borrowPrice!.mul(tokensAPR![token.borrowTokenAddress])), new Unit(0));
  const supplyTokensPrice = supplyTokens.reduce((acc, token) => acc.add(token.supplyPrice!), new Unit(0));
  const borrowTokensPrice = borrowTokens.reduce((acc, token) => acc.add(token.borrowPrice!), new Unit(0));
  const APR = supplyTokensAPR.add(borrowTokensAPR).div(supplyTokensPrice.add(borrowTokensPrice));

  goledoStore.setState({
    tokensAPR,
    stakeAPR: stakeAPR.toDecimalMinUnit() === 'NaN' ? Zero : stakeAPR.div(Unit.fromMinUnit(1e12)),
    lockAPR: lockAPR.toDecimalMinUnit() === 'NaN' ? Zero : lockAPR.div(Unit.fromMinUnit(1e12)),
    APR: APR.toDecimalMinUnit() === 'NaN' ? Zero : APR,
  });
}, 25);

goledoStore.subscribe((state) => state.reserves, calcGoledoPrice, { fireImmediately: true });
tokensStore.subscribe((state) => state.cfxUsdPrice, calcGoledoPrice, { fireImmediately: true });
goledoStore.subscribe((state) => state.usdPrice, calcGoledoAPR, { fireImmediately: true });
tokensStore.subscribe((state) => state.tokens, calcGoledoAPR, { fireImmediately: true });

const selectors = {
  all: (state: GoledoStore) => state,
  tokensAPR: (state: GoledoStore) => state.tokensAPR,
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
export const useGoledoTokensAPR = () => goledoStore(selectors.tokensAPR);
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
