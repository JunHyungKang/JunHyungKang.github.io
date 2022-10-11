---
title:  "GitLab Flow"
excerpt: "Introduction to GitLab Flow 번역"
toc: true
toc_sticky: true

categories:
  - tech
tags:
  - git
  - gitflow

last_modified_at: 2022-10-11T00:00:00-00:00
---

# Introduction to GitLab Flow
* 본 글은 gitlab의 [introduction docs](https://docs.gitlab.com/ee/topics/gitlab_flow.html)를 번역/정리 한 것임

GitLab에서는 이 GitLab flow를 best practices로 제안하여, feature-driven development와 issue tracking을 이용한 feature branches와 함께 사용하기를 제안함.
![Figure1](/assets/images/221011/221011_1.png)
Git을 사용하면 위의 그림과 같이 대부분 3가지 단계를 거쳐 commit을 동료에게 공유하게 된다.

1. working copy에서 작업한 파일을 staging area로 추가한다.
2. 나의 local repository에 commit한다.
3. 공유 remote repository에 push를 통해 공유한다.


이러한 방법은 git에 익숙하지 않은 구성원들이 이용할 경우, repository들이 쉽게 지져분해지거나 최신 코드를 찾는데 힘들고 어떤 branch에서 개발을 해야하는지 알기 어렵게 할 수 있다. \
이런 문제를 해결하기위해서 Git flow와 GitHub flow같은 standardized pattern이 적용된다. \
하지만 GitLab에서는 이러한 방법론에 여전히 improvement할 점이 있다고 생각하고, 아래와 같은 방법론을 제시하고 있다.

## Git flow and its problems
![Figure2](/assets/images/221011/221011_2.png){: .align-center}{: width="50%" height="50%"}
Git flow는 git branches를 이용하기위해 처름 제안된 방법중 하나로 많은 관심을 받아왔다. \
이 전략은 main branch와 별도로 devlop branch를 제안하고, 이를 지원하기위한 features, releases, hotfixes branch들을 제안한다. \
개발은 develop branch에서 이루어지고 release branch로 이동되며, main에 최종적으로 merge된다. 


Git flow는 잘 정의된 방법이지만, 그 복잡성때문에 두가지 문제가 발생한다.

1. 개발자는 main이 아닌 develop branch를 이용해야만 한다. (대부분의 tool들은 자동적으로 main branch를 default로 사용하기 때문에, 매번 다른 branch로 변환하는 것이 성가시다)
2. 최근에는 대부분의 조직에서 continuous delivery를 적용하기때문에 hotfix, release branch를 사용하는데 문제가 있다. (continuous delivery에서는 default branch가 deployed 되고 hotfixes를 필요로 하지 않는다)

## GitHub flow as a simpler alternative
Git flow에 대응하여 Github는 오직 feature branch와 main branch를 이용하는 Github flow를 만들었다.


![Figure3](/assets/images/221011/221011_3.png){: .align-center}{: width="50%" height="50%"}


이 flow는 매우 직관적이고, 실제로 많은 조직에서 성공적으로 적용하였다. \
Atlassian에서는 여기에서 feature branch를 rebase하는 이와 유사한 전략을 제안하기도 하였다. \
모든 내용을 main에 merge하고 자주 deploy 한다는 것의 의미는 unreleased code를 최소화 한다는 것이다. \
이러한 적용은 간단한 continuous delivery에는 적합할 수 있지만 deplotyments, enviroments, releases, integrations등에 대해서 많은 점은 question으로 남겨 놓는다

## Production branch with GitLab flow
GitHub flow는 사용자가 feature branch를 merge할때마다 제품을 deply할수 있다고 가정한다. \
SaaS application과 같은 일부 경우에는 이 것이 가능할 수 있겠지만, 아래와 같은 경우에는 불가능하다.
* release 시점을 사용자가 관리하지 않는 경우. 예를 들면, iOS app은 App Store validation 이 통과할때 release 된다.
* deployment windows를 가지고 있느 경우 (?). 예를 들면, operation 팀이 10 to 4로 일하는데, 당신은 다른 시간에 코드를 merge하는 경우

이러한 경우에, 우리는 production branch를 만들어 deployed code를 반영하게 할 수 있다. \
그러면 우리는 development를 production branch에 merge해서 새로운 버전을 deploy할 수 있게 된다. 


![Figure4](/assets/images/221011/221011_4.png){: .align-center}{: width="50%" height="50%"}


만약 우리가 어떤 코드가 production에 반영되고 있는지 알고 싶다면, 바로 production branch를 확인하면 된다. \
이 전략은 release, tagging, 그리고 merging에 소요되는 overhead를 예방할 수 있게 해준다.

## Environment branches with GitLab flow
staging branch에 자동으로 업데이트하도록 하는 환경을 구성하는 것은 좋은 아이디어 일 수 있다. \
그러한 경우에는 staging enviroment, pre-production enviroment, production enviroment와 같은 다른 branch 이름을 가지게 될 것이다. 


![Figure5](/assets/images/221011/221011_5.png){: .align-center}{: width=30 height="auto"}


이 부분에 대한 설명이 잘 이해는 되지 않았지만 우선 자동으로 업데이트하도록 staging branch를 구성해 놓고, pre-prod과 production branch에 dowstream flow로 commit을 하는 구성을 하라는 뜻으로 이해하였다.
이 경우 downstream flow(staging, pre-prod, production 순)으로 merge할 때마다 test가 완료되어 있어야 하고, merge request를 통해 feature branch에서 production branch로 merge하는 경우에는 모든 testing에 통과하기전에는 해당 feature branch를 지우지 않도록 한다.

## Release branches with GitLab flow
만약 release software를 외부로 보내야 하는 경우에만 release branch를 운영해야 한다. 이 경우 각 branch는 2.3-stable과 같은 minor한 version을 포함한다.


![Figure6](/assets/images/221011/221011_6.png){: .align-center}{: width=30 height="auto"}


가장 최신의 main branch를 starting point로 stable branches를 만든다. 이를 통해 bug fixes를 여러 branch에 적용하는 수고를 덜 수 있다. \
release branch를 선언한 후에는 오직 심각한 bug fix만 추가하도록 하고, 가능하면 main branch에 먼저 반영한 후에 cherry-pick을 통해 release branch로 가져오도록 한다. \
이를 upstream first 정책이라고 부르며, Google과 Red Hat에서 적용하고 있는 방식이다. \
release branch에서 bug를 fix하는 경우 Semantic Versioning을 적용해 tag의 patch version을 증가시키도록 한다. \
이 전략에서는 production branch나 git flow의 main branch를 보통 가지지 않는다. 

## Merge/pull requests with GitLab flow
![Figure7](/assets/images/221011/221011_7.png){: .align-center}{: width=30 height="auto"}


Merge or pull request는 Git management application에서 만들어 졌다. 이것은 assigned person이 두 branch들을 merge하는 것을 요청받게 한다. \
GitHub과 Bitbucket과 같은 Tool에서는 pull request라고 이름을 붙이고 (처음의 manual action이 feature branch를 pull하는 것이기 때문에), GitLab과 다른 일부는 merge request라는 이름을 붙인다 (최종 action이 feature branch를 merge하는 것이기 때문에. 


만약 당신이 몇시간 이상 작업을 한 내용을 팀원과 공유하고 싶다면, 아무도 assigning하지 않은 상태로 merge request를 생성하면 된다. \
대신 description이나 comment에 팀원을 참조로 넣어 merge request는 아직 준비되지 않았다는 것을 표시하고 필요시 feedback은 받을 수 있다. \
이 merge request는 별도의 code review 도구 없이도 code review가 가능하도록 할 수 있다. (팀원은 이 merge request에 general하게 또는 specific 라인에 대해서 코멘트 달 수 있고, 이 merge request를 만든사람은 바로바로 수정사항을 commit하고 push할 수 있다.) \
feature branch가 merge될 준비가 되면, 사람을 지정하고 merge request를 한다. 


GitLab에서는 main branch와 같은 long-lived branch는 보호되어야 하고 대부분의 개발자는 이것을 수정할 수 없다. \
그렇기때문에 이 보호되는 branch에 merge하기 위해서는 maintainer role을 가진 사람을 merge request에 지정해야 한다.


![Figure8](/assets/images/221011/221011_8.png){: .align-center}{: width="50%" height="50%"}


feature branch를 merge한 이후에는 이를 지워야 하고, GitLab에서는 merging을 했을때 지울 수 있다. \
이렇게 끝난 branch를 지우는 것은 보이는 branch들이 모두 작업중이라는 것을 알 수 있게 한다. \
또한 누군가 issue를 다시 open 하는 경우, 문제 없이 같은 이름의 branch를 사용할 수 있게 한다.\

## Issue tracking with GitLab flow
Gitlab flow는 code와 issue tracker의 관계를 더 transparent하게 만드는 방법이다. \
Code의 significant change는 달성하고하 하는 목표를 설명한 issue로부터 시작되어야 한다. (이것이 나머지 팀원에게 이 변경의 이유를 informgkrh feature branch의 범위를 작게 유지할 수 있다) \
동일하게 Gitlab에서는 모든 각각의 변경은 issu tracking system의 이슈로부터 시작한다. \
만약 이슈가 존재하지 않고 작업이 한시간 이상걸린다면 이슈를 만들어야 한다. \
많은 조직에서 이슈는 raising하는 것은 개발작업의 한 부분이다. 그리고 이슈 제목은 적절하게 system 상태를 설명해야한다.\
작업할 준비가 되면 main branch로부터 해당 이슈를 위한 branch를 생성한다. \
그리고 작업을 마치거나 discuss하고 싶은 경우에는 merge request를 생성하고 변경사항을 논의하고 코드를 리뷰한다. \
사람들 이정하지않은 상태로 merge request를 open하면 draft merge request라고 부른다. \
이것은 위에서 말했던 것 처럼 implementation에 대해서 논의하고 싶지만 main branch에 포함시키기에는 준비가 되지 않은 경우 사용한다. \
이 draft merge request의 제목은 Draft, Draft:, 또는 (Draft) 등으로 시작해서 준비가 완료되기전에 merge되는 것을 예방한다. 

## Linking and closing issues from merge requests
Commit messages 나 merge request의 설명에 issue를 mention하는 방법으로 issue를 연결한다. \
예를 들면 "Fixes #16" 또는 "Duck typing is preferred. See #12"등의 방법이 있다. \
연결된 issue를 자동으로 닫기 위해서는 fixes 또는 closes의 단어를 사용한다. GitLab에서는 이렇게 코드가 default branch에 merge되는 경우에 자동으로 해당 issue들을 close한다. 

## Squashing commits with rebase
Git에서는 여러 commit들을 squash하기위해서 interactive rebase (rebase -i)를 사용할 수 있다. \
이 기능은 여러 작은 commits을 하나의 commit으로 대체할 수 있도록 하고, 또는 순서를 좀더 논리적으로 만들 수 있게 한다. \
하지만 사용자는 다른 팀원과 같은 branch를 사용하는 경우, remote server에 push한 commits을 rebasing하는 것을 피해야 한다. \
rebasing은 새로운 commits을 생성하고, 이것이 동일한 변경에 대해서 여러 identifier를 가지게 함으로서 혼란을 줄 수 있기 때문이다. \
또한 누군가 당신의 코드를 review한 이후라면, rebasing은 지난번 review에서 어떤 변경사항이 있는지 설명하기 어렵게 만든다. 


## Reducing merge commits in feature branches
과하게 많은 merge commit들은 repository history를 지저분하게 만들 수 있다. \
그렇기 때문에, 우리는 feature branches의 merge commits을 피하려 노력해야 한다. \
때때로 사람들은 main branch에 commit한 후에 그 commit들을 rebase를 통해 reorder해서 merge commit을 회피한다. \
feature branch를 main에 merge할때 rebase를 사용하는 것은 merge commit을 예방하고 거의 Linear한 history를 가지도록 한다. \
하지만 이 방법은 위에서 말한 것 처럼 다른 사람과 공유하는 feature branch에서는 하지 말아야 하는 방법이다. 


Rebasing은 매번 어느정도의 conflict들을 해결해야 할 수 있기 때문에 더 많은 작업을 만든다. \
때로는 resuse recoeded resolutions (rerere)를 통해서 작업하면 conflict를 한번만 해겷하면 되기때문에 더 괜찮은 방법이다. 


많은 merge commit을 만들지 않는 방법은 feature branch에서 main branch에 merge를 자주 하지 않는 것이다. \
main branch에 merge하는 이유는 아래와 같다.
1. 새로운 코드 사용
2. merge conflict 해결
3. long running branch 업데이트

1번째 이유 관련해서 만약 어떤 기능을 만든 후 main branch에 적용하고 싶다면, 해당 commit을 cherry-picking하는 것으로 해결할 수 있다. \
그리고 3번째 이유로 long runinng feature branch를 up-to-date로 유지하고 싶은 것이라면, feature branch를 하루 이하로 유지하도록 해야한다. \
만약 feature branch가 하루 이상 유지되어야 한다면, 해당 feature를 더 작은 unit으로 작업을 나눌 수 있다. 


최종적으로는 다시 한번 말해서 우리는 merge commit을 최소화하려고 노력해야하지만 사용을 안하는 것은 아니다. \
SW를 개발하는 것은 때때로 작고, 지저분한 단계들에서 이뤄지고 history가 그것을 반영하는 것은 괜찮다. \
우리는 commits graphs를 보고 그런 지저분한 history를 이해할 수 있다. 하지만 rebase code를 통해 history가 잘못되었다면 그것을 고칠 방법은 없다. 


## Commit often and push frequently
개발을 쉽게 만드는 다른 방법 하나는 commit을 자주 하는 것이다. 매번 어느 작업 세트를 할때마다 commit을 만들어야 한다. \
개별 commit들로 나누는 것은 다른 개발자들에게 context를 제공하는 역할을 한다. \
작은 commit들은 어떻게 기능이 개발되었는지 clear하게 보여주고, 어떤 특정 시점에 돌아가는 것도 쉽게 해준다. 


그리고 feature branch도 리뷰 준비가 되지 않았다고 해더라도 자주 push해야 한다. \
이렇게 작업한 내용을 공유함으로써, 팀원이 중복되는 작업을 하는 것을 예방하고 작업한 내용에 대한 논의가 피드백이 가능하게 한다. 

## How to write a good commit message
Commit message는 작업자의 작업내용이 아니라, 작업 의도를 반영해야 한다. \
좋은 예시: "Combine templates to reduce duplicate code in the user views" \
[참고자료: Tim Pope's exellent note](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) \
더 많은 정보를 추가하기위해서는 GitLab issue, URL 등의 더 많은 정보를 포함하고 있는 내용을 추가하는 것을 고려할 수 있다. 

## Testing before merging
전통적인 workflow서의 continuous integration (CI)는 main branch에서만 test를 진행했다. \
때문에 개발자들은 자신들의 코드가 main branch를 break하지 않도록 해야 했다. \
GitLab flow를 사용할때는 개발자들은 main branch에서 자신만의 branch들을 생성하기 때문에 그 branch들이 break되지 않도록 하는 것이 필요하다. \
이것이 매 merge request는 accepted되기전에 test를 수행해야 하는 이유이다. (GitLab CI/CD는 merge request 자체에서 build results를 보여준다.) \ 
단 CI는 오직 feature branch 자체만 test할뿐 merge된 결과를 test하지 않는다. \
이상적으로 모든 변경마다 main branch를 test할 수 있지만, 이것은 computationally expensive하다.

## Working with feature branches
feature branch를 생성할때에는 반드시 최신의 main branch로부터 생성해야 한다. \
만약 작업 시작전에 해야할 작업이 다른 branch에 의존한다는 것을 안다면, 해당 branch로부터 생성할 수 있다. \
만약 작업 시작 후, 다른 branch에 merge해야할 필요가 있다면 이유를 merge commit에 설명한다. \
그리고 작업한 commit들을 shared location에 push하기 전에는 main이나 다른 feature branch에 rebasing 할 수 있다. \
merge는 필요할 때에만 해서 main history를 어지럽히지 않도록 한다.

## 추가 자료
* [전략적으로 Git 사용하기 - inflearn 모든 개발자의 실무를 위한 올인원 기본기 클래스](https://yansfil.github.io/awesome-class-materials/11.git/%EC%A0%84%EB%9E%B5%EC%A0%81%EC%9C%BC%EB%A1%9C%20git%20%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0%20-%20Gitflow.html)
* [git flow model - 생활코딩 Gitflow 강의](https://www.youtube.com/watch?v=EzcF6RX8RrQ)
* [우린 Git-flow를 사용하고 있어요 - 배달의 민족 블로그](https://techblog.woowahan.com/2553/)
* [Git flow, GitHub flow, GitLab flow - ujuc님 블로그](https://ujuc.github.io/2015/12/16/git-flow-github-flow-gitlab-flow/)
* [다양한 소프트웨어 버전 명명 (Software versioning) - kentrick님 블로그](https://blog.sonim1.com/243)
* [explanation of the tradeoffs between merging and rebasing - Atlassian blog](https://www.atlassian.com/blog/git/git-team-workflows-merge-or-rebase)
