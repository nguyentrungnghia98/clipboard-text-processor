import { useState } from "react"

export const parseJSON = <T>(value: string | null): T | undefined => {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    console.log("Parsing error on ", { value });
    return undefined;
  }
};

export const useLocalStorageJson = <T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState(parseJSON(localStorage.getItem(key))  || defaultValue);

  const handleValueChange: React.Dispatch<React.SetStateAction<T>> = (newValue: T | any)  => {
    if (typeof newValue === 'function') {
      // do something
      setValue(oldValue => {
        const value =  newValue(oldValue);
        localStorage.setItem(key, JSON.stringify(value));
        return value;
      })
    } else {
      localStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    }
  }

  return [value, handleValueChange];
}