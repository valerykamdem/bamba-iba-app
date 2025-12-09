'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { User, Settings, LogOut, HelpCircle, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useRef } from 'react';

interface UserMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginClick: () => void;
}

export default function UserMenu({ isOpen, onClose, onLoginClick }: UserMenuProps) {
    const { user, logout, _hydrated } = useAuthStore();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen && _hydrated) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, _hydrated]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute top-16 right-4 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                    {/* User Header (if logged in) */}
                    {user && (
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        user.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.email || 'Utilisateur'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Items */}
                    <div className="py-2">
                        {user ? (
                            <Link
                                href="/profile"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={onClose}
                            >
                                <User className="w-4 h-4" />
                                Votre chaîne
                            </Link>
                        ) : null}

                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={onClose}
                        >
                            <Settings className="w-4 h-4" />
                            Paramètres
                        </Link>

                        <Link
                            href="/help"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={onClose}
                        >
                            <HelpCircle className="w-4 h-4" />
                            Aide
                        </Link>

                        <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

                        {user ? (
                            <button
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Se déconnecter
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    onLoginClick();
                                    onClose();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Se connecter
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
