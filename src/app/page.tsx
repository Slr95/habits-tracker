import { Suspense } from "react";
import { BoardSkeleton } from "@/components/board-skeleton";
import { Dashboard } from "@/components/dashboard";
import { getTrackerData } from "@/lib/queries";

export default function HomePage() {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <Tracker />
    </Suspense>
  );
}

async function Tracker() {
  const data = await getTrackerData();
  return (
    <Dashboard
      initialHabits={data.habits}
      initialLogs={data.logs}
      initialMetrics={data.metrics}
    />
  );
}
