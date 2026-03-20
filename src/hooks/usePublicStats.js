import { useEffect, useState } from "react";
import { getPublicStatsOnce, subscribeToPublicStats } from "../services/firebase";

const DEFAULT_PUBLIC_STATS = {
  goalsCreated: 0,
  plansStarted: 0,
  reportsGenerated: 0,
  activeYearsCreated: 0,
};

export const usePublicStats = () => {
  const [stats, setStats] = useState(DEFAULT_PUBLIC_STATS);

  useEffect(() => {
    let isMounted = true;

    getPublicStatsOnce()
      .then((nextStats) => {
        if (isMounted) {
          setStats({ ...DEFAULT_PUBLIC_STATS, ...nextStats });
        }
      })
      .catch(() => undefined);

    const unsubscribe = subscribeToPublicStats({
      onData: (nextStats) => {
        if (isMounted) {
          setStats({ ...DEFAULT_PUBLIC_STATS, ...nextStats });
        }
      },
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  return stats;
};
