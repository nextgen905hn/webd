import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

// Strings
export const setString = (key, value) => storage.set(key, value);
export const getString = (key) => storage.getString(key);

// Numbers
export const setNumber = (key, value) => storage.set(key, value);
export const getNumber = (key) => storage.getNumber(key);

// Booleans
export const setBoolean = (key, value) => storage.set(key, value);
export const getBoolean = (key) => storage.getBoolean(key);

// JSON
// JSON
export const setJSON = (key, value) => storage.set(key, JSON.stringify(value));
export const getJSON = (key) => {
  const value = storage.getString(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};
// Delete / Clear
export const removeKey = (key) => storage.remove(key);
export const clearAll = () => storage.clearAll();
