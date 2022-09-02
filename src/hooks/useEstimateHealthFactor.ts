import { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useTokens, type TokenInfo } from '@store/index';
import { cloneDeep } from 'lodash-es';

const Zero = Unit.fromMinUnit(0);
const TenThousand = Unit.fromMinUnit(10000);

const useEstimateHealthFactor = (estimateToken: PartialOmit<TokenInfo, 'symbol'>) => {
  const _tokens = useTokens();
  const tokens = useMemo(() => {
    const targetTokenIndex = _tokens?.findIndex(token => token.symbol === estimateToken.symbol);
    if (targetTokenIndex === undefined || targetTokenIndex === -1) return _tokens;
    const res = [..._tokens ?? []];
    res[targetTokenIndex] = cloneDeep(res[targetTokenIndex]);
    Object.assign(res[targetTokenIndex], estimateToken);
    return [...res ?? []];
  }, [_tokens, estimateToken]);

  const curUserSupplyTokens = useMemo(() => tokens?.filter((token) => token.supplyBalance?.greaterThan(Zero)), [tokens]);
  const curUSerBorrowTokens = useMemo(() => tokens?.filter((token) => token.borrowBalance?.greaterThan(Zero)), [tokens]);
  const curUserBorrowPrice = useMemo(() => curUSerBorrowTokens?.reduce((pre, cur) => pre.add(cur.borrowPrice ?? Zero), Zero), [curUSerBorrowTokens]);

  const collateralTokens = useMemo(() => curUserSupplyTokens?.filter((token) => token.collateral), [curUserSupplyTokens]);
  const sumReserveLiquidationThreshold = useMemo(
    () =>
      collateralTokens?.reduce(
        (pre, cur) => pre.add(cur.borrowPrice ? (cur.supplyPrice ?? Zero).mul(cur.reserveLiquidationThreshold ?? Zero).div(TenThousand) : Zero),
        Zero
      ),
    [collateralTokens]
  );

  const healthFactor = useMemo(
    () => (curUserBorrowPrice && sumReserveLiquidationThreshold ? (curUserBorrowPrice.greaterThan(Zero) ? sumReserveLiquidationThreshold?.div(curUserBorrowPrice) : undefined) : undefined),
    [sumReserveLiquidationThreshold, curUserBorrowPrice]
  );
  
  const res = healthFactor?.toDecimalMinUnit();
  if (curUserBorrowPrice?.equalsWith(Zero)) return 'Infinity';
  if (!res) return undefined;
  if (res && res.indexOf('e-') !== -1) return '0';
  if (res && res.indexOf('e+') !== -1) return 'Infinity'
  return healthFactor?.toDecimalMinUnit(2);
};

export default useEstimateHealthFactor;
