import Card from '@components/Card';
import AuthConnectButton from '@modules/AuthConnectButton';
import { useStatus, useChainId } from '@cfxjs/use-wallet-react/ethereum';
import Network from '@utils/Network';


const AuthConnectPage = ({ children }: { children: (action: string) => React.ReactNode;}) => {
  const status = useStatus();
  const chainId = useChainId();
  const chainMatch = chainId === Network.chainId;

  const action = status !== 'active' ? 'Connect your wallet' : !chainMatch ? 'Switch your Network' : '';

  return (
    <Card className="w-full flex flex-col justify-center items-center min-h-[calc(100vh-380px)] text-center">
      <div className="flex justify-center items-center w-100px h-100px text-50px rounded-full bg-#B4C0D0">
        <span className="i-fa-solid:link text-white" />
      </div>
      <p className="mt-20px mb-12px text-20px text-#303549 font-semibold">{action} to {Network.chainName}</p>
      {children(action)}
      <AuthConnectButton className="mt-30px min-w-156px !rounded-100px" />
    </Card>
  );
};

export default AuthConnectPage;
