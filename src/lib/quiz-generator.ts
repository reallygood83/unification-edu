import { Quiz, QuizQuestion, NewsItem, VideoItem } from '@/types';
import { mockNews, mockVideos } from './mock-data';

// This is a mock function that simulates calling the OpenAI API to generate a quiz
export const mockGenerateQuiz = async (contentId: string, contentType: 'news' | 'video'): Promise<Quiz> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Find the content
  const content = contentType === 'news' 
    ? mockNews.find(item => item.id === contentId)
    : mockVideos.find(item => item.id === contentId);
    
  if (!content) {
    throw new Error('Content not found');
  }
  
  // Generate a mock quiz based on the content
  const questions: QuizQuestion[] = [
    {
      id: `q1-${contentId}`,
      question: contentType === 'news'
        ? `${(content as NewsItem).title}에 따르면, 정부가 추진하는 통일 정책의 주요 방향은 무엇인가요?`
        : `${(content as VideoItem).title}에서 언급한 남북한 문화 교류의 주요 사례는 무엇인가요?`,
      options: [
        '문화 교류 확대',
        '경제 협력 강화',
        '군사적 긴장 해소',
        '국제 사회 지지 확보'
      ],
      correctAnswerIndex: 0,
      explanation: '콘텐츠에서는 남북한 문화 교류를 통한 평화 정착 노력이 가장 중요한 부분으로 언급되었습니다.'
    },
    {
      id: `q2-${contentId}`,
      question: '한반도 통일을 위한 교육의 중요성은 어디에 있나요?',
      options: [
        '새로운 세대를 위한 올바른 역사 인식',
        '경제적 혐택에 대한 이해',
        '군사적 대비의 필요성',
        '국제 연대의 중요성'
      ],
      correctAnswerIndex: 0,
      explanation: '통일 교육은 새로운 세대가 한반도의 역사와 분단 상황을 정확히 이해하고 통일에 대한 올바른 인식을 가지도록 하는 것이 중요합니다.'
    },
    {
      id: `q3-${contentId}`,
      question: '한반도 통일을 위한 어떤 활동이 가장 효과적인가요?',
      options: [
        '교육 및 문화 교류',
        '경제적 지원 및 협력',
        '정치적 협상 및 합의',
        '국제 사회 언론전'
      ],
      correctAnswerIndex: 0,
      explanation: '장기적인 관점에서 보면 교육과 문화 교류를 통한 상호 이해와 신뢰 구축이 지속 가능한 통일의 토대를 만드는 데 가장 효과적입니다.'
    },
    {
      id: `q4-${contentId}`,
      question: '학교에서의 통일 교육을 강화하기 위한 가장 좋은 방법은 무엇인가요?',
      options: [
        '샘코스와 퀴즈를 통한 학습 활동',
        '주요 사실을 암기하는 암기식 학습',
        '교사의 강의 위주의 학습',
        '책으로만 학습하는 이론 위주 학습'
      ],
      correctAnswerIndex: 0,
      explanation: '통일 교육은 학생들이 적극적으로 참여하고 흥미를 느끼는 활동을 통해 가장 효과적으로 이뤄질 수 있으며, 퀴즈와 샘코스 형태의 학습은 학생들의 흐미를 유발할 수 있습니다.'
    },
    {
      id: `q5-${contentId}`,
      question: '통일 한국이 가질 수 있는 가장 큰 강점은 무엇이라고 생각하나요?',
      options: [
        '경제적 시너지 효과',
        '군사적 공고화',
        '문화적 다양성 증가',
        '인구 증가'
      ],
      correctAnswerIndex: 0,
      explanation: '통일 한국은 북한의 자원과 남한의 기술 및 자본이 결합되어 새로운 경제적 시너지를 만들어낼 수 있으며, 이는 국가 경제의 크기와 경쟁력을 높일 수 있습니다.'
    }
  ];

  return {
    id: `quiz-${contentId}-${Date.now()}`,
    title: `${contentType === 'news' ? (content as NewsItem).title : (content as VideoItem).title} - 통일교육 퀴즈`,
    description: `이 퀴즈는 ${contentType === 'news' ? '뉴스 기사' : '동영상'} "${contentType === 'news' ? (content as NewsItem).title : (content as VideoItem).title}" 를 기반으로 생성되었습니다.`,
    questions,
    category: 'unification',
    sourceContent: content,
    createdAt: new Date().toISOString(),
  };
};
