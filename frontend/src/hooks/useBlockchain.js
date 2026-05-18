import { useQuery } from "@tanstack/react-query";
import { getBlockchainStatus } from "../services/api";

export const useBlockchain = () => {
  const query = useQuery({
    queryKey: ["blockchain-status"],
    queryFn: getBlockchainStatus,
    refetchInterval: 10000, // poll every 10 seconds
    retry: 2,
    staleTime: 5000,
  });

  return {
    status: query.data || null,
    loading: query.isLoading,
    error: query.isError ? "Blockchain not reachable" : null,
  };
};
