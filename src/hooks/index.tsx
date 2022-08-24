import { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens } from '@store/index';
const Zero = Unit.fromMinUnit(0);

export const useCurUserSupplyTokens = (tokens: ReturnType<typeof useTokens>) =>
  useMemo(() => tokens?.filter((token) => token.supplyBalance?.greaterThan(Zero)), [tokens]);

export const useCurUserBorrowTokens = (tokens: ReturnType<typeof useTokens>) =>
  useMemo(() => tokens?.filter((token) => token.borrowBalance?.greaterThan(Zero)), [tokens]);

