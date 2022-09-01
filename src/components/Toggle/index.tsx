import React, { forwardRef } from 'react';
import cx from 'clsx';
import './index.css';

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name?: string;
  value?: string;
  className?: string;
  checked?: boolean;
  controlled?: boolean;
  disabled?: boolean;
  onToggle?: (e: React.ChangeEvent) => void;
  onRight?: (e: React.ChangeEvent) => void;
  onLeft?: (e: React.ChangeEvent) => void;
}

const Toggle = forwardRef<HTMLButtonElement, Props>(
  (
    {
      className,
      value = '',
      name,
      checked = false,
      controlled = false,
      disabled = false,
      onToggle = () => true,
      onRight = () => true,
      onLeft = () => true,
      ...others
    },
    _forwardRef
  ) => {
    const onChangeHandler = (e: React.ChangeEvent) => {
      if (!!onToggle) {
        onToggle(e);

        const target = e.target as HTMLInputElement;

        if (target && target.checked) {
          onRight(e);
        } else {
          onLeft(e);
        }
      }
    };

    const checkedProp = (controlled: boolean) => {
      return controlled ? { checked } : { defaultChecked: checked };
    };

    return (
      <span className={cx('fui-toggle', disabled && 'is-disabled', checked && 'is-checked', className)} {...others} ref={_forwardRef}>
        <input
          className="fui-toggle__input"
          onChange={onChangeHandler}
          type="checkbox"
          id={name}
          name={name}
          value={value}
          disabled={disabled}
          {...checkedProp(controlled)}
        />
        <label htmlFor={name} />
      </span>
    );
  }
);

export default Toggle;
