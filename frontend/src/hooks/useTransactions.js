import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTransactions } from "../services/api";

export const useTransactions = (limit = 20, filter = "all") => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transactions", limit, filter],
    queryFn: () => getTransactions(limit, filter),
    refetchInterval: 5000, // poll every 5 seconds automatically
    retry: 3, // retry 3 times on failure
    staleTime: 2000, // data stays fresh for 2 seconds
  });

  return {
    transactions: query.data?.transactions || [],
    totalCount: query.data?.total || 0,
    fraudCount: query.data?.fraud_total || 0,
    loading: query.isLoading,
    error: query.isError
      ? "Could not fetch transactions — is Flask running?"
      : null,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  };
};
