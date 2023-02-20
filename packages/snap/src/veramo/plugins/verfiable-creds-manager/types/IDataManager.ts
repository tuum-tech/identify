import { IPluginMethodMap } from '@veramo/core';

export type IDataManager = {
  query(args: IDataManagerQueryArgs): Promise<IDataManagerQueryResult[]>;

  save(args: IDataManagerSaveArgs): Promise<IDataManagerSaveResult[]>;

  delete(args: IDataManagerDeleteArgs): Promise<IDataManagerDeleteResult[]>;

  clear(args: IDataManagerClearArgs): Promise<IDataManagerClearResult[]>;
} & IPluginMethodMap;

/**
 * Types
 */
export type Filter = {
  type: string;
  filter: unknown;
};

type QueryOptions = {
  store?: string | string[];
  returnStore?: boolean;
};

type DeleteOptions = {
  store: string | string[];
};

type SaveOptions = {
  store: string | string[];
};

type ClearOptions = {
  store: string | string[];
};

type QueryMetadata = {
  id: string;
  store?: string;
};

/**
 * Types for DataManager method arguments
 */
export type IDataManagerQueryArgs = {
  filter?: Filter;
  options?: QueryOptions;
};

export type IDataManagerDeleteArgs = {
  id: string;
  options?: DeleteOptions;
};

export type IDataManagerSaveArgs = {
  data: unknown;
  options: SaveOptions;
};

export type IDataManagerClearArgs = {
  filter?: Filter;
  options?: ClearOptions;
};

/**
 * Types for DataManager method return values
 */
export type IDataManagerQueryResult = {
  data: unknown;
  metadata: QueryMetadata;
};

export type IDataManagerSaveResult = {
  id: string;
  store: string;
};

export type IDataManagerDeleteResult = {
  id: string;
  store: string;
  removed: boolean;
};

export type IDataManagerClearResult = {
  store: string;
  removed: boolean;
};
