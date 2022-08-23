export const isPromise = (obj: any): obj is Promise<any> => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

export const isFunction = (obj: any): obj is Function => {
  return typeof obj === 'function';
};