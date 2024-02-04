import React from 'react';
import { Unit, type useStatus } from '@cfxjs/use-wallet-react/ethereum';
import Tooltip from '@components/Tooltip';
import { type Props as PopperProps } from '@components/Popper';
import numFormat from '@utils/numFormat';

const Zero = Unit.fromMinUnit(0);

interface Props {
  className?: string;
  balance?: Unit;
  status?: ReturnType<typeof useStatus>;
  symbolPrefix?: string;
  symbol?: string;
  decimals?: number;
  abbrDecimals?: number;
  id?: string;
  showEllipsis?: boolean;
  placement?: PopperProps['placement'];
}

const abbrStr = Object.fromEntries([...Array(18).keys()].map((i) => [i + 1, `0.${'0'.repeat(i)}1`]));

const BalanceText: React.FC<Props> = ({
  className,
  balance,
  status,
  id,
  symbolPrefix,
  symbol,
  decimals = 18,
  abbrDecimals = 4,
  showEllipsis = false,
  placement,
}) => {
  const usedPlacement = placement || (abbrDecimals === 4 ? 'top' : 'bottom');
  if (!balance) {
    return (
      <span className={className} id={id}>
        {status === 'active' ? 'loading...' : '--'}
      </span>
    );
  }

  const decimalStandardUnit = balance.toDecimalStandardUnit(undefined, decimals);
  if (decimalStandardUnit !== '0' && Unit.lessThan(balance, Unit.fromStandardUnit(abbrStr[abbrDecimals], Number(decimals)))) {
    const isGreaterThanZero = balance.greaterThan(Zero);
    return (
      <Tooltip
        text={`${isGreaterThanZero ? numFormat(decimalStandardUnit) : Zero}${symbol ? ` ${symbol}` : ''}`}
        placement={usedPlacement}
        interactive
        delay={[888, 333]}
      >
        <span className={className} id={id}>
          {symbolPrefix ?? ''}＜{abbrStr[abbrDecimals]}
          {symbol ? ` ${symbol}` : ''}
        </span>
      </Tooltip>
    );
  }

  const nought = decimalStandardUnit.split('.')[1];
  const noughtLen = nought ? nought.length : 0;
  return (
    <Tooltip
      text={`${numFormat(decimalStandardUnit)}${symbol ? ` ${symbol}` : ''}`}
      placement={usedPlacement}
      disabled={noughtLen < abbrDecimals}
      interactive
      delay={[888, 333]}
    >
      <span className={className} id={id}>
        {noughtLen >= abbrDecimals
          ? `${symbolPrefix ?? ''}${numFormat(balance.toDecimalStandardUnit(abbrDecimals, decimals))}${showEllipsis ? '...' : ''}${symbol ? ` ${symbol}` : ''}`
          : `${symbolPrefix ?? ''}${numFormat(balance.toDecimalStandardUnit(undefined, decimals))}${symbol ? ` ${symbol}` : ''}`}
      </span>
    </Tooltip>
  );
};

export default BalanceText;
