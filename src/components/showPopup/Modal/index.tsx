import React, { memo, useEffect, useRef, type ReactNode } from 'react';
import cx from 'clsx';
import { useChainId, useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { PopupClass } from '@components/Popup';
import Button from '@components/Button';
import renderReactNode from '@utils/renderReactNode';
import './index.css';

const ModalPopup = new PopupClass();
ModalPopup.setListClassName('modal-wrapper');
ModalPopup.setItemWrapperClassName('toast-item-wrapper');
ModalPopup.setAnimatedSize(false);

const Modal: React.FC<{ Content: ReactNode | Function; title: string; className?: string; }> = memo(
  ({ Content, title, className }) => {
    const hasInit = useRef(false);
    const chainId = useChainId();
    const account = useAccount();

    useEffect(() => {
      if (!hasInit.current) {
        hasInit.current = true;
        return;
      }
      ModalPopup.hideAll();
    }, [account, chainId]);

    return (
      <div className={cx("relative w-90vw max-w-560px p-24px rounded-8px bg-white overflow-hidden dropdown-shadow", className)}>
        <div className='flex justify-between items-center text-22px text-#303549 font-semibold'>
          {title}
          <Button className='w-36px h-36px rounded-full' variant='text' onClick={ModalPopup.hideAll}>
            <span className='i-gg:close text-24px'/>
          </Button>
        </div>

        {renderReactNode(Content)}
      </div>
    );
  }
);

export const showModal = ({ Content, title, className }: { Content: Function | ReactNode; title: string; className?: string; }) => {
  return ModalPopup.show({
    Content: <Modal Content={Content} title={title} className={className}/>,
    duration: 0,
    showMask: true,
    animationType: 'door',
    pressEscToClose: true,
  });
};

export const hideModal = (key: string | number) => ModalPopup.hide(key);
export const hideAllModal = () => ModalPopup.hideAll();