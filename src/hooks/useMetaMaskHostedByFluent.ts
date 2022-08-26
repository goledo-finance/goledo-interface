import { useEffect, useState } from 'react';
import { provider as metaMaskProvider, completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet-react/ethereum';

export let isMetaMaskHostedByFluent = false;
completeDetectEthereum().then(() => {
    if (metaMaskProvider?.isFluent) {
        isMetaMaskHostedByFluent = true;
    }
});

export const useIsMetaMaskHostedByFluent = () => {
    const [_isMetaMaskHostedByFluent, setIsMetaMaskHostedByFluent] = useState(isMetaMaskHostedByFluent);

    useEffect(() => {
        if (isMetaMaskHostedByFluent) return;
        completeDetectEthereum().then(() => {
            if (metaMaskProvider?.isFluent) {
                setIsMetaMaskHostedByFluent(true);
            }
        });
    }, []);

    return _isMetaMaskHostedByFluent;
}

