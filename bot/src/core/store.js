// Persistent JSON-backed feature store built on the existing SQLite config table.
// It keeps new product modules independent from the core schema while preserving
// restart-safe state on the configured persistent disk.
import { getConfigValue, setConfig } from "./database.js";

export function readStore(namespace, fallback = []) {
  const raw = getConfigValue(`store.${namespace}`);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStore(namespace, value) {
  setConfig(`store.${namespace}`, JSON.stringify(value));
  return value;
}

export function appendStore(namespace, value, limit = 5000) {
  const items = readStore(namespace, []);
  items.push(value);
  if (items.length > limit) items.splice(0, items.length - limit);
  return writeStore(namespace, items);
}

export function updateStoreItem(namespace, predicate, updater) {
  const items = readStore(namespace, []);
  const index = items.findIndex(predicate);
  if (index === -1) return null;
  items[index] = updater(items[index]);
  writeStore(namespace, items);
  return items[index];
}
