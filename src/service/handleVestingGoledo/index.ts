import { sendTransaction, store as walletStore } from '@cfxjs/use-wallet-react/ethereum';
import { ChefIncentivesControllerContract } from '@utils/contracts';
import { tokensStore } from '@store/Tokens';
export { default } from './showModal';

export const handleVestingGoledo = async ({ tokenAddress }: { tokenAddress: string | 'lp' | 'all'; }) => {
  const account = walletStore.getState().accounts?.[0];
  const tokens = tokensStore.getState().tokens;
  let inputTokens: Array<string> = [];
  if (tokenAddress === 'lp') {
    inputTokens.push(import.meta.env.VITE_SwappiPairAddress);
  } else if (tokenAddress === 'all') {
    tokens?.forEach((token) => {
      inputTokens.push(token.supplyTokenAddress, token.borrowTokenAddress);
    }); 
  } else {
    const targetToken = tokens?.find((token) => token.address === tokenAddress);
    if (!targetToken) throw new Error('no target token');
    inputTokens.push(targetToken.supplyTokenAddress, targetToken.borrowTokenAddress);
  }
  try {
    const TxnHash = await sendTransaction({
      to: tokenAddress === 'lp' ? import.meta.env.VITE_MasterChefAddress : import.meta.env.VITE_ChefIncentivesControllerContractAddress,
      data: ChefIncentivesControllerContract.interface.encodeFunctionData('claim', [account, inputTokens]),
    });
    return TxnHash;
  } catch (err) {
    console.log(`handle Vesting GOL Error`, err);
    throw err;
  }
};
