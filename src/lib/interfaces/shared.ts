export type ObjectType = {
  [key: string]: string | number | ObjectType | ArrayType
};

export type ArrayType = Array<string | number | ObjectType>;

export type Value = number | string | ObjectType | ArrayType;
