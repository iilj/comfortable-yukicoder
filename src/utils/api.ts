import { Contest, ContestId } from '../interfaces/Contest';
import { Problem, ProblemId, ProblemNo } from '../interfaces/Problem';

const BASE_URL = 'https://yukicoder.me' as const;
const STATIC_API_BASE_URL = `${BASE_URL}/api/v1` as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const assertResultIsValid = (obj: any): void => {
    if ('Message' in obj) throw new Error((obj as { Message: string }).Message);
};
const fetchJson = async <T>(url: string): Promise<T> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(res.statusText);
    }
    const obj = (await res.json()) as T | { Message: string };
    assertResultIsValid(obj);
    return obj as T;
};

// TODO pid/no->contest, の変換も受け持つほうが良い？（html 解析絡みをこのクラスに隠蔽できる）
// 「現在のコンテスト」
export class CachedAPIClient {
    pastContests: Contest[] | undefined;
    pastContestsMap: Map<ContestId, Contest>;
    currentContests: Contest[] | undefined;
    currentContestsMap: Map<ContestId, Contest>;
    futureContests: Contest[] | undefined;
    futureContestsMap: Map<ContestId, Contest>;
    problems: Problem[] | undefined;
    problemsMapById: Map<ProblemId, Problem>;
    problemsMapByNo: Map<ProblemNo, Problem>;

    constructor() {
        this.pastContestsMap = new Map<ContestId, Contest>();
        this.currentContestsMap = new Map<ContestId, Contest>();
        this.futureContestsMap = new Map<ContestId, Contest>();
        this.problemsMapById = new Map<ProblemId, Problem>();
        this.problemsMapByNo = new Map<ProblemNo, Problem>();
    }

    async fetchPastContests(): Promise<Contest[]> {
        if (this.pastContests === undefined) {
            this.pastContests = await fetchJson<Contest[]>(`${STATIC_API_BASE_URL}/contest/past`);
            this.pastContests.forEach((contest: Contest): void => {
                if (!this.pastContestsMap.has(contest.Id)) this.pastContestsMap.set(contest.Id, contest);
            });
        }
        return this.pastContests;
    }

    async fetchCurrentContests(): Promise<Contest[]> {
        if (this.currentContests === undefined) {
            this.currentContests = await fetchJson<Contest[]>(`${STATIC_API_BASE_URL}/contest/current`);
            this.currentContests.forEach((contest: Contest): void => {
                if (!this.currentContestsMap.has(contest.Id)) this.currentContestsMap.set(contest.Id, contest);
            });
        }
        return this.currentContests;
    }

    async fetchFutureContests(): Promise<Contest[]> {
        if (this.futureContests === undefined) {
            this.futureContests = await fetchJson<Contest[]>(`${STATIC_API_BASE_URL}/contest/future`);
            this.futureContests.forEach((contest: Contest): void => {
                if (!this.futureContestsMap.has(contest.Id)) this.futureContestsMap.set(contest.Id, contest);
            });
        }
        return this.futureContests;
    }

    async fetchContestById(contestId: ContestId): Promise<Contest> {
        if (this.pastContestsMap.has(contestId)) {
            return this.pastContestsMap.get(contestId) as Contest;
        }
        if (this.currentContestsMap.has(contestId)) {
            return this.currentContestsMap.get(contestId) as Contest;
        }
        if (this.futureContestsMap.has(contestId)) {
            return this.futureContestsMap.get(contestId) as Contest;
        }
        const contest: Contest = await fetchJson<Contest>(`${STATIC_API_BASE_URL}/contest/id/${contestId}`);
        const currentDate = new Date();
        const startDate = new Date(contest.Date);
        const endDate = new Date(contest.EndDate);
        if (currentDate > endDate) {
            this.pastContestsMap.set(contestId, contest);
        } else if (currentDate > startDate) {
            this.currentContestsMap.set(contestId, contest);
        }
        return contest;
    }

    async fetchProblems(): Promise<Problem[]> {
        if (this.problems === undefined) {
            this.problems = await fetchJson<Problem[]>(`${STATIC_API_BASE_URL}/problems`);
            this.problems.forEach((problem: Problem): void => {
                if (!this.problemsMapById.has(problem.ProblemId)) this.problemsMapById.set(problem.ProblemId, problem);
                if (problem.No !== null && !this.problemsMapByNo.has(problem.No))
                    this.problemsMapByNo.set(problem.No, problem);
            });
        }
        return this.problems;
    }

    async fetchProblemById(problemId: ProblemId): Promise<Problem> {
        if (this.problemsMapById.has(problemId)) {
            return this.problemsMapById.get(problemId) as Problem;
        }
        try {
            const problem = await fetchJson<Problem>(`${STATIC_API_BASE_URL}/problems/${problemId}`);
            this.problemsMapById.set(problem.ProblemId, problem);
            if (problem.No !== null) this.problemsMapByNo.set(problem.No, problem);
            return problem;
        } catch {
            await this.fetchProblems();
            if (this.problemsMapById.has(problemId)) {
                return this.problemsMapById.get(problemId) as Problem;
            }
            // 問題一覧には載っていない -> 未来のコンテストの問題
            // ProblemId なので，未来のコンテスト一覧に載っている pid リストから，
            // コンテストは特定可能．
            return { ProblemId: problemId, No: null } as Problem;
        }
    }

    async fetchProblemByNo(problemNo: ProblemNo): Promise<Problem> {
        if (this.problemsMapByNo.has(problemNo)) {
            return this.problemsMapByNo.get(problemNo) as Problem;
        }
        try {
            const problem = await fetchJson<Problem>(`${STATIC_API_BASE_URL}/problems/no/${problemNo}`);
            this.problemsMapById.set(problem.ProblemId, problem);
            if (problem.No !== null) this.problemsMapByNo.set(problem.No, problem);
            return problem;
        } catch {
            await this.fetchProblems();
            if (this.problemsMapByNo.has(problemNo)) {
                return this.problemsMapByNo.get(problemNo) as Problem;
            }
            // 問題一覧には載っていない -> 未来のコンテストの問題
            return { No: problemNo } as Problem;
        }
    }
}
