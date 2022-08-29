import React, { useCallback, type ComponentProps } from 'react';
import { useStatus, useChainId } from '@cfxjs/use-wallet-react/ethereum';
import Button from '@components/Button';
import Network from '@utils/Network';
import { connectToWallet, switchToChain } from './connectUtils';

const AuthConnectButton: React.FC<ComponentProps<typeof Button>> = ({ children, ...props }) => {
    const status = useStatus();
    const chainId = useChainId();
    const chainMatch = chainId === Network.chainId;
    
	const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>((evt) => {
        if (status === 'not-active') {
            connectToWallet();
        } else if (status === 'active' && !chainMatch) {
            switchToChain();
        }
	}, [status, chainMatch]);
    
    if (status === 'active' && chainMatch) return children as React.ReactElement;
    return (
        <Button
            {...props}
            color="green"
            disabled={status !== 'active' && status !== 'not-active'}
            loading={status === 'in-activating'}
            onClick={handleClick}
        >
            {status === 'not-installed' && 'Wallet Not Installed'}
            {status === 'not-active' && 'Connect Wallet'}
            {status === 'active' && !chainMatch && 'Switch Network'}
        </Button>
    )
}

export default AuthConnectButton;