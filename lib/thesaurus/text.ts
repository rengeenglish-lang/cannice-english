export function normaliseThesaurusQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export function wordNetShard(value: string) {
  const word = normaliseThesaurusQuery(value);
  const prefix = [...word].filter((character) => character >= "a" && character <= "z").slice(0, 2).join("");
  return `${prefix}__`.slice(0, 2);
}
