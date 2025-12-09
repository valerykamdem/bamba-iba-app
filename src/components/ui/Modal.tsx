'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    // 1. État pour vérifier que le composant est monté (exécuté) côté client
    const [mounted, setMounted] = useState(false);

    // 2. Ce useEffect est crucial : il définit 'mounted' à true après l'hydratation côté client.
    useEffect(() => {
        setMounted(true);
    }, []);

    // 3. Empêcher le défilement (logique déjà correcte)
    useEffect(() => {
        if (!mounted) return; // S'assurer que le code s'exécute uniquement côté client
        
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, mounted]); // Dépendance ajoutée : mounted

    // 4. Fermer sur la touche Échap (logique déjà correcte)
    useEffect(() => {
        if (!mounted) return; // S'assurer que le code s'exécute uniquement côté client

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        // Utilisation de 'window' (client-side API)
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose, mounted]); // Dépendance ajoutée : mounted

    // 5. Rendu conditionnel du Portal
    // Si nous ne sommes pas montés (côté serveur ou juste avant l'hydratation), nous retournons null.
    if (!mounted) {
        return null;
    }
    
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-colors"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                                {title && (
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {title}
                                    </h2>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}