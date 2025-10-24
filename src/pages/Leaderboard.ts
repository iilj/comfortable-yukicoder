import { CachedAPIClient } from '../utils/api';
import { ContestId } from '../interfaces/Contest';
import { TopLinksManager } from '../utils/TopLinksManager';
import { Problem } from '../interfaces/Problem';
import { getContestProblems } from '../utils';

export const onLeaderboardPage = async (contestId: ContestId, APIClient: CachedAPIClient): Promise<void> => {
    const myRankTableRow: HTMLTableRowElement | null =
        document.querySelector<HTMLTableRowElement>('table.table tbody tr.my_rank');
    if (myRankTableRow !== null) {
        const myRankTableRowCloned = myRankTableRow.cloneNode(true) as HTMLTableRowElement;
        const tbody: HTMLTableSectionElement | null =
            document.querySelector<HTMLTableSectionElement>('table.table tbody');
        if (tbody === null) {
            throw new Error('順位表テーブルが見つかりません');
        }
        tbody.insertAdjacentElement('afterbegin', myRankTableRowCloned);
        myRankTableRowCloned.style.borderBottom = '2px solid #ddd';
    }

    const toplinksManager = new TopLinksManager();
    toplinksManager.initContestProblems();
    toplinksManager.initContestSubmissions();
    toplinksManager.confirmContestSubmissions(contestId);

    const [problems, contest] = await Promise.all([APIClient.fetchProblems(), APIClient.fetchContestById(contestId)]);
    const contestProblems: Problem[] = getContestProblems(contest, problems);
    toplinksManager.confirmContestProblems(contest.Id, contestProblems);
};
