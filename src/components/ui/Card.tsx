import { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
    glass?: boolean;
}

export function Card({
    children,
    className,
    hover = false,
    glass = false,
    ...props
}: CardProps) {
    return (
        <div
            className={clsx(
                'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
                {
                    'hover:shadow-lg hover:-translate-y-1 transition-all duration-300': hover,
                    'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md': glass,
                },
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)} {...props}>
            {children}
        </div>
    );
}

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx('px-6 py-4', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx('px-6 py-4 border-t border-gray-200 dark:border-gray-700', className)} {...props}>
            {children}
        </div>
    );
}
