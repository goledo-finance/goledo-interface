import React, { type HTMLAttributes } from 'react';
import cx from 'clsx';
import PageWrapper from '../PageWrapper';

const PageHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, children }) => {
  return (
    <div className={cx('h-250px -mb-34px bg-#111 lt-sm:h-274px', className)}>
      <PageWrapper>{children}</PageWrapper>
    </div>
  );
};

export default PageHeader;
