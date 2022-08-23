import { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';
const Zero = Unit.fromMinUnit(0);

export const useUserSupplyTokens = (tokens: ReturnType<typeof useTokens>) =>
  useMemo(() => tokens?.filter((token) => token.supplyBalance?.greaterThan(Zero)), [tokens]);

export const useUserTotalSupplyPrice = (supplyTokens: ReturnType<typeof useTokens>) =>
  useMemo(() => supplyTokens?.length ? supplyTokens?.reduce((pre, cur) => pre.add(cur.supplyPrice ?? Zero), Zero) : undefined, [supplyTokens]);
  
export const useUserTotalSupplyAPY = (supplyTokens: ReturnType<typeof useTokens>, totalSupplyPrice: ReturnType<typeof useUserTotalSupplyPrice>) => {
  return useMemo(
    () =>
      !totalSupplyPrice
        ? undefined
        : supplyTokens?.reduce((pre, cur) => pre.add((cur.supplyPrice ?? Zero).mul(cur.supplyAPY ?? Zero).div(totalSupplyPrice)), Zero),
    [supplyTokens, totalSupplyPrice]
  );
};

export const useUserBorrowTokens = (tokens: ReturnType<typeof useTokens>) =>
  useMemo(() => tokens?.filter((token) => token.borrowBalance?.greaterThan(Zero)), [tokens]);

export const useUserTotalBorrowPrice = (borrowTokens: ReturnType<typeof useTokens>) =>
  useMemo(() => borrowTokens?.length ? borrowTokens.reduce((pre, cur) => pre.add(cur.borrowPrice ?? Zero), Zero) : undefined, [borrowTokens]);
  
export const useUserTotalBorrowAPY = (borrowTokens: ReturnType<typeof useTokens>, totalBorrowPrice: ReturnType<typeof useUserTotalBorrowPrice>) => {
  return useMemo(
    () =>
      !totalBorrowPrice
        ? undefined
        : borrowTokens?.reduce((pre, cur) => pre.add((cur.borrowPrice ?? Zero).mul(cur.borrowAPY ?? Zero).div(totalBorrowPrice)), Zero),
    [borrowTokens, totalBorrowPrice]
  );
};
