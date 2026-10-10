export function BoardSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 p-3 md:p-5" aria-busy="true">
      <p className="sr-only">Loading habit tracker</p>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="h-56 border border-line bg-bark xl:col-span-3" />
        <div className="h-56 border border-line bg-paper xl:col-span-5" />
        <div className="h-56 border border-line bg-paper xl:col-span-4" />
      </div>
      <div className="h-80 border border-line bg-paper" />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="h-64 border border-line bg-paper xl:col-span-3" />
        <div className="h-64 border border-line bg-paper xl:col-span-6" />
        <div className="h-64 border border-line bg-paper xl:col-span-3" />
      </div>
    </main>
  );
}
