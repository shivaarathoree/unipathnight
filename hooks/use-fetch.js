import { useState, useCallback } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure we're only passing serializable data to the Server Action
      const serializableArgs = args.map(arg => {
        // If it's already a plain object or primitive, return as is
        if (arg === null || arg === undefined || typeof arg !== 'object') {
          return arg;
        }
        
        // If it's an array, process each element
        if (Array.isArray(arg)) {
          return arg.map(item => {
            if (item === null || item === undefined || typeof item !== 'object') {
              return item;
            }
            
            // For objects, create a plain object with only own enumerable properties
            if (typeof item === 'object' && item.constructor === Object) {
              return { ...item };
            }
            
            // For other object types, try to convert to plain object
            try {
              return JSON.parse(JSON.stringify(item));
            } catch {
              // If we can't serialize, return a simplified version
              return String(item);
            }
          });
        }
        
        // For objects, create a plain object with only own enumerable properties
        if (typeof arg === 'object' && arg.constructor === Object) {
          return { ...arg };
        }
        
        // For other object types, try to convert to plain object
        try {
          return JSON.parse(JSON.stringify(arg));
        } catch {
          // If we can't serialize, return a simplified version
          return String(arg);
        }
      });
      
      const response = await cb(...serializableArgs);
      setData(response);
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      toast.error(error.message || "An error occurred");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cb]);

  return { data, loading, error, fn, setData };
};

export default useFetch;