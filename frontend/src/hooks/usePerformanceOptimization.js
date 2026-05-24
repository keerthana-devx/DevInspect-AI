import { useCallback, useRef, useEffect, useMemo, useState } from 'react';

// Debounced value hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Debounced callback hook
export const useDebouncedCallback = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Request cancellation hook
export const useCancellableRequest = () => {
  const abortControllerRef = useRef(null);

  const makeRequest = useCallback(async (requestFn) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const result = await requestFn(signal);
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return null;
      }
      throw error;
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { makeRequest, cancelRequest };
};

// Optimistic updates hook
export const useOptimisticUpdates = (initialData) => {
  const [data, setData] = useState(initialData);
  const [optimisticData, setOptimisticData] = useState(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const updateOptimistically = useCallback((newData, asyncUpdate) => {
    setOptimisticData(newData);
    setIsOptimistic(true);

    // Perform async update
    asyncUpdate()
      .then((result) => {
        setData(result);
        setOptimisticData(result);
        setIsOptimistic(false);
      })
      .catch((error) => {
        // Revert optimistic update on error
        setOptimisticData(data);
        setIsOptimistic(false);
        throw error;
      });
  }, [data]);

  return {
    data: optimisticData,
    isOptimistic,
    updateOptimistically,
    setData: (newData) => {
      setData(newData);
      setOptimisticData(newData);
      setIsOptimistic(false);
    }
  };
};

// Retry queue hook
export const useRetryQueue = (maxRetries = 3, retryDelay = 1000) => {
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToQueue = useCallback((requestFn, onSuccess, onError) => {
    const id = Date.now() + Math.random();
    setQueue(prev => [...prev, {
      id,
      requestFn,
      onSuccess,
      onError,
      retries: 0,
      maxRetries
    }]);
  }, [maxRetries]);

  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    const item = queue[0];

    try {
      const result = await item.requestFn();
      item.onSuccess?.(result);
      setQueue(prev => prev.slice(1));
    } catch (error) {
      if (item.retries < item.maxRetries) {
        // Retry after delay
        setTimeout(() => {
          setQueue(prev => prev.map(queueItem => 
            queueItem.id === item.id 
              ? { ...queueItem, retries: queueItem.retries + 1 }
              : queueItem
          ));
        }, retryDelay * (item.retries + 1));
      } else {
        // Max retries reached
        item.onError?.(error);
        setQueue(prev => prev.slice(1));
      }
    }

    setIsProcessing(false);
  }, [isProcessing, queue, retryDelay]);

  // Process queue when items are added
  useEffect(() => {
    processQueue();
  }, [queue, processQueue]);

  return { addToQueue, queueLength: queue.length };
};

// Smart cache hook with TTL
export const useSmartCache = (ttl = 5 * 60 * 1000) => { // 5 minutes default
  const cacheRef = useRef(new Map());

  const get = useCallback((key) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    const { data, timestamp } = cached;
    if (Date.now() - timestamp > ttl) {
      cacheRef.current.delete(key);
      return null;
    }

    return data;
  }, [ttl]);

  const set = useCallback((key, data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const invalidate = useCallback((key) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const has = useCallback((key) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return false;
    
    if (Date.now() - cached.timestamp > ttl) {
      cacheRef.current.delete(key);
      return false;
    }
    
    return true;
  }, [ttl]);

  return { get, set, invalidate, has };
};

// Virtualization hook for large lists
export const useVirtualization = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll
  };
};

// Memory leak prevention hook
export const useMemoryLeakPrevention = () => {
  const timeoutsRef = useRef(new Set());
  const intervalsRef = useRef(new Set());
  const listenersRef = useRef(new Map());

  const setTimeout = useCallback((callback, delay) => {
    const id = window.setTimeout(callback, delay);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  const clearTimeout = useCallback((id) => {
    window.clearTimeout(id);
    timeoutsRef.current.delete(id);
  }, []);

  const setInterval = useCallback((callback, delay) => {
    const id = window.setInterval(callback, delay);
    intervalsRef.current.add(id);
    return id;
  }, []);

  const clearInterval = useCallback((id) => {
    window.clearInterval(id);
    intervalsRef.current.delete(id);
  }, []);

  const addEventListener = useCallback((element, event, handler, options) => {
    element.addEventListener(event, handler, options);
    const key = `${element}-${event}`;
    listenersRef.current.set(key, { element, event, handler });
  }, []);

  const removeEventListener = useCallback((element, event, handler) => {
    element.removeEventListener(event, handler);
    const key = `${element}-${event}`;
    listenersRef.current.delete(key);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeoutsRef.current.forEach(id => window.clearTimeout(id));
      timeoutsRef.current.clear();

      // Clear all intervals
      intervalsRef.current.forEach(id => window.clearInterval(id));
      intervalsRef.current.clear();

      // Remove all event listeners
      listenersRef.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      listenersRef.current.clear();
    };
  }, []);

  return {
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    addEventListener,
    removeEventListener
  };
};