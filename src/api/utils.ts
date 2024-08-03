type AnyObject = { [key: string]: any };

export function stripExtraFields<T extends object>(data: AnyObject, typeDef: T): T {
  const typeDefKeys = Object.keys(typeDef) as (keyof T)[];
  const result: Partial<T> = {};

  typeDefKeys.forEach((key) => {
    if (key in data) {
      result[key] = data[key as keyof AnyObject] as T[keyof T];
    }
  });

  return result as T;
}
