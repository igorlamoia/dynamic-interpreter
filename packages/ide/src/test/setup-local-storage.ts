/**
 * O Node 22+ expõe um `localStorage` global experimental. Sem a flag
 * `--localstorage-file` ele existe, mas não tem `getItem`/`setItem` — e esconde
 * o `localStorage` do jsdom. Nesta situação qualquer spec (ou hook testado)
 * que toque o storage quebra com "getItem is not a function". No Node 20, que
 * é o do CI, isso não acontece.
 *
 * Só age em specs com jsdom (`window` definido) e só quando o storage atual
 * não funciona: no Node 20 o `localStorage` do jsdom continua sendo o usado.
 */
function installMemoryStorage(): void {
  const store = new Map<string, string>();
  const storage: Storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, String(value)),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
  for (const target of [globalThis, window]) {
    Object.defineProperty(target, "localStorage", {
      configurable: true,
      value: storage,
    });
  }
}

if (
  typeof window !== "undefined" &&
  typeof globalThis.localStorage?.getItem !== "function"
) {
  installMemoryStorage();
}
