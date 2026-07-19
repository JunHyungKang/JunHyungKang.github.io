import type { PostData } from '@/lib/posts';

export interface Topic {
  slug: string;
  name: string;
  description: string;
  tags: string[];
}

export const topics: Topic[] = [
  {
    slug: 'ai-agents',
    name: 'AI 에이전트',
    description: 'Agentic AI, LangGraph, 워크플로우와 자율형 에이전트의 설계·실험 기록을 모았습니다.',
    tags: ['Agent', 'AI Agent', 'Agentic AI', 'LangGraph', 'Workflow', 'Long-running Agent'],
  },
  {
    slug: 'agent-harness',
    name: '에이전트 하네스',
    description: 'Codex·Claude Code·Cursor를 운영하며 얻은 하네스, 평가, 거버넌스 설계 경험을 다룹니다.',
    tags: [
      'Agent Harness',
      'Harness Engineering',
      'Agent Evals',
      'Evals',
      'Governance',
      'Coding Assistant',
      'Codex',
      'Claude Code',
      'Cursor',
    ],
  },
  {
    slug: 'llm-engineering',
    name: 'LLM 엔지니어링',
    description: 'LLM 애플리케이션, 프롬프트·컨텍스트 엔지니어링과 모델 최적화 실무를 정리합니다.',
    tags: [
      'LLM',
      'DSPy',
      'Prompt Engineering',
      'Context Engineering',
      'ACE',
      'AI Engineering',
      'AI Development',
      'Optimizer',
    ],
  },
];

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('en');
}

export function getTopicBySlug(slug: string) {
  return topics.find((topic) => topic.slug === slug);
}

export function getTopicsForTags(tags: string[] = []) {
  const normalizedTags = new Set(tags.map(normalize));
  return topics.filter((topic) => topic.tags.some((tag) => normalizedTags.has(normalize(tag))));
}

export function getPostsForTopic(posts: PostData[], topic: Topic) {
  const topicTags = new Set(topic.tags.map(normalize));
  return posts.filter((post) => post.tags?.some((tag) => topicTags.has(normalize(tag))));
}
