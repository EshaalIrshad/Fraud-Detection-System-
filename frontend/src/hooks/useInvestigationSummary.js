import { useQuery } from "@tanstack/react-query";
import { getInvestigationSummary, getInvestigations } from "../services/api";

export const useInvestigationSummary = () => {
  // Existing in-memory summary (fraud transaction statuses)
  const summaryQuery = useQuery({
    queryKey: ["investigation-summary"],
    queryFn: getInvestigationSummary,
    refetchInterval: 5000,
  });

  // New persisted investigations from DB (suspicious legitimate txns)
  const investigationsQuery = useQuery({
    queryKey: ["investigations"],
    queryFn: getInvestigations,
    refetchInterval: 10000,
  });

  const summary = summaryQuery.data || {
    total_fraud: 0,
    confirmed: 0,
    false_positive: 0,
    under_review: 0,
    unreviewed: 0,
    suspicious: 0,
  };

  const investigations = investigationsQuery.data?.investigations || [];

  return {
    summary: {
      ...summary,
      // Override suspicious count with the real DB count
      suspicious: investigations.length,
    },
    investigations, // full list for the detail section
    loading: summaryQuery.isLoading,
    investigationsLoading: investigationsQuery.isLoading,
  };
};
