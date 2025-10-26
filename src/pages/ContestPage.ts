import { ContestId } from '../interfaces/Contest';
import { TopLinksManager } from '../utils/TopLinksManager';

export const onContestPage = (contestId: ContestId): void => {
    const toplinksManager = new TopLinksManager();
    toplinksManager.initContestSubmissions();
    toplinksManager.confirmContestSubmissions(contestId);
};
