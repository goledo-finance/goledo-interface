export const isPromise = (obj: any): obj is Promise<any> => !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';

export const isFunction = (obj: any): obj is Function => typeof obj === 'function';

export const isNegative = (num: number): num is number => typeof num === 'number' && num < 0;

export const isString = (str: string): str is string  => typeof str === 'string';
