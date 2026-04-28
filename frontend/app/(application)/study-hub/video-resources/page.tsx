'use client';
import { PageHeader } from "@/components/PageHeader";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { Loader, Video } from "lucide-react";

type VideoContent = {
    title: string;
    channel: string;
    url: string;
    thumbnail: string;
    published: string;
}

const getYouTubeEmbedUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.includes("youtu.be")) {
            const videoId = parsedUrl.pathname.replace("/", "");
            return `https://www.youtube.com/embed/${videoId}`;
        }

        const videoId = parsedUrl.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
        return url;
    }
}

export default function VideoResourcesPage() {

    const [videoContent, setVideoContent] = useState<VideoContent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData();
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get<VideoContent[]>("/study-hub/videos")
            setVideoContent(response.data);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full mx-auto">
            <PageHeader title="Video Resources" shortTitle="Video Resources" description="Access a collection of educational videos on mental health and self-care techniques." />
            <div className="p-4">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader className="w-8 h-8 animate-spin text-[#980194]" />
                        <p className="text-sm text-gray-500">Loading videos...</p>
                    </div>
                )}
                {!loading && videoContent.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
                        <Video className="w-10 h-10 text-gray-200" />
                        <p className="text-gray-500">No videos available at the moment.</p>
                        <p className="text-sm text-gray-400">Check back soon for new resources.</p>
                    </div>
                )}
                {!loading && videoContent.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videoContent.map((video, index) => (
                            <div key={index} className="group border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
                                <div className="h-125 bg-gray-900 overflow-hidden relative">
                                    <iframe
                                        src={getYouTubeEmbedUrl(video.url)}
                                        title={video.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                                <div className="p-4 flex flex-col grow">
                                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#980194] transition-colors">{video.title}</h3>
                                    <p className="text-sm text-gray-600 mb-1">{video.channel}</p>
                                    <p className="text-xs text-gray-500 mb-4">{new Date(video.published).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center text-sm font-medium text-[#980194] hover:text-[#7a0177] transition-colors">
                                        Watch on YouTube
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
