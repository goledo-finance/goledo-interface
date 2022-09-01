import { useMemo } from 'react';
import cx from 'clsx';
import './index.css';

export type Columns<T extends object> = Array<{ name: string; width: string; render: (data: T) => React.ReactNode, renderHeader?: () => React.ReactNode; }>;

interface Props<T extends object> {
  columns: Columns<T>;
  data?: Array<T>;
  className?: string;
  cellClassName?: string;
}

const Table = <T extends object>({ columns, data, className, cellClassName = 'h-72px flex justify-center items-center border-t-1px border-#EAEBEF' }: Props<T>) => {
  const gridTemplateColumns = useMemo(() => columns.map((col) => col.width).join(' '), [columns]);

  return (
    <div className={cx('fui-table lt-md:display-none grid grid-flow-row justify-center', className)} style={{ gridTemplateColumns }}>
      {columns.map(({ name, renderHeader }) => (
        <div
          key={name}
          className="h-26px text-12px text-#62677B"
        >
          {renderHeader ? renderHeader() : name}
        </div>
      ))}
      {data?.map((item) =>
        columns.map((col, index) => (
          <div className={cx('text-14px text-#303549 whitespace-nowrap', cellClassName)} key={index}>
            {col.render(item)}
          </div>
        ))
      )}
    </div>
  );
};

export default Table;
