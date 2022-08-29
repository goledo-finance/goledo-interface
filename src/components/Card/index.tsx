import React, { useState, type HTMLAttributes } from 'react';
import cx from 'clsx';
import Button from '@components/Button';
import './index.css';

interface Props {
  title?: string;
  showHideButton?: boolean | 'no-pb';
  titleIcon?: string | React.ReactNode;
  titleRight?: React.ReactNode;
  children?: React.ReactNode;
}

const Card: React.FC<HTMLAttributes<HTMLDivElement> & Props> = ({ className, title, titleIcon, titleRight, showHideButton, children }) => {
  const [showContent, setShow] = useState(true);

  return (
    <div className={cx("card p-20px rounded-8px bg-white text-14px text-#62677B", showContent && showHideButton === 'no-pb' ? 'pb-0px' : 'pb-20px', className)} >
      {title && (
        <div className="flex items-center">
          <p className="flex items-center text-18px text-#303549 font-semibold mr-auto">
            {typeof titleIcon ==='string' && <span className={`${titleIcon} text-24px mr-8px translate-y-[-2px]`} />}
            {typeof titleIcon !=='string' && titleIcon}
            {title}
          </p>

          {titleRight}
          {showHideButton && (
            <Button className="xl:display-none" variant="text" size="medium" onClick={() => setShow((pre) => !pre)}>
              {showContent ? 'Hide' : 'Show'}
            </Button>
          )}
        </div>
      )}
      {showContent && children}
    </div>
  );
};

export default Card;
