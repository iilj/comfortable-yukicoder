import { Contest } from '../interfaces/Contest';
import { Problem, ProblemId } from '../interfaces/Problem';

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
