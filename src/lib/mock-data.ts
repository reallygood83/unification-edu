import { NewsItem, VideoItem, StudentProgress } from '@/types';

export const mockNews: NewsItem[] = [
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
  {
    id: 'news3',
    title: '한반도 통일을 위한 경제 협력 건의',
    description: '남북한 경제 협력을 위한 새로운 방안이 제시되었습니다...',
    url: 'https://example.com/news3',
    urlToImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e',
    publishedAt: '2023-09-15',
    source: { name: '경제 도사' }
  },
  {
    id: 'news4',
    title: '통일 후 한반도의 사회 복지 시스템 방향',
    description: '한반도 통일 이후 사회 복지 시스템의 통합 방향에 대한 전문가 제안...',
    url: 'https://example.com/news4',
    urlToImage: 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d',
    publishedAt: '2023-08-22',
    source: { name: '사회 과학 저널' }
  },
];

export const mockVideos: VideoItem[] = [
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
  {
    id: 'video3',
    title: '남북한 문화 언어 차이와 소통 방법',
    description: '남북한의 언어와 문화적 차이점을 이해하고 소통하는 방법에 대한 어학 전문가의 설명...',
    thumbnailUrl: 'https://i.ytimg.com/vi/dummy3/maxresdefault.jpg',
    videoId: 'dummy3',
    channelTitle: '언어학 연구소',
    publishedAt: '2023-07-20'
  },
  {
    id: 'video4',
    title: '통일교육 프로그램을 통한 학생 인식 변화',
    description: '학교에서의 통일교육 프로그램이 학생들의 통일 인식에 미치는 영향에 대한 연구 결과...',
    thumbnailUrl: 'https://i.ytimg.com/vi/dummy4/maxresdefault.jpg',
    videoId: 'dummy4',
    channelTitle: '교육 연구 센터',
    publishedAt: '2023-06-10'
  },
];

// Mock for student progress
export const mockStudentProgress: StudentProgress = {
  id: 'student-1',
  completedDays: 3,
  lastCompletedDate: new Date().toISOString(),
  quizAttempts: [],
  certificateEarned: false,
};
