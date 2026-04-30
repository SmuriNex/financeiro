export function cacheByIds(ids, root = document) {
  return ids.reduce((dom, id) => {
    dom[toCamel(id)] = root.getElementById(id);
    return dom;
  }, {});
}

export function toCamel(id) {
  return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
