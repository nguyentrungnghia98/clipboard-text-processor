import { useState } from "react";

function getValue(
  key: string,
  defaultValue: any,
  isNumber?: boolean,
  isBoolean?: boolean
): any {
  const storageValue = localStorage.getItem(key);
  if (isBoolean) {
    return storageValue === null ? defaultValue : storageValue === "true";
  }
  if (isNumber) {
    return storageValue === null ? defaultValue : Number(storageValue);
  }
  return storageValue || defaultValue;
}
export const useLocalStorage = <T>(
  key: string,
  defaultValue: T,
  isNumber?: boolean,
  isBoolean?: boolean
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(
    getValue(key, defaultValue, isNumber, isBoolean)
  );

  const handleValueChange = (newValue: T) => {
    localStorage.setItem(key, String(newValue));
    setValue(newValue);
  };

  return [value, handleValueChange];
};
