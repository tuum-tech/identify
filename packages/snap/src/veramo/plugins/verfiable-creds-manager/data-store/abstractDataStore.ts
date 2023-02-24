export type ISaveArgs = {
  data: unknown;
  options?: unknown;
  id?: string;
};

export type IDeleteArgs = {
  id: string;
  options?: unknown;
};

export type IFilterArgs = {
  filter?: {
    type: string;
    filter: unknown;
  };
};

export type IConfigureArgs = {
  accessToken: string;
};

export type IQueryResult = {
  data: unknown;
  metadata: {
    id: string;
  };
};

export abstract class AbstractDataStore {
  abstract save(args: ISaveArgs): Promise<string>;

  abstract delete(args: IDeleteArgs): Promise<boolean>;

  abstract query(args: IFilterArgs): Promise<IQueryResult[]>;

  abstract clear(args: IFilterArgs): Promise<boolean>;

  abstract configure?(args: IConfigureArgs): Promise<boolean>;
}
