import cx from 'clsx';
import tokensIcon from '@assets/tokens';

export type Configs<T extends any, U extends any = undefined> = Array<{ name?: string; renderContent?: (token: T, otherData?: U) => React.ReactNode; render?: (token: T, otherData?: U) => React.ReactNode }>;

interface Props<T extends any, U extends any = undefined> {
  configs: Configs<T, U>;
  data?: Array<T>;
  otherData?: U;
  className?: string;
}

const TokenAssets = <T extends any, U extends any = undefined>({ configs, data, className, otherData }: Props<T, U>) => {
  return (
    <div className={cx('md:display-none', className)}>
      {data?.map((token: any) => (
        <div className="pt-16px pb-24px border-t-1px border-#EAEBEF text-14px text-#303549" key={token.symbol}>
          <div className="flex items-center mb-18px">
            <img className="w-40px h-40px mr-8px" src={tokensIcon[token.symbol]} alt={token.symbol} />
            <div>
              <p className="text-16px font-semibold">{token.name || 'Unset'}</p>
              <p className="text-12px text-#62677B">{token.symbol}</p>
            </div>
          </div>

          {configs.map((conf, index) => (
            <div
              className={cx(index !== (configs?.length - 1) ? index === (configs?.length - 2) ? "mb-24px" : "mb-12px" : '')}
              key={conf?.name ?? 'footer'}
            >
              {conf.render ? (
                conf.render(token, otherData)
              ) : conf.name ? (
                <div className="flex justify-between">
                  <p>{conf.name}</p>
                  <div className='text-right'>
                    {conf.renderContent ? conf.renderContent(token, otherData) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TokenAssets;
