import BTC from './btc.svg';
import ETH from './eth.svg';
import CFX from './cfx.svg';
import GOL from './goledo.svg';
import USDT from './usdt.svg';

const tokensIcon = {
    ETH,
    BTC,
    CFX,
    GOL,
    GOLCFX: GOL,
    USDT
} as Record<string, string>;

export default tokensIcon;