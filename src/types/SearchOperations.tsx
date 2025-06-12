export interface SearchOperationsResponse {
  total: number;
  pageSize: number;
  skip: number;
  operations: ScoredOperation[];
}

export interface ScoredOperation {
  score: number;
  operation: Operation;
}

export interface Operation {
  summary: string;
  description: string;
  operationId: string;
  operation: ChildOperation;
  path: string;
  securityGroup: string;
  method: string;
}

export interface ChildOperation {
  tags: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
}

export interface Parameter {
  name: string;
  in: string;
  description: string;
  allowEmptyValue: any;
  required: boolean;
  style: any;
}

export interface RequestBody {
  reference: Reference;
  schema: Schema;
}

export interface Reference {
  reference: any;
}

export interface Schema {
  content: Content;
}

export interface Content {
  [key: string]: {
    schema: {
      reference: string;
    };
  };
}
