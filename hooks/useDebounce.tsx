import { useCallback } from "react";

export function useDebounce<F extends (...params: any[]) => void>(
  fn: F,
  delay: number
) {
  let timeoutID: number;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    function (this: any, ...args: any[]) {
      clearTimeout(timeoutID);
      timeoutID = window.setTimeout(() => fn.apply(this, args), delay);
    } as F,
    []
  );
}
