import { useQuery } from "@tanstack/react-query";
import { getModelInfo } from "../services/api";

export const useModelMetrics = () => {
  const query = useQuery({
    queryKey: ["model-metrics"],
    queryFn: getModelInfo,
    staleTime: Infinity, // model metrics never change — fetch once only
    retry: 2,
  });

  return {
    metrics: query.data || null,
    loading: query.isLoading,
    error: query.isError ? "Could not load model metrics" : null,
  };
};
