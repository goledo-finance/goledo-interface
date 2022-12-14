import React, { type HTMLAttributes } from 'react';
import cx from 'clsx';

const PageWrapper: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, children }) => {
    return (
        <div className={cx('mx-auto max-w-1472px lt-2xl:px-32px lt-2xl:max-w-100%', className)}>
            {children}
        </div>
    );
}

export default PageWrapper;