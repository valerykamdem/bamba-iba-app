import Image from 'next/image';
import { clsx } from 'clsx';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fallback?: string;
    className?: string;
    online?: boolean;
}

export function Avatar({
    src,
    alt = 'Avatar',
    size = 'md',
    fallback,
    className,
    online
}: AvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    return (
        <div className={clsx('relative inline-block', className)}>
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    width={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
                    height={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
                    className={clsx('rounded-full object-cover', sizeClasses[size])}
                />
            ) : (
                <div
                    className={clsx(
                        'rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold',
                        sizeClasses[size]
                    )}
                >
                    {fallback || alt.charAt(0).toUpperCase()}
                </div>
            )}

            {online && (
                <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
        </div>
    );
}
