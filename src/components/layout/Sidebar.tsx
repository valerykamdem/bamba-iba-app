'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tv, Video, Mic, Bell, Radio, Upload, TrendingUp, Clock, Heart, Film, Youtube } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const { isAuthenticated, _hydrated } = useAuth();

  interface MenuItem {
    icon: React.ElementType;
    label: string;
    href: string;
    badge?: string;
    badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'live';
    requiresAuth?: boolean;
  }

  interface MenuGroup {
    id: string;
    items: MenuItem[];
  }

  const menuGroups: MenuGroup[] = [
    {
      id: 'main',
      items: [
        { icon: Home, label: 'Accueil', href: '/' },
        { icon: Film, label: 'Médiathèque', href: '/media' },
        { icon: Bell, label: 'Annonces', href: '/announcements' },
      ]
    },
    {
      id: 'media',
      items: [
        // { icon: Tv, label: 'Lives', href: '/live', badge: 'LIVE', badgeVariant: 'live' },
        { icon: Radio, label: 'Radio', href: '/radio', badge: 'LIVE', badgeVariant: 'live' },
        // { icon: Radio, label: 'Radio_New', href: '/radioNew', badge: 'LIVE', badgeVariant: 'live' },
        { icon: Youtube, label: 'YouTube', href: '/youtube' },
      ]
    },
    {
      id: 'library',
      items: [
        { icon: TrendingUp, label: 'Tendances', href: '/trending' },
        { icon: Clock, label: 'Historique', href: '/history', requiresAuth: true },
        { icon: Upload, label: 'Upload', href: '/upload', requiresAuth: true },
        { icon: Heart, label: 'Favoris', href: '/favorites', requiresAuth: true },
      ]
    }
  ];

  // Filtrer les items qui nécessitent l'authentification
  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => !item.requiresAuth || isAuthenticated)
  })).filter(group => group.items.length > 0);

  return (
    <motion.aside
      initial={{ width: isOpen ? 256 : 80 }}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto scrollbar-hide z-40"
    >
      <nav className="p-3 space-y-4">
        {filteredMenuGroups.map((group, groupIndex) => (
          <div key={group.id}>
            {groupIndex > 0 && (
              <div className="my-2 border-t border-gray-200 dark:border-gray-800 mx-2" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group',
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <Icon className={clsx(
                      'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
                      isActive && 'text-blue-600'
                    )} />

                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between flex-1"
                      >
                        <span className={clsx(
                          'font-medium',
                          isActive && 'text-blue-600'
                        )}>
                          {item.label}
                        </span>

                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant}
                            size="sm"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </motion.div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-0 right-0 px-4"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>© 2025 BambaibaApp</p>
            <p>Version 2.0</p>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
