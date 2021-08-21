import { ContestId } from './interfaces/Contest';
import { Problem } from './interfaces/Problem';
import { onContestPage } from './pages/ContestPage';
import { onLeaderboardPage } from './pages/Leaderboard';
import { onProblemPageByNo, onProblemPageById } from './pages/ProblemPage';
import { onProblemSubmissionsPage, onContestSubmissionsPage } from './pages/SubmissionList';
import { onSubmissionResultPage } from './pages/SubmissionResult';
import { CachedAPIClient } from './utils/api';

void (async () => {
    const href: string = location.href;
    const hrefMatchArray = /^https:\/\/yukicoder\.me(.+)/.exec(href);
    if (hrefMatchArray === null) return;
    const path: string = hrefMatchArray[1];
    const APIClient: CachedAPIClient = new CachedAPIClient();

    // on problem page (ProblemNo)
    // e.g. https://yukicoder.me/problems/no/1313
    const problemPageMatchArray = /^\/problems\/no\/(\d+)(.*)/.exec(path);
    if (problemPageMatchArray !== null) {
        // get contest info
        const problemNo = Number(problemPageMatchArray[1]);
        const suffix: string = problemPageMatchArray[2];
        const problem: Problem | null = await onProblemPageByNo(problemNo, suffix, APIClient);
        if (problem === null) return;

        const problemSubmissionsPageMatchArray = /^\/problems\/no\/(\d+)\/submissions/.exec(path);
        if (problemSubmissionsPageMatchArray !== null) {
            onProblemSubmissionsPage(problem);
        }
        return;
    }

    // on problem page (ProblemId)
    // e.g. https://yukicoder.me/problems/5191
    const problemPageByIdMatchArray = /^\/problems\/(\d+)(.*)/.exec(path);
    if (problemPageByIdMatchArray !== null) {
        // get contest info
        const problemId = Number(problemPageByIdMatchArray[1]);
        const suffix: string = problemPageByIdMatchArray[2];
        const problem: Problem | null = await onProblemPageById(problemId, suffix, APIClient);
        if (problem === null) return;

        const problemSubmissionsPageMatchArray = /^\/problems\/(\d+)\/submissions/.exec(path);
        if (problemSubmissionsPageMatchArray !== null) {
            onProblemSubmissionsPage(problem);
        }
        return;
    }

    // on contest submissions page / statistics page
    // e.g. https://yukicoder.me/contests/300/submissions, https://yukicoder.me/contests/300/statistics
    const contestSubmissionsPageMatchArray = /^\/contests\/(\d+)\/(submissions|statistics)/.exec(path);
    if (contestSubmissionsPageMatchArray !== null) {
        const contestId = Number(contestSubmissionsPageMatchArray[1]);
        await onContestSubmissionsPage(contestId, APIClient);
        return;
    }

    // on submission result page
    // e.g. https://yukicoder.me/submissions/591424
    const submissionPageMatchArray = /^\/submissions\/\d+/.exec(path);
    if (submissionPageMatchArray !== null) {
        await onSubmissionResultPage(APIClient);
        return;
    }

    // on contest leaderboard page
    // e.g. https://yukicoder.me/contests/300/table
    const leaderboardPageMatchArray = /^\/contests\/(\d+)\/(table|all)/.exec(path);
    if (leaderboardPageMatchArray !== null) {
        const contestId: ContestId = Number(leaderboardPageMatchArray[1]);
        await onLeaderboardPage(contestId, APIClient);
        return;
    }

    // on contest problem list page
    // e.g. https://yukicoder.me/contests/300
    const contestPageMatchArray = /^\/contests\/(\d+)$/.exec(path);
    if (contestPageMatchArray !== null) {
        const contestId = Number(contestPageMatchArray[1]);
        await onContestPage(contestId, APIClient);
        return;
    }
})();
