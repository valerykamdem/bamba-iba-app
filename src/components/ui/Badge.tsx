import { clsx } from 'clsx';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'live';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Badge({
    children,
    variant = 'primary',
    size = 'md',
    className
}: BadgeProps) {
    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-full font-medium',
                {
                    // Variants
                    'bg-blue-100 text-blue-800': variant === 'primary',
                    'bg-green-100 text-green-800': variant === 'success',
                    'bg-yellow-100 text-yellow-800': variant === 'warning',
                    'bg-red-100 text-red-800': variant === 'danger',
                    'bg-red-500 text-white animate-pulse': variant === 'live',

                    // Sizes
                    'px-2 py-0.5 text-xs': size === 'sm',
                    'px-2.5 py-0.5 text-sm': size === 'md',
                    'px-3 py-1 text-base': size === 'lg',
                },
                className
            )}
        >
            {variant === 'live' && (
                <span className="w-2 h-2 bg-white rounded-full mr-1.5" />
            )}
            {children}
        </span>
    );
}
