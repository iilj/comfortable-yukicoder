import { CachedAPIClient } from '../utils/api';
import { getHeader } from '../utils/Header';
import { TopLinksManager } from '../utils/TopLinksManager';
import { ContestInfoCard } from '../components/ContestInfoCard';
import { ContestId } from '../interfaces/Contest';
import { Problem, ProblemId, ProblemNo } from '../interfaces/Problem';
import { UserId } from '../interfaces/User';
import { getContestProblems } from '../utils';

const anchorToUserID = (anchor: HTMLAnchorElement): UserId => {
    const userLnkMatchArray: RegExpMatchArray | null = /^https:\/\/yukicoder\.me\/users\/(\d+)/.exec(anchor.href);
    if (userLnkMatchArray === null) return -1;
    const userId: UserId = Number(userLnkMatchArray[1]);
    return userId;
};

const colorSubmissionRow = (row: HTMLTableRowElement, authorId: UserId, testerIds: UserId[], yourId: UserId): void => {
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

const getYourUserId = (): UserId => {
    const yourIdLnk = document.querySelector<HTMLAnchorElement>('#header #usermenu-btn');
    if (yourIdLnk === null) return -1; // ログインしていない場合
    return anchorToUserID(yourIdLnk);
};

export const onProblemSubmissionsPage = (problem: Problem): void => {
    const yourId = getYourUserId();

    const testerIds = problem.TesterIds.split(',').map((testerIdString) => Number(testerIdString));
    const rows: NodeListOf<HTMLTableRowElement> =
        document.querySelectorAll<HTMLTableRowElement>('table.table tbody tr');
    rows.forEach((row: HTMLTableRowElement): void => {
        colorSubmissionRow(row, problem.AuthorId, testerIds, yourId);
    });
};

export const onContestSubmissionsPage = async (contestId: ContestId, APIClient: CachedAPIClient): Promise<void> => {
    const toplinksManager = new TopLinksManager();
    toplinksManager.initContestProblems();
    toplinksManager.initContestSubmissions();
    const contestInfoCard = new ContestInfoCard(false);

    const yourId = getYourUserId();
    const [contest, problems] = await Promise.all([APIClient.fetchContestById(contestId), APIClient.fetchProblems()]);

    // print contest info
    contestInfoCard.confirmContest(contest);

    // add tabs
    const contestProblems: Problem[] = getContestProblems(contest, problems);
    toplinksManager.confirmContestProblems(contest.Id, contestProblems);
    toplinksManager.confirmContestSubmissions(contest.Id);

    const problemId2Label: Map<ProblemId, string> = contest.ProblemIdList.reduce(
        (curMap: Map<ProblemId, string>, problemId: ProblemId, idx: number) => curMap.set(problemId, getHeader(idx)),
        new Map<ProblemId, string>()
    );

    const problemNo2ProblemMap: Map<ProblemNo, Problem | null> = problems.reduce(
        (curMap: Map<ProblemNo, Problem>, problem: Problem) => {
            if (problem.No !== null) curMap.set(problem.No, problem);
            return curMap;
        },
        new Map<ProblemNo, Problem>()
    );

    // collect problemNos
    const rows: NodeListOf<HTMLTableRowElement> =
        document.querySelectorAll<HTMLTableRowElement>('table.table tbody tr');
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // add label to each problem link
        const lnk: HTMLAnchorElement | null = row.querySelector<HTMLAnchorElement>('td a[href^="/problems/no/"]');
        if (lnk === null) {
            throw new Error('テーブル行内に問題へのリンクが見つかりませんでした');
        }
        const contestSubmissionsPageProblemLnkMatchArray: RegExpMatchArray | null =
            /^https:\/\/yukicoder\.me\/problems\/no\/(\d+)/.exec(lnk.href);
        if (contestSubmissionsPageProblemLnkMatchArray === null) {
            throw new Error('テーブル行内に含まれる問題リンク先が不正です');
        }
        const problemNo = Number(contestSubmissionsPageProblemLnkMatchArray[1]);
        if (!problemNo2ProblemMap.has(problemNo)) {
            try {
                const problem: Problem = await APIClient.fetchProblemByNo(problemNo);
                problemNo2ProblemMap.set(problemNo, problem);
            } catch (error) {
                problemNo2ProblemMap.set(problemNo, null);
            }
        }
        const problem: Problem | null | undefined = problemNo2ProblemMap.get(problemNo);
        if (problem === null || problem === undefined) return;
        const label: string | undefined = problemId2Label.get(problem.ProblemId);
        if (label !== undefined) lnk.insertAdjacentText('afterbegin', `#${label} `);

        // color authors and testers
        const testerIds = problem.TesterIds.split(',').map((testerIdString) => Number(testerIdString));
        colorSubmissionRow(row, problem.AuthorId, testerIds, yourId);
    }
};
