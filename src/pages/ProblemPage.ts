import { CachedAPIClient } from '../utils/api';
import { TopLinksManager } from '../utils/TopLinksManager';
import { ContestInfoCard } from '../components/ContestInfoCard';
import { Contest } from '../interfaces/Contest';
import { Problem, ProblemId, ProblemNo } from '../interfaces/Problem';
import { Timer } from '../components/Timer';
import { anchorToUserID, getContestProblems, getYourUserId } from '../utils';
import { UserId } from '../interfaces/User';

const onProblemPage = async (
    fetchProblem: () => Promise<Problem>,
    suffix: string,
    APIClient: CachedAPIClient
): Promise<Problem | null> => {
    const toplinksManager = new TopLinksManager();
    toplinksManager.initContestLinks();
    const contestInfoCard = new ContestInfoCard();
    const timer = new Timer();

    try {
        const [problem, problems, currentContest, pastContest, futureContests] = await Promise.all([
            fetchProblem(),
            APIClient.fetchProblems(),
            APIClient.fetchCurrentContests(),
            APIClient.fetchPastContests(),
            APIClient.fetchFutureContests(),
        ]);
        const contests: Contest[] = currentContest.concat(pastContest);
        let contest: Contest | undefined = contests.find((contest) =>
            contest.ProblemIdList.includes(problem.ProblemId)
        );
        if (contest === undefined) {
            // 未来のコンテストから探してみる
            if (problem.ProblemId !== undefined) {
                const futureContest: Contest | undefined = futureContests.find((contest) =>
                    contest.ProblemIdList.includes(problem.ProblemId)
                );
                if (futureContest !== undefined) {
                    contest = futureContest;
                    // print contest info
                    // contestInfoCard.confirmContestAndProblem(futureContest, problem, suffix);
                    // return null;
                } else {
                    contestInfoCard.confirmContestIsNotFound();
                    toplinksManager.confirmWithoutContest(problem);
                    return null;
                }
            } else {
                contestInfoCard.confirmContestIsNotFound();
                toplinksManager.confirmWithoutContest(problem);
                return null;
            }
        }

        const contestProblems: Problem[] = getContestProblems(contest, problems);

        // print contest info
        contestInfoCard.confirmContestAndProblem(contest, problem, suffix);
        // add tabs
        toplinksManager.confirmContestLinks(contest.Id, contestProblems);

        timer.registerContest(contest);

        return problem;
    } catch (error) {
        contestInfoCard.onProblemFetchFailed();
        return null;
    }
};

export const onProblemPageByNo = async (
    problemNo: ProblemNo,
    suffix: string,
    APIClient: CachedAPIClient
): Promise<Problem | null> => {
    return onProblemPage(() => APIClient.fetchProblemByNo(problemNo), suffix, APIClient);
};

export const onProblemPageById = async (
    problemId: ProblemId,
    suffix: string,
    APIClient: CachedAPIClient
): Promise<Problem | null> => {
    return onProblemPage(() => APIClient.fetchProblemById(problemId), suffix, APIClient);
};

const colorScoreRow = (row: HTMLTableRowElement, authorId: UserId, testerIds: UserId[], yourId: UserId): void => {
    const userLnk: HTMLAnchorElement | null = row.querySelector<HTMLAnchorElement>('td.table_username a');
    if (userLnk === null) {
        throw new Error('テーブル行内にユーザへのリンクが見つかりませんでした');
    }
    const userId: UserId = anchorToUserID(userLnk);
    if (userId === -1) return;
    if (userId === authorId) {
        row.style.backgroundColor = 'honeydew';
        const label = document.createElement('div');
        label.textContent = '[作問者]';
        userLnk.insertAdjacentElement('afterend', label);
    } else if (testerIds.includes(userId)) {
        row.style.backgroundColor = 'honeydew';
        const label = document.createElement('div');
        label.textContent = '[テスター]';
        userLnk.insertAdjacentElement('afterend', label);
    }
    if (userId === yourId) {
        row.style.backgroundColor = 'aliceblue';
        const label = document.createElement('div');
        label.textContent = '[あなた]';
        userLnk.insertAdjacentElement('afterend', label);
    }
};

export const onProblemScorePage = (problem: Problem): void => {
    const yourId = getYourUserId();

    const testerIds: UserId[] = problem.TesterIds.split(',').map((testerIdString) => Number(testerIdString));
    const rows: NodeListOf<HTMLTableRowElement> =
        document.querySelectorAll<HTMLTableRowElement>('table.table tbody tr');
    rows.forEach((row: HTMLTableRowElement): void => {
        colorScoreRow(row, problem.AuthorId, testerIds, yourId);
    });
};
