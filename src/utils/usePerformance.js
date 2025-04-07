import { useCallback, useRef, useState } from 'react';

/**
 * Custom hook for throttling functions to improve performance
 * @param {Function} callback The function to throttle
 * @param {number} delay The delay in milliseconds
 * @returns {[Function, boolean]} A tuple with the throttled function and a loading state
 */
export const useThrottle = (callback, delay = 300) => {
  const [isThrottled, setIsThrottled] = useState(false);
  const lastRun = useRef(0);
  const timeoutRef = useRef(null);

  const throttledFn = useCallback((...args) => {
    const now = Date.now();
    const elapsed = now - lastRun.current;

    const runCallback = () => {
      lastRun.current = Date.now();
      setIsThrottled(false);
      callback(...args);
    };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (elapsed >= delay) {
      runCallback();
    } else {
      setIsThrottled(true);
      timeoutRef.current = setTimeout(() => {
        runCallback();
      }, delay - elapsed);
    }
  }, [callback, delay]);

  return [throttledFn, isThrottled];
};

/**
 * Custom hook for debouncing functions to improve performance 
 * @param {Function} callback The function to debounce
 * @param {number} delay The delay in milliseconds
 * @returns {[Function, boolean]} A tuple with the debounced function and a loading state
 */
export const useDebounce = (callback, delay = 500) => {
  const [isDebounced, setIsDebounced] = useState(false);
  const timeoutRef = useRef(null);

  const debouncedFn = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsDebounced(true);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
      setIsDebounced(false);
    }, delay);
  }, [callback, delay]);

  return [debouncedFn, isDebounced];
};

/**
 * Custom hook to cache API results in memory
 * @param {Function} fetchFunction The API fetch function to cache
 * @param {number} cacheTime Cache expiration time in milliseconds
 * @returns {Function} The cached function
 */
export const useCachedFetch = (fetchFunction, cacheTime = 5 * 60 * 1000) => {
  const cache = useRef(new Map());
  
  const cachedFn = useCallback(async (...args) => {
    const key = JSON.stringify(args);
    
    // Check if we have a cached value
    if (cache.current.has(key)) {
      const { data, timestamp } = cache.current.get(key);
      // If the cache isn't expired, return the cached data
      if (Date.now() - timestamp < cacheTime) {
        return data;
      }
    }
    
    // Otherwise, fetch fresh data
    const result = await fetchFunction(...args);
    
    // Cache the result
    cache.current.set(key, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }, [fetchFunction, cacheTime]);
  
  return cachedFn;
};

// Export as default and named exports
export default { useThrottle, useDebounce, useCachedFetch }; 