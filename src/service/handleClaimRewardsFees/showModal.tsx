import React from 'react';
import { showModal, hideAllModal } from '@components/showPopup/Modal';
import Button from '@components/Button';
import useTransaction from '@hooks/useTransaction';
import Success from '@assets/icons/success.svg';
import Error from '@assets/icons/error.svg';
import { handleClaimRewardsFees } from './index';

const ModalContent: React.FC = () => {
  const { status: transactionStatus, scanUrl, error, sendTransaction } = useTransaction(handleClaimRewardsFees);

  return (
    <div className='relative'>
      {transactionStatus !== 'success' && transactionStatus !== 'failed' && (
        <>
          <p className="mt-30px mb-4px text-14px text-#62677B">Sure to claim all rewards fees?</p>
          <Button
            id='handle-claim-rewards-fees-btn'
            fullWidth
            size="large"
            className="mt-48px"
            disabled={transactionStatus === 'sending'}
            loading={transactionStatus === 'sending' ? 'start' : undefined}
            onClick={sendTransaction}
          >
            {transactionStatus === 'waiting' && 'Claim All'}
            {transactionStatus === 'sending' && 'Claiming...'}
          </Button>
        </>
      )}
      {(transactionStatus === 'success' || transactionStatus === 'failed') && (
        <>
          <img src={transactionStatus === 'success' ? Success : Error} alt={transactionStatus} className="block w-48px h-48px mt-24px mx-auto" />
          <p className="mt-12px mb-8px text-20px text-#303549 text-center font-semibold">
            {transactionStatus === 'success' && 'All done!'}
            {transactionStatus === 'failed' && 'Transaction failed!'}
          </p>
          <p className="text-14px text-#303549 text-center">
            {transactionStatus === 'success' && (
              <>
                You claimed all rewards fees.
              </>
            )}
            {transactionStatus === 'failed' && error}
          </p>
          {scanUrl &&
            <a
              id='handle-claim-rewards-fees-reviewTx-link'
              className='absolute bottom-50px right-0px text-12px text-#383515 no-underline hover:underline'
              href={scanUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Review tx details
              <span className='i-charm:link-external ml-3px text-10px translate-y-[-.5px]' />
            </a>
          }
          <Button id='handle-claim-rewards-fees-ok-btn' fullWidth size="large" className="mt-48px" onClick={hideAllModal}>
            OK
          </Button>
        </>
      )}
    </div>
  );
};

const showVestingGoledoModal = () =>
  showModal({ Content: <ModalContent />, title: 'Claim Rewards Fees' });

export default showVestingGoledoModal;
