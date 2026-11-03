export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-8">
      <div className="text-sm text-gray-500">Workspace / Overview</div>
      <div className="flex items-center gap-3">
        <span className="text-sm">My Workspace</span>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-semibold">
          T
        </div>
      </div>
    </header>
  );
}
