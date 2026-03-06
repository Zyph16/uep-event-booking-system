"use client";

import React from 'react';
import './albumCard.css';
import { getDisplayImageUrl } from "@/utils/config";

interface AlbumCardProps {
    images?: any[];
    title?: string;
    onClick?: () => void;
}

export default function AlbumCard({ images = [], title, onClick }: AlbumCardProps) {
    // We only display up to 6 images max to preserve the CSS stacking
    const displayImages = images.slice(0, 6);

    return (
        <div
            onClick={onClick}
            className="mb-2 w-[110px] hover:w-[170px] transition-[width] duration-200 ease-out m-0 p-0 overflow-visible group/card flex-shrink-0 cursor-pointer"
        >

            <div className="relative w-full h-[180px] flex items-center justify-start rounded-2xl overflow-hidden">
                {/* The album fan itself */}
                <div className="album-container origin-center w-[120px] h-full relative z-10 bg-transparent">
                    {displayImages.map((img, idx) => {
                        const isTopCard = idx === displayImages.length - 1;
                        return (
                            <div
                                key={idx}
                                className="relative rounded-xl overflow-hidden"
                                style={{
                                    backgroundImage: `url(${getDisplayImageUrl(img.image_path)})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    border: '4px solid white'
                                }}
                            >
                                {/* Hover Text Overlay (Only on Top Card) */}
                                {isTopCard && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 border-none">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-wider text-center leading-tight px-1 drop-shadow-md">
                                            Click<br />Open<br />Album
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                </div>
                {title && (
                    <div title={title} className="absolute bottom-2 left-[5px] w-[96px] text-center text-sm font-semibold text-gray-700 truncate">
                        {title}
                    </div>
                )}
            </div>


        </div>
    );
}
