"use client";

export default function TrackerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-4 p-8">
      <h1 className="font-display text-3xl text-bark">Habit Tracker</h1>
      <p className="text-sm leading-6 text-soil">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="h-10 w-fit border border-line bg-bark px-4 text-sm font-semibold text-paper"
      >
        Try again
      </button>
    </main>
  );
}
