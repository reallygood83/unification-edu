"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { unificationCategories } from '@/lib/data';
import { Content, NewsItem, VideoItem } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for content
const mockNews: NewsItem[] = [
  {
    id: 'news1',
    title: '한반도 평화 정착을 위한 문화 교류 확대',
    description: '남북한 문화 교류를 통한 새로운 평화 정착 노력이 진행 중입니다...',
    url: 'https://example.com/news1',
    urlToImage: 'https://images.unsplash.com/photo-1627664819818-e147d6d79517',
    publishedAt: '2023-10-15',
    source: { name: '한반도 뉴스' }
  },
  {
    id: 'news2',
    title: '통일 교육 강화를 위한 학교 프로그램 확대',
    description: '교육부는 통일 교육을 강화하기 위한 새로운 학교 프로그램을 발표했습니다...',
    url: 'https://example.com/news2',
    urlToImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7',
    publishedAt: '2023-09-28',
    source: { name: '교육 소식' }
  },
];

const mockVideos: VideoItem[] = [
  {
    id: 'video1',
    title: '한반도 역사와 분단의 배경',
    description: '한반도의 역사와 남북 분단에 대한 이해를 도와주는 교육 동영상입니다...',
    thumbnailUrl: 'https://i.ytimg.com/vi/dummy1/maxresdefault.jpg',
    videoId: 'dummy1',
    channelTitle: '한반도 평화 채널',
    publishedAt: '2023-10-05'
  },
  {
    id: 'video2',
    title: '통일 한국의 미래와 경제적 효과',
    description: '한반도 통일이 가져올 경제적 효과와 미래 발전 가능성에 대한 분석...',
    thumbnailUrl: 'https://i.ytimg.com/vi/dummy2/maxresdefault.jpg',
    videoId: 'dummy2',
    channelTitle: '한국 통일 연구원',
    publishedAt: '2023-08-15'
  },
];

export default function ContentPage() {
  const router = useRouter();
  const { category } = useParams() as { category: string };
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [contentType, setContentType] = useState<'news' | 'video'>('news');
  
  // Get category info
  const categoryInfo = unificationCategories.find(cat => cat.id === category);
  
  // Get appropriate content based on selected category
  const content = contentType === 'news' ? mockNews : mockVideos;

  const handleContentSelect = (content: Content) => {
    setSelectedContent(content);
  };

  const handleCreateQuiz = () => {
    if (selectedContent) {
      router.push(`/teacher/quiz/create?content=${selectedContent.id}&type=${contentType}`);
    }
  };

  if (!categoryInfo) {
    return <div className="container mx-auto px-4 py-8">Category not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/teacher" className="text-primary hover:underline">
          &larr; 카테고리로 돌아가기
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">{categoryInfo.name}</h1>
      <p className="text-gray-600 mb-8">{categoryInfo.description}</p>
      
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setContentType('news')}
            className={`px-4 py-2 rounded-md ${contentType === 'news' ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            뉴스 기사
          </button>
          <button
            onClick={() => setContentType('video')}
            className={`px-4 py-2 rounded-md ${contentType === 'video' ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            에듀케이션 동영상
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {content.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer
              ${selectedContent?.id === item.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleContentSelect(item)}
          >
            <div className="relative h-48 w-full">
              <Image
                src={'urlToImage' in item ? item.urlToImage : item.thumbnailUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{'source' in item ? item.source.name : item.channelTitle}</span>
                <span>{new Date(item.publishedAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedContent && (
        <div className="flex justify-center mb-8">
          <button
            onClick={handleCreateQuiz}
            className="btn-primary text-lg px-6 py-3"
          >
            선택한 콘텐츠로 퀴즈 생성하기
          </button>
        </div>
      )}
    </div>
  );
}
