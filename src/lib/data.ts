import { Category } from '@/types';

export const unificationCategories: Category[] = [
  {
    id: 'history',
    name: '한반도 역사',
    description: '한반도의 역사와 분단 과정에 대한 퀴즈',
    gradeLevel: ['elementary', 'middle', 'high'],
    keywords: ['한반도 역사', '분단 역사', '한국전쟁', '남북한 분단 원인', '광복', '한민족 역사']
  },
  {
    id: 'culture',
    name: '남북한 문화',
    description: '남북한의 문화, 언어, 생활스타일에 대한 퀴즈',
    gradeLevel: ['elementary', 'middle', 'high'],
    keywords: ['남북한 문화 차이', '북한 문화', '남북한 언어 차이', '북한 생활', '북한 교육', '북한 예술']
  },
  {
    id: 'geography',
    name: '한반도 지리',
    description: '한반도의 지리적 특성과 경제 자원에 대한 퀴즈',
    gradeLevel: ['middle', 'high'],
    keywords: ['한반도 지리', '북한 지리', '북한 자원', '한반도 지형', '백두산', '압록강', '두만강']
  },
  {
    id: 'politics',
    name: '정치와 외교',
    description: '남북한의 정치 체제와 국제 관계에 대한 퀴즈',
    gradeLevel: ['high'],
    keywords: ['남북한 정치체제', '북한 정치', '남북 관계', '통일 외교', '6자회담', '종전선언']
  },
  {
    id: 'economy',
    name: '경제 통합',
    description: '경제 통합과 한반도 평화 경제에 대한 퀴즈',
    gradeLevel: ['middle', 'high'],
    keywords: ['남북경협', '개성공단', '북한 경제', '한반도 신경제지도', '평화경제', '통일 비용과 편익']
  },
  {
    id: 'unification',
    name: '통일 과정',
    description: '통일 과정과 미래 비전에 대한 퀴즈',
    gradeLevel: ['elementary', 'middle', 'high'],
    keywords: ['통일 정책', '통일 방안', '점진적 통일', '통일 시나리오', '통일 한국', '독일 통일 사례']
  },
  {
    id: 'peace',
    name: '평화와 인권',
    description: '한반도 평화와 북한 인권 문제에 관한 퀴즈',
    gradeLevel: ['middle', 'high'],
    keywords: ['한반도 평화', '북한 인권', '이산가족', '탈북민', '평화협정', '종전선언', '비핵화']
  },
  {
    id: 'youth',
    name: '청소년과 통일',
    description: '청소년들의 통일 인식과 참여에 관한 퀴즈',
    gradeLevel: ['elementary', 'middle'],
    keywords: ['청소년 통일교육', '통일 인식', '통일 의식', '학교 통일교육', '미래세대와 통일']
  }
];

export const gradeLevels = [
  { id: 'elementary', name: '초등학교' },
  { id: 'middle', name: '중학교' },
  { id: 'high', name: '고등학교' },
];

export const difficultyLevels = [
  { id: 'easy', name: '쉬움' },
  { id: 'medium', name: '보통' },
  { id: 'hard', name: '어려움' },
];
