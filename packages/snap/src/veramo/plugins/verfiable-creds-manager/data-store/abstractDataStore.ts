export interface ISaveArgs {
  data: unknown;
  options?: unknown;
  id?: string;
}

export interface IDeleteArgs {
  id: string;
  options?: unknown;
}

export interface IFilterArgs {
  filter?: {
    type: string;
    filter: unknown;
  };
}

export interface IQueryResult {
  data: unknown;
  metadata: {
    id: string;
  };
}

export abstract class AbstractDataStore {
  abstract save(args: ISaveArgs): Promise<string>;
  abstract delete(args: IDeleteArgs): Promise<boolean>;
  abstract query(args: IFilterArgs): Promise<Array<IQueryResult>>;
  abstract clear(args: IFilterArgs): Promise<boolean>;
}
