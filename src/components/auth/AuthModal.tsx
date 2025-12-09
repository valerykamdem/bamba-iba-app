'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/Button';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const pathname = usePathname();
    const redirectUrl = pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                <User className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Bienvenue
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Connectez-vous pour accéder à toutes les fonctionnalités
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Link href={`/login${redirectUrl}`} className="block w-full" onClick={onClose}>
                                <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
                                    <LogIn className="w-5 h-5" />
                                    Se connecter
                                </Button>
                            </Link>

                            <Link href={`/register${redirectUrl}`} className="block w-full" onClick={onClose}>
                                <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                    <UserPlus className="w-5 h-5" />
                                    S'inscrire
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
