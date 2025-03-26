export function flattenObject(
    obj: Record<string, any>,
    prefix = ''
  ): Record<string, string> {
    let result: Record<string, string> = {};
  
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
  
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result = {
          ...result,
          ...flattenObject(value, newKey)
        };
      } else {
        result[newKey] = value;
      }
    }
  
    return result;
  }
  