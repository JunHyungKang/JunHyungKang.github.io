---
name: triage
description: Manage GitHub issues for the public blog and portfolio repo. Use when creating, filing, labeling, deduplicating, updating, closing, summarizing, or turning TODOs into PR-sized issues for blog posts, publishing, public profile, portfolio UI, SEO, source research, and public-safe content work.
---

# Triage

`JunHyungKang/JunHyungKang.github.io`의 GitHub issue lane이다. Blog/public-site TODO는 채팅이나 로컬 메모에만 남기지 말고 issue로 관리한다.

## Defaults

- Repo: `JunHyungKang/JunHyungKang.github.io`
- 이슈 본문과 사용자 보고는 한국어로 쓴다.
- 이 repo 안에서는 `gh issue ...`를 우선한다.
- 새 이슈를 만들기 전 open issue overlap을 먼저 확인한다.
- 이슈는 PR-sized로 유지한다. 관련 없는 follow-up은 분리한다.
- Private career/application material belongs in `../career-ops`; do not paste resume PDFs/HTML, recruiter messages, rejection emails, compensation notes, phone numbers, or private ATS data into issues here.

## TODO Rules

- Actionable TODO는 blog post, draft, source research, image/static path, SEO metadata, about/profile, portfolio UI, or repo guidance 중 어느 표면인지 분류해서 issue로 남긴다.
- 구현 가능한 TODO는 `enhancement` + `ready-for-agent` 후보로 둔다.
- 공개 여부, 개인 정보, career/private boundary, sensitive claim, or publication decision이 필요한 TODO는 `ready-for-human` 후보로 둔다.
- 최신 공식 문서, 논문, 뉴스, 한국어 웹 출처, 또는 claim verification이 필요한 TODO는 `needs-info`로 두고 필요한 source와 research question을 적는다.
- broad cleanup TODO는 파일 목록보다 사용자-visible behavior, 완료 조건, 검증 명령을 먼저 적는다.

## Label Model

Use one category label and one state label when labels exist.

Category:

- `bug`: broken page, build/deploy failure, wrong public content, privacy leak risk, broken image/link, or incorrect source claim
- `enhancement`: blog/content improvement, SEO/public profile work, design/UI improvement, docs/guidance, or cleanup

State:

- `needs-triage`: not classified yet
- `needs-info`: needs source verification, claim evidence, user decision details, or missing asset/content
- `ready-for-agent`: ready for safe autonomous editing
- `ready-for-human`: needs publish approval, public/private boundary decision, sensitive wording approval, or human review

Optional:

- `follow-up`: follow-up found while handling another issue
- `blocked`: blocked by access, external source, deployment state, or user decision

Do not create or use disposition labels such as `duplicate`, `invalid`, `wontfix`, `ready`, `question`, or `needs-user-input`. Use canonical issue links, comments, and close reasons instead.

## Workflow

1. Read live issue and label state.
   ```bash
   gh issue list --repo JunHyungKang/JunHyungKang.github.io --state open --limit 100 --json number,title,labels,updatedAt,url
   gh label list --repo JunHyungKang/JunHyungKang.github.io --limit 100
   ```
2. Classify the request:
   - `file`: create a new issue if no canonical issue exists
   - `todo`: convert actionable TODO into a PR-sized issue or follow-up candidate
   - `update`: comment or edit an existing issue
   - `dedupe`: link canonical issue, then comment/close if appropriate
   - `ready-for-agent`: write a durable implementation brief
   - `ready-for-human`: mark the human/publication decision needed
   - `needs-info`: leave the exact research question or missing source
   - `summarize`: group by category/state and call out mismatches
3. Apply the smallest issue-tracker change with `gh`.
4. Report the issue URL, labels/state, next lane, and any open decision.

## Issue Template

```markdown
## 설명
...

## 요구/범위
- ...

## 완료 조건
- ...

## 열려 있는 질문
- ...

## 근거
- ...

## 관련
- ...
```

Delete irrelevant sections. Use `없음` only when saying the absence is useful.
