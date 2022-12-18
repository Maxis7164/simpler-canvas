export function formatError(str: string, param: Typed = {}): string {
  return str.replace(/{{\s*(\w*)\s*}}/g, (_, key) => {
    return param[key] ?? key;
  });
}
