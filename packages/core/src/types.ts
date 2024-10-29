export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type Brand<K, T> = K & { __brand: T };
