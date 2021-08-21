import { CachedAPIClient } from '../utils/api';
import { Timer } from '../components/Timer';
import { Contest, ContestId } from '../interfaces/Contest';
import { TopLinksManager } from '../utils/TopLinksManager';

export const onContestPage = async (contestId: ContestId, APIClient: CachedAPIClient): Promise<void> => {
    const toplinksManager = new TopLinksManager();
    toplinksManager.initContestSubmissions();
    toplinksManager.confirmContestSubmissions(contestId);
    const timer = new Timer();

    const contest: Contest = await APIClient.fetchContestById(contestId);
    timer.registerContest(contest);
};
