// utils/useCategoriesVersion.ts
import { useEffect, useState } from "react";
import { subscribe } from "../services/categoryService";

export function useCategoriesVersion() {
  const [v, setV] = useState(0);

  useEffect(() => {
    return subscribe(() => setV((x) => x + 1));
  }, []);

  return v;
}
