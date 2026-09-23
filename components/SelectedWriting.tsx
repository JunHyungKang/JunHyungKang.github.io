import Link from 'next/link';

const articles = [
    {
        slug: '2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration',
        title: 'FastMCP 사용자라고 모두 MCP Python SDK v2로 옮겨야 하는 건 아니었다',
        description: '패키지 의존성과 연결 방식을 격리된 Python 환경에서 확인했습니다. 실행 코드와 결과를 함께 공개합니다.',
    },
    {
        slug: '2026-07-31-A2A-Agent-Delegation-Authorization',
        title: '사용자 승인을 회수했지만 A2A Task는 계속 실행됐다',
        description: '승인 회수, 작업 취소, 쓰기 직전 권한 확인을 비교한 실험입니다. 실행 중인 작업과 애플리케이션 권한의 경계를 다룹니다.',
    },
    {
        slug: '2026-08-09-Agent-Ontology-Context',
        title: 'Agent를 위한 온톨로지는 전사 데이터 모델에서 시작하지 않는다',
        description: 'Agent가 답해야 할 질문에서 출발해 필요한 관계와 근거를 정하는 설계 관점을 정리했습니다.',
    },
];

export default function SelectedWriting() {
    return (
        <section aria-labelledby="selected-writing-heading" className="my-12 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
            <h2 id="selected-writing-heading" className="text-2xl font-bold text-white mb-3">구현과 설계 기록</h2>
            <p className="text-slate-400 leading-relaxed mb-6">직접 확인한 동작과 설계 과정에서 달라진 판단을 글로 남깁니다.</p>
            <ul className="space-y-6">
                {articles.map(({ slug, title, description }) => (
                    <li key={slug}>
                        <Link href={`/posts/${slug}`} className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
                            {title}
                        </Link>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
                    </li>
                ))}
            </ul>
            <Link href="/posts" className="inline-block mt-6 text-sm text-blue-400 hover:underline">전체 글 보기 →</Link>
        </section>
    );
}
