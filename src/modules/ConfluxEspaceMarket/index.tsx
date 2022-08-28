import { type PropsWithChildren } from 'react';
import './index.css';

const ConfluxEspaceMarket = ({ children }: PropsWithChildren) => {
  return (
    <div className=" pb-10px pt-10px sm:pt-20px xl:pt-28px xl:pb-24px flex flex-col xl:flex-row items-start xl:items-center justify-between">
      <div className='epsaceMarket-title flex w-full xl-w-fit justify-center flex-col sm:flex-row xl:flex-col text-#F1F1F3'>
        <div className="flex gap-8px items-baseline justify-center sm:justify-start">
          <span className="text-48px xl:text-64px font-extrabold tran">Conflux</span>
          <div className="flex items-center gap-4px xl:gap-12px">
            <span className="text-24px xl:text-32px font-semibold">eSPACE</span>
            {import.meta.env.MODE !== 'production' && (
              <div className='epsaceMarket-testnet rounded-full h-24px leading-24px'>
                <span className="text-#EAAA2D">(TESTNET)</span>
              </div>
            )}
          </div>
        </div>
        <span className="text-50px xl:text-100px sm:ml-20px xl:ml-0 lt-sm:text-center lt-sm:leading-32px font-extrabold">Market</span>
      </div>
      
      {children}
  </div>

  );
};

export default ConfluxEspaceMarket;
