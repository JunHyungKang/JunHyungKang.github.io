import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = 'https://junhyungkang.github.io';

export const metadata: Metadata = {
  title: '작성·검증 원칙',
  description: '강준형의 AI 엔지니어링 블로그가 글의 직접 기여, 근거, 출처, AI 활용과 수정 이력을 다루는 기준입니다.',
  alternates: {
    canonical: `${siteUrl}/editorial-policy`,
  },
};

const principles = [
  {
    title: '직접 해본 일에서 시작합니다',
    body: '구현, 실험, 운영 또는 설계 판단처럼 작성자가 직접 관여한 경험을 글의 중심에 둡니다. 공개 문서나 논문을 인용할 때는 요약으로 끝내지 않고, 실제 문제에서 무엇을 확인했고 어떤 판단이 달라졌는지 설명합니다.',
  },
  {
    title: '기여와 기준선을 구분합니다',
    body: '오픈소스, 공개 모델, 외부 연구와 작성자가 만든 코드·검증 절차·운영 판단을 분리해 적습니다. 공개 기준선 위에서 얻은 결과를 전부 작성자의 성과처럼 표현하지 않습니다.',
  },
  {
    title: '재현 가능한 근거를 우선합니다',
    body: '가능하면 실행 환경, 버전, 입력 조건, 코드, 로그, 수치와 실패 사례를 남깁니다. 통제된 비교가 아니면 인과관계로 단정하지 않고 관찰 결과와 한계를 함께 밝힙니다.',
  },
  {
    title: '출처와 시점을 확인합니다',
    body: '변경 가능성이 큰 기술 정보는 공식 문서, 릴리스 노트, 논문과 원본 저장소를 우선 확인합니다. 외부 자료를 사용한 문장과 이미지는 출처를 표시하고, 오래된 글은 현재도 유효한 정보처럼 보이지 않도록 갱신하거나 검색 노출에서 제외합니다.',
  },
];

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 pb-20 pt-32 text-slate-200">
      <article className="mx-auto max-w-3xl">
        <header className="mb-12 border-b border-slate-800 pb-10">
          <p className="mb-3 text-sm font-medium tracking-wider text-blue-400">EDITORIAL POLICY</p>
          <h1 className="text-4xl font-bold text-white md:text-5xl">작성·검증 원칙</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            이 블로그는 AI 엔지니어 강준형이 직접 구현하고 운영하며 얻은 판단을 공개적으로 검증 가능한 형태로 남기는 개인 기술 기록입니다.
          </p>
        </header>

        <div className="space-y-6">
          {principles.map((principle) => (
            <section key={principle.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-xl font-bold text-white">{principle.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-400">{principle.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white">AI 도구 사용</h2>
          <p className="mt-4 leading-relaxed text-slate-400">
            자료 탐색, 글의 구조화, 코드 검토와 문장 교정에 AI 도구를 사용할 수 있습니다. 다만 글에 공개하는 사실, 코드, 수치, 출처와 최종 판단은 작성자가 직접 확인하고 책임집니다. AI가 실험을 수행했거나 결과 해석에 중요한 역할을 한 경우에는 본문에 그 범위와 방법을 설명합니다.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-white">수정과 제보</h2>
          <p className="mt-4 leading-relaxed text-slate-400">
            사실 오류나 재현되지 않는 절차를 발견하면 내용을 수정하고, 의미가 달라진 글에는 수정일을 표시합니다. 정정이 필요하면{' '}
            <a href="mailto:gogo0920007@gmail.com" className="text-blue-400 hover:text-blue-300">이메일</a>
            로 알려주세요.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-slate-800 pt-8 text-sm">
          <Link href="/about" className="font-medium text-blue-400 hover:text-blue-300">작성자 소개 →</Link>
          <Link href="/posts" className="font-medium text-blue-400 hover:text-blue-300">공개 글 보기 →</Link>
          <Link href="/privacy-policy" className="font-medium text-blue-400 hover:text-blue-300">개인정보처리방침 →</Link>
        </div>
      </article>
    </main>
  );
}
