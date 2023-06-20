import BTC from './btc.svg';
import ETH from './eth.svg';
import CFX from './cfx.svg';
import GOL from './goledo.svg';
import USDT from './usdt.svg';
import USDC from './usdc.svg';
import xCFX from './xcfx.png';
import NUT from './nut.png'

const tokensIcon = {
    ETH,
    BTC,
    WBTC: BTC,
    WCFX: CFX,
    CFX,
    GOL,
    GOLCFX: GOL,
    USDT,
    USDC,
    xCFX,
    NUT
} as Record<string, string>;

export default tokensIcon;