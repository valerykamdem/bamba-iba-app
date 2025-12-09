export function Skeleton({
    className = '',
    circle = false
}: {
    className?: string;
    circle?: boolean;
}) {
    return (
        <div
            className={`animate-pulse bg-gray-200 ${circle ? 'rounded-full' : 'rounded'} ${className}`}
        />
    );
}

export function VideoCardSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="w-full aspect-video" />
            <div className="flex gap-3">
                <Skeleton circle className="w-10 h-10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        </div>
    );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <VideoCardSkeleton key={i} />
            ))}
        </div>
    );
}
