import { useCallback, useRef, useState } from 'react';

// Simple debounce hook to prevent multiple submissions
export function useSimpleDebounce(fn, delay = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef(null);

  const debouncedFn = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      fn(...args);
      setIsLoading(false);
    }, delay);
  }, [fn, delay]);

  return [debouncedFn, isLoading];
}

// Simple memoization for API calls
export function useSimpleCache(fn) {
  const cacheRef = useRef({});
  
  const cachedFn = useCallback(async (...args) => {
    const key = JSON.stringify(args);
    
    if (cacheRef.current[key]) {
      return cacheRef.current[key];
    }
    
    const result = await fn(...args);
    cacheRef.current[key] = result;
    return result;
  }, [fn]);
  
  return cachedFn;
} 