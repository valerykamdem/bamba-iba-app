'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function HeroSection() {
    return (
        <div className="relative w-full h-[80vh] min-h-[600px] max-h-[800px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/api/placeholder/1920/1080" // Replace with actual hero image
                    alt="Hero Background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl space-y-6"
                    >
                        {/* Badge */}
                        <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold tracking-wider uppercase rounded-full">
                            Nouveauté
                        </span>

                        {/* Title */}
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                            L'Évangile <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                Sans Frontières
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg text-gray-200 leading-relaxed max-w-xl">
                            Découvrez une nouvelle façon de vivre votre foi. Des enseignements profonds,
                            de la louange inspirante et une communauté vibrante, accessibles partout.
                        </p>

                        {/* Buttons */}
                        <div className="flex items-center gap-4 pt-4">
                            <Link href="/videos">
                                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-6 text-lg rounded-full flex items-center gap-2">
                                    <Play className="w-5 h-5 fill-current" />
                                    Regarder
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button variant="ghost" size="lg" className="text-white border border-white/30 hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-full flex items-center gap-2">
                                    <Info className="w-5 h-5" />
                                    En savoir plus
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                    <div className="w-1 h-2 bg-white/50 rounded-full" />
                </div>
            </motion.div>
        </div>
    );
}
