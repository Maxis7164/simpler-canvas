export function formatMessage(str: string, param: Typed = {}): string {
  return str.replace(/{{\s*(\w*)(?:\[(\d*)])?\s*}}/g, (_, key, i) => {
    return typeof param[key] !== "undefined"
      ? typeof i !== "undefined" && Array.isArray(param[key])
        ? param[key][i]
        : param[key]
      : key;
  });
}
