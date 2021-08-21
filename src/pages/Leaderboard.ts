import { CachedAPIClient } from '../utils/api';
import { Timer } from '../components/Timer';
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
        // const myRankTableFirstRow: HTMLTableRowElement | null =
        //     document.querySelector<HTMLTableRowElement>('table.table tbody tr.my_rank');
        // myRankTableFirstRow.style.borderBottom = '2px solid #ddd';
        myRankTableRowCloned.style.borderBottom = '2px solid #ddd';
    }

    const toplinksManager = new TopLinksManager();
    toplinksManager.initContestProblems();
    toplinksManager.initContestSubmissions();
    toplinksManager.confirmContestSubmissions(contestId);
    const timer = new Timer();

    const [problems, contest] = await Promise.all([APIClient.fetchProblems(), APIClient.fetchContestById(contestId)]);
    timer.registerContest(contest);
    const contestProblems: Problem[] = getContestProblems(contest, problems);
    toplinksManager.confirmContestProblems(contest.Id, contestProblems);
};
