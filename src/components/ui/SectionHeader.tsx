'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    href?: string;
    actionLabel?: string;
}

export default function SectionHeader({ title, subtitle, icon, href, actionLabel = "Voir tout" }: SectionHeaderProps) {
    return (
        <div className="flex items-end justify-between mb-6 px-6 md:px-12">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    {icon}
                    {subtitle && <span className="text-sm font-bold tracking-wider uppercase">{subtitle}</span>}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            </div>

            {href && (
                <Link href={href} className="group flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                    {actionLabel}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            )}
        </div>
    );
}
