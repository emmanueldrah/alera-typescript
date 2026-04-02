import { useState, useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';
import { getErrorMessage } from './errorHandler';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  throwError?: boolean;
}

/**
 * Hook for making API calls with automatic loading and error handling
 */
export const useApi = <T,>(
  apiCall: (signal?: AbortSignal) => Promise<T>,
  dependencies: React.DependencyList = [],
  options?: UseApiOptions
) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const abortController = new AbortController();

    const executeApi = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        const result = await apiCall(abortController.signal);
        setState({ data: result, loading: false, error: null });
        options?.onSuccess?.(result);
      } catch (error) {
        if (abortController.signal.aborted) return;

        const errorMessage = getErrorMessage(error);
        setState({ data: null, loading: false, error: errorMessage });
        options?.onError?.(errorMessage);

        if (options?.throwError) {
          throw error;
        }
      }
    };

    executeApi();

    return () => abortController.abort();
  }, dependencies);

  const refetch = useCallback(async () => {
    try {
      setState({ data: null, loading: true, error: null });
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState({ data: null, loading: false, error: errorMessage });
      options?.onError?.(errorMessage);

      if (options?.throwError) {
        throw error;
      }
    }
  }, []);

  return {
    ...state,
    refetch,
  };
};

/**
 * Hook for mutations (POST, PUT, DELETE) with loading and error handling
 */
export const useMutation = <T, U = void>(
  apiCall: (params: U) => Promise<T>,
  options?: UseApiOptions
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (params: U) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(params);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        options?.onError?.(errorMessage);

        if (options?.throwError) {
          throw err;
        }
      } finally {
        setLoading(false);
      }
    },
    [apiCall, options]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
  };
};

/**
 * Hook for query params (automatic refetch when params change)
 */
export const useApiWithParams = <T,>(
  apiCall: (params: Record<string, any>) => Promise<T>,
  params: Record<string, any> = {},
  options?: UseApiOptions
) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const executeApi = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        const result = await apiCall(params);
        setState({ data: result, loading: false, error: null });
        options?.onSuccess?.(result);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setState({ data: null, loading: false, error: errorMessage });
        options?.onError?.(errorMessage);
      }
    };

    executeApi();
  }, [Object.JSON.stringify(params)]);

  const refetch = useCallback(async () => {
    try {
      setState({ data: null, loading: true, error: null });
      const result = await apiCall(params);
      setState({ data: result, loading: false, error: null });
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState({ data: null, loading: false, error: errorMessage });
      options?.onError?.(errorMessage);
    }
  }, [params]);

  return {
    ...state,
    refetch,
  };
};
