import { CachedAPIClient } from '../utils/api';
import { TopLinksManager } from '../utils/TopLinksManager';
import { ContestInfoCard } from '../components/ContestInfoCard';
import { createCard } from '../components/Card';
import { Contest } from '../interfaces/Contest';
import { Problem, ProblemNo } from '../interfaces/Problem';
import { getContestProblems } from '../utils';

const SUBMISSION_STATUSES = ['AC', 'WA', 'TLE', '--', 'MLE', 'OLE', 'QLE', 'RE', 'CE', 'IE', 'NoOut'] as const;
type SubmissionStatus = typeof SUBMISSION_STATUSES[number];

const stringToStatus = (resultText: string): SubmissionStatus => {
    for (let i = 0; i < SUBMISSION_STATUSES.length; ++i) {
        if (SUBMISSION_STATUSES[i] == resultText) return SUBMISSION_STATUSES[i];
    }
    throw new Error(`未知のジャッジステータスです: ${resultText}`);
};

export const onSubmissionResultPage = async (APIClient: CachedAPIClient): Promise<void> => {
    const toplinksManager = new TopLinksManager();
    const contestInfoCard = new ContestInfoCard();
    const [resultCard, resultCardWrapper] = createCard();

    {
        // count
        const resultCountMap: Map<SubmissionStatus, number> = SUBMISSION_STATUSES.reduce(
            (prevMap: Map<SubmissionStatus, number>, label: SubmissionStatus) => prevMap.set(label, 0),
            new Map<SubmissionStatus, number>()
        );

        // ジャッジ中（提出直後）は，このテーブルは存在しない
        const testTable: HTMLElement | null = document.getElementById('test_table');
        if (testTable !== null) {
            const results: NodeListOf<HTMLSpanElement> =
                testTable.querySelectorAll<HTMLSpanElement>('tbody tr td span.label');
            results.forEach((span: HTMLSpanElement): void => {
                const resultText: string | null = span.textContent;
                if (resultText === null) {
                    throw new Error('ジャッジ結果テキストが空です');
                }
                const resultLabel: SubmissionStatus = stringToStatus(resultText.trim());
                const cnt: number = resultCountMap.get(resultLabel) ?? 0;
                resultCountMap.set(resultLabel, cnt + 1);
            });
        }

        const content: HTMLHeadingElement | null = document.querySelector<HTMLHeadingElement>('div#testcase_table h4');
        // 提出直後，ジャッジ中は null
        if (content !== null) {
            content.insertAdjacentElement('afterend', resultCardWrapper);

            // print result
            const addResultRow = (cnt: number, label: string): void => {
                const resultEntry = document.createElement('div');

                const labelSpan = document.createElement('span');
                labelSpan.textContent = label;
                labelSpan.classList.add('label');
                labelSpan.classList.add(
                    label === 'AC' ? 'label-success' : label === 'IE' ? 'label-danger' : 'label-warning'
                );
                resultEntry.appendChild(labelSpan);

                const countSpan = document.createTextNode(` × ${cnt}`);
                resultEntry.appendChild(countSpan);

                resultCard.appendChild(resultEntry);
            };
            resultCountMap.forEach((cnt: number, label: string) => {
                if (cnt > 0) addResultRow(cnt, label);
            });
        }
    }

    const lnk: HTMLAnchorElement | null = document.querySelector<HTMLAnchorElement>(
        'div#content a[href^="/problems/no/"]'
    );
    if (lnk === null) {
        throw new Error('結果ページ中に問題ページへのリンクが見つかりませんでした');
    }
    toplinksManager.initLink('問題', 'js-cy-problem', lnk.href);
    toplinksManager.initContestLinks();

    const submissionPageProblemLnkMatchArray: RegExpMatchArray | null =
        /^https:\/\/yukicoder\.me\/problems\/no\/(\d+)/.exec(lnk.href);
    if (submissionPageProblemLnkMatchArray === null) {
        throw new Error('結果ページに含まれる問題ページへのリンク先が不正です');
    }

    // get problems/contests info
    const problemNo: ProblemNo = Number(submissionPageProblemLnkMatchArray[1]);
    const [problem, problems, currentContest, pastContest] = await Promise.all([
        APIClient.fetchProblemByNo(problemNo),
        APIClient.fetchProblems(),
        APIClient.fetchCurrentContests(),
        APIClient.fetchPastContests(),
    ]);
    const contests: Contest[] = currentContest.concat(pastContest);
    const contest: Contest | undefined = contests.find((contest) => contest.ProblemIdList.includes(problem.ProblemId));

    // add tabs
    if (contest !== undefined) {
        const contestProblems: Problem[] = getContestProblems(contest, problems);

        toplinksManager.confirmContestLinks(contest.Id, contestProblems);

        // print contest info
        contestInfoCard.confirmContestAndProblem(contest, problem);
    }
};
