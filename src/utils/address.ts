import { isString, isNegative} from '@utils/is';

const getEllipsStr = (str: string, frontNum: number, endNum: number) => {
    if (!isString(str) || isNegative(frontNum) || isNegative(endNum)) {
        throw new Error('Invalid args');
    }
    const length = str.length;
    if (frontNum + endNum >= length) {
        return str.substring(0, length);
    }
    return str.substring(0, frontNum) + '...' + str.substring(length - endNum, length);
};

export const shortenAddress = (address?: string) => {
    if (typeof address !== 'string' || !address) return '';
    if (address.startsWith('0x')) return getEllipsStr(address, 6, 4);
    return '';
};