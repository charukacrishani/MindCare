'use client';
import { PageHeader } from "@/components/PageHeader";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";

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
            <div className="p-4 md:p-6 lg:p-8">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
                            <p className="text-gray-600">Loading videos...</p>
                        </div>
                    </div>
                )}
                {!loading && videoContent.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No videos available at the moment.</p>
                    </div>
                )}
                {!loading && videoContent.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videoContent.map((video, index) => (
                            <div key={index} className="group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white flex flex-col">
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
                                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{video.title}</h3>
                                    <p className="text-sm text-gray-600 mb-1">{video.channel}</p>
                                    <p className="text-xs text-gray-500 mb-4">{new Date(video.published).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
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