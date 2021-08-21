import { CachedAPIClient } from '../utils/api';
import { TopLinksManager } from '../utils/TopLinksManager';
import { ContestInfoCard } from '../components/ContestInfoCard';
import { Contest } from '../interfaces/Contest';
import { Problem, ProblemId, ProblemNo } from '../interfaces/Problem';
import { Timer } from '../components/Timer';
import { getContestProblems } from '../utils';

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
