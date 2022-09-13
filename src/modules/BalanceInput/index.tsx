import { forwardRef, useRef, useEffect, useCallback } from 'react';
import cx from 'clsx';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import composeRef from '@utils/composeRef';
import Button from '@components/Button';
import BalanceText from '@modules/BalanceText';
import tokensIcon from '@assets/tokens';
import './index.css';

const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!?.set!;

export type Props = OverWrite<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    symbol: string;
    decimals: number;
    usdPrice: Unit;
    max?: Unit;
    maxText?: string;
    maxPrefix?: React.ReactNode;
    title?: string | React.ReactNode;
    error?: string;
    inputClassName?: string;
    bindAccout?: string;
  }
>;

const BalanceInput = forwardRef<HTMLInputElement, Props>(
  ({ className, inputClassName, title, error, bindAccout, defaultValue, max, symbol, decimals = 18, usdPrice, maxPrefix, maxText, onChange, ...props }, ref) => {
    const curInputPrice = useRef<HTMLSpanElement>(null!);
    const domRef = useRef<HTMLInputElement>(null!);
    useEffect(() => {
      if (!domRef.current) return;
      setValue.call(domRef.current, String(defaultValue ?? ''));
      domRef.current.dispatchEvent(new Event('input', { bubbles: true }));
    }, [bindAccout]);

    const handleClickMax = useCallback<React.MouseEventHandler<HTMLButtonElement>>(() => {
      if (!domRef.current || !setValue) return;
      setValue.call(domRef.current, max?.toDecimalStandardUnit(undefined, decimals));
      domRef.current.dispatchEvent(new Event('input', { bubbles: true }));
    }, [max]);

    const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
      (evt) => {
        if (!domRef.current || !curInputPrice.current || !usdPrice) return;
        onChange?.(evt);
        curInputPrice.current.innerText = evt.target.value
          ? `$${Unit.fromStandardUnit(evt.target.value, decimals).mul(usdPrice).toDecimalStandardUnit(2, decimals)}`
          : '';
      },
      [onChange]
    );

    return (
      <>
        {title && <p className="mb-4px text-14px text-#62677B">{title}</p>}
        <div className={cx('balanceInput-wrapper', className)}>
          <div className="flex justify-between items-center">
            <input
              ref={composeRef(ref, domRef)}
              className={cx('balanceInput', inputClassName)}
              autoComplete="off"
              defaultValue={defaultValue}
              max={max?.toDecimalStandardUnit(undefined, decimals)}
              onChange={handleChange}
              type="number"
              disabled={!max}
              autoFocus
              {...props}
            />
            <div className="ml-16px flex items-center text-18px text-#303549 font-semibold">
              <img className="w-24px h-24px mr-8px" src={tokensIcon[symbol]} alt={`${symbol}`} />
              {symbol}
            </div>
            <div className="balanceInput-errorBorder" />
          </div>

          <div className="mt-2px flex justify-between items-center text-14px">
            <span className="text-#D2D4DC" ref={curInputPrice} />
            <div className="relative flex items-center pr-42px">
              {!maxPrefix &&
                <span className="text-#62677B">
                  Balance <BalanceText balance={max} decimals={decimals} placement="bottom"/>
                </span>
              }
              {maxPrefix}

              <Button className="absolute -right-6px top-1/2 -translate-y-1/2 !text-#62677B font-normal" variant="text" size="mini" type="button" disabled={!max} onClick={handleClickMax}>
                {maxText ?? 'MAX'}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }
);

export default BalanceInput;
