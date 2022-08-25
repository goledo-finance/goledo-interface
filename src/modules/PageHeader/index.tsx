import styles from './index.module.css';
import cx from 'clsx';

const PageHeader: React.FC<{ isTestnet?: boolean }> = ({ isTestnet = false }) => {
  return (
    <div className={cx('flex flex-col text-#160042', styles.title)}>
      <div className="flex gap-8px items-baseline">
        <span className="text-64px font-extrabold tran">Conflux</span>
        <div className="flex items-center gap-12px">
          <span className="text-32px font-semibold">eSPACE</span>
          {isTestnet && (
            <div className={cx('rounded-full h-24px leading-24px px-10px', styles.testnet)}>
              <span className="text-#EAAA2D">TESTNET</span>
            </div>
          )}
        </div>
      </div>
      <span className="text-100px font-extrabold">Market</span>
    </div>
  );
};

export default PageHeader;
