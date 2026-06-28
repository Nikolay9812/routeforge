import AsyncStorage from "@react-native-async-storage/async-storage";

export async function readJsonStorageItem(key: string): Promise<unknown | null> {
  try {
    const rawValue = await AsyncStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    return parsedValue;
  } catch (error) {
    console.error("[mobile/storage/readJsonStorageItem]", error);

    return null;
  }
}

export async function writeJsonStorageItem(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("[mobile/storage/writeJsonStorageItem]", error);
  }
}

export async function removeStorageItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("[mobile/storage/removeStorageItem]", error);
  }
}
