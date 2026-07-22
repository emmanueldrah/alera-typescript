interface RouteLoaderProps {
  label?: string;
  compact?: boolean;
}

const RouteLoader = ({ label = 'Loading ALERA...', compact = false }: RouteLoaderProps) => {
  if (compact) {
    return (
      <div className="flex min-h-[280px] items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-primary/15" />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-6 text-white">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[-6rem] top-[-4rem] h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
      </div>
      <div className="relative z-10 flex max-w-md flex-col items-center gap-5 text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-teal-300" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200/80">Alera</p>
          <h2 className="font-display text-2xl font-semibold">{label}</h2>
          <p className="text-sm text-slate-300">
            Preparing secure healthcare workflows and syncing your workspace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteLoader;
