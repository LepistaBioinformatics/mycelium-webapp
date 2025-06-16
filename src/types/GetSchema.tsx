export interface GetSchema {
  schema: Schema;
}

export interface Schema {
  type: Type;
  default: any;
  properties: Properties;
  enumValues: any;
  title: any;
  items: any;
}

export interface Type {
  values: string[];
}

export interface Properties {
  shipDate: ShipDate;
  complete: Complete;
  status: Status;
  id: Id;
  petId: PetId;
  quantity: Quantity;
}

export interface ShipDate {
  schemaType: SchemaType;
  format: string;
}

export interface SchemaType {
  values: string[];
}

export interface Complete {
  schemaType: SchemaType;
}

export interface Status {
  schemaType: SchemaType;
  description: string;
}

export interface Id {
  schemaType: SchemaType;
  format: string;
}

export interface PetId {
  schemaType: SchemaType;
  format: string;
}

export interface Quantity {
  schemaType: SchemaType;
  format: string;
}
