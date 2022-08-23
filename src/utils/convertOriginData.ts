import { Unit } from '@cfxjs/use-wallet-react/ethereum';

const ConvertOriginData = (obj: any) => {
  const res: any = {};
  Object.keys(obj)
    .filter((key) => isNaN(Number(key)))
    .forEach((key) => {
      res[key as 'name'] = typeof obj[key]?._hex === 'string' ? Unit.fromMinUnit(obj[key]._hex) : obj[key];
    });
  return res;
};

export default ConvertOriginData;