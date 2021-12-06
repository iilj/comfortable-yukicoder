import { Contest } from '../interfaces/Contest';
import { Problem, ProblemId } from '../interfaces/Problem';
import { UserId } from '../interfaces/User';

export const getContestProblems = (contest: Contest, problems: Problem[]): Problem[] => {
    const pid2problem: Map<ProblemId, Problem> = new Map<ProblemId, Problem>();
    problems.forEach((problem: Problem) => {
        pid2problem.set(problem.ProblemId, problem);
    });
    const contestProblems: Problem[] = contest.ProblemIdList.map((problemId: ProblemId) => {
        const problem: Problem | undefined = pid2problem.get(problemId);
        if (problem !== undefined) return problem;
        return {
            No: null,
            ProblemId: problemId,
            Title: '',
            AuthorId: -1,
            TesterId: -1,
            TesterIds: '',
            Level: 0,
            ProblemType: 0,
            Tags: '',
            Date: null,
            Statistics: {
                //
            },
        } as Problem;
    });
    return contestProblems;
};

export const anchorToUserID = (anchor: HTMLAnchorElement): UserId => {
    const userLnkMatchArray: RegExpMatchArray | null = /^https:\/\/yukicoder\.me\/users\/(\d+)/.exec(anchor.href);
    if (userLnkMatchArray === null) return -1;
    const userId: UserId = Number(userLnkMatchArray[1]);
    return userId;
};

export const getYourUserId = (): UserId => {
    const yourIdLnk = document.querySelector<HTMLAnchorElement>('#header #usermenu-btn');
    if (yourIdLnk === null) return -1; // ログインしていない場合
    return anchorToUserID(yourIdLnk);
};
