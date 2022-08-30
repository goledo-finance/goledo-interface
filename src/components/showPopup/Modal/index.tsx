import React, { memo, useEffect, useRef, type ReactNode } from 'react';
import { useChainId, useAccount } from '@cfxjs/use-wallet-react/ethereum';
import { PopupClass } from '@components/Popup';
import Button from '@components/Button';
import renderReactNode from '@utils/renderReactNode';

const ModalPopup = new PopupClass();
ModalPopup.setListStyle({
  top: '300px',
});
ModalPopup.setItemWrapperClassName('toast-item-wrapper');
ModalPopup.setAnimatedSize(false);

const Modal: React.FC<{ Content: ReactNode | Function; title: string }> = memo(
  ({ Content, title }) => {
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
      <div className="relative w-90vw max-w-560px p-24px rounded-8px bg-white overflow-hidden dropdown-shadow">
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

export const showModal = ({ Content, title }: { Content: Function | ReactNode; title: string; }) => {
  return ModalPopup.show({
    Content: <Modal Content={Content} title={title} />,
    duration: 0,
    showMask: true,
    animationType: 'door',
    pressEscToClose: true,
  });
};

export const hideModal = (key: string | number) => ModalPopup.hide(key);
export const hideAllModal = () => ModalPopup.hideAll();