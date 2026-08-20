// Skeleton card that mirrors the exact shape of a real video card
export default function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Thumbnail placeholder */}
      <div className="w-full aspect-video rounded-xl bg-zinc-800/80 mb-3" />

      {/* Meta row */}
      <div className="flex gap-3 pr-2">
        {/* Avatar circle */}
        <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0 mt-1" />

        <div className="flex-1 space-y-2 pt-1">
          {/* Title — two lines */}
          <div className="h-3.5 bg-zinc-800 rounded-full w-full" />
          <div className="h-3.5 bg-zinc-800 rounded-full w-3/4" />
          {/* Creator name */}
          <div className="h-3 bg-zinc-800/60 rounded-full w-1/2 mt-1" />
        </div>
      </div>
    </div>
  );
}
