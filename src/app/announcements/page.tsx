'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Megaphone, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';

// Mock data
const announcements = [
    {
        id: 1,
        title: 'Maintenance programmée',
        content: 'La plateforme sera en maintenance ce mardi de 03h00 à 05h00 pour des mises à jour de sécurité.',
        date: '2023-11-25',
        type: 'warning',
        author: 'Admin'
    },
    {
        id: 2,
        title: 'Nouveau : Mode Sombre disponible !',
        content: 'Vous pouvez désormais basculer entre le mode clair et sombre depuis le menu en haut à droite. Profitez d\'une expérience visuelle plus confortable la nuit.',
        date: '2023-11-24',
        type: 'info',
        author: 'Équipe Bambaiba'
    },
    {
        id: 3,
        title: 'Concours de création vidéo',
        content: 'Participez à notre grand concours mensuel et tentez de gagner un abonnement Premium d\'un an ! Plus de détails sur notre blog.',
        date: '2023-11-20',
        type: 'event',
        author: 'Marketing'
    }
];

export default function AnnouncementsPage() {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<typeof announcements[0] | null>(null);

    return (
        <MainLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <Megaphone className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Annonces</h1>
                        <p className="text-gray-500 dark:text-gray-400">Restez informé des dernières nouveautés et événements</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id} className="p-6 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge
                                            variant={
                                                announcement.type === 'warning' ? 'danger' :
                                                    announcement.type === 'event' ? 'success' : 'primary'
                                            }
                                        >
                                            {announcement.type.toUpperCase()}
                                        </Badge>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {announcement.date}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {announcement.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                                        {announcement.content}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Par {announcement.author}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            onClick={() => setSelectedAnnouncement(announcement)}
                                        >
                                            Lire plus <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Modal de détails */}
                <Modal
                    isOpen={!!selectedAnnouncement}
                    onClose={() => setSelectedAnnouncement(null)}
                    title={selectedAnnouncement?.title}
                >
                    {selectedAnnouncement && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge
                                    variant={
                                        selectedAnnouncement.type === 'warning' ? 'danger' :
                                            selectedAnnouncement.type === 'event' ? 'success' : 'primary'
                                    }
                                >
                                    {selectedAnnouncement.type.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {selectedAnnouncement.date}
                                </span>
                            </div>

                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                    {selectedAnnouncement.content}
                                </p>
                                {/* Ici on pourrait ajouter plus de contenu si disponible */}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Publié par <span className="font-medium text-gray-900 dark:text-white">{selectedAnnouncement.author}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </MainLayout>
    );
}
