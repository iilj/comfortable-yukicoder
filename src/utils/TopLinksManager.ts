import css from './toplinksmanager.scss';
import { ContestId } from '../interfaces/Contest';
import { Problem } from '../interfaces/Problem';
import { getHeader } from './Header';

export class TopLinksManager {
    static readonly TAB_CONTAINER_ID = 'cy-tabs-container';
    static readonly ID_CONTEST = 'js-cy-contest';
    static readonly ID_CONTEST_TABLE = 'js-cy-contest-table';
    static readonly ID_CONTEST_SUBMISSION = 'js-cy-contest-submissions';
    tabContainer: HTMLDivElement;
    id2element: Map<string, HTMLAnchorElement>;

    constructor() {
        GM_addStyle(css);
        const toplinks: HTMLDivElement | null = document.querySelector<HTMLDivElement>('div#toplinks');
        if (toplinks === null) {
            throw Error('div#toplinks が見つかりません');
        }
        this.tabContainer = document.createElement('div');
        this.tabContainer.classList.add('left');
        this.tabContainer.id = TopLinksManager.TAB_CONTAINER_ID;
        toplinks.insertAdjacentElement('beforeend', this.tabContainer);
        this.id2element = new Map<string, HTMLAnchorElement>();
    }

    initLink(txt: string, id: string, href = '#'): HTMLAnchorElement {
        const newtab: HTMLAnchorElement = document.createElement('a');
        newtab.innerText = txt;
        newtab.id = id;
        newtab.setAttribute('href', href);
        this.tabContainer.appendChild(newtab);
        this.id2element.set(id, newtab);
        return newtab;
    }

    confirmLink(id: string, href: string): void {
        const tab: HTMLAnchorElement | undefined = this.id2element.get(id);
        if (tab === undefined) {
            throw new Error(`不明な id: ${id}`);
        }
        tab.href = href;
    }

    initContestSubmissions(): void {
        this.initLink('自分の提出', TopLinksManager.ID_CONTEST_SUBMISSION);
    }

    confirmContestSubmissions(contestId: ContestId): void {
        this.confirmLink(
            TopLinksManager.ID_CONTEST_SUBMISSION,
            `/contests/${contestId}/submissions?my_submission=enabled`
        );
    }

    initContestProblems(): void {
        this.initLink('ｺﾝﾃｽﾄ問題一覧', TopLinksManager.ID_CONTEST);
    }

    confirmContestProblems(contestId: ContestId, contestProblems: Problem[]): void {
        this.confirmLink(TopLinksManager.ID_CONTEST, `/contests/${contestId}`);
        this.addContestProblems(contestProblems);
    }

    initContestLinks(): void {
        this.initContestProblems();
        this.initLink('ｺﾝﾃｽﾄ順位表', TopLinksManager.ID_CONTEST_TABLE);
        this.initContestSubmissions();
    }

    confirmContestLinks(contestId: ContestId, contestProblems: Problem[]): void {
        this.confirmLink(TopLinksManager.ID_CONTEST_TABLE, `/contests/${contestId}/table`);
        this.confirmContestSubmissions(contestId);
        this.confirmContestProblems(contestId, contestProblems);
    }

    addContestProblems(contestProblems: Problem[]): void {
        const tab: HTMLAnchorElement | undefined = this.id2element.get(TopLinksManager.ID_CONTEST);
        if (tab === undefined) {
            throw new Error(`id=${TopLinksManager.ID_CONTEST} の要素が追加される前に更新が要求されました`);
        }
        const ul: HTMLUListElement = document.createElement('ul');
        ul.classList.add('js-cy-contest-problems-ul');
        console.log(contestProblems);
        contestProblems.forEach((problem: Problem, index: number) => {
            console.log(problem);
            const li: HTMLLIElement = document.createElement('li');
            const link: HTMLAnchorElement = document.createElement('a');
            const header = getHeader(index);
            link.textContent = `${header} - ${problem.Title}`;
            if (problem.No !== null) {
                link.href = `/problems/no/${problem.No}`;
            } else {
                link.href = `/problems/${problem.ProblemId}`;
            }
            li.appendChild(link);
            ul.appendChild(li);
        });
        // add caret
        const caret = document.createElement('span');
        caret.classList.add('caret');
        tab.appendChild(caret);
        tab.insertAdjacentElement('beforeend', ul);
    }

    confirmWithoutContest(problem: Problem): void {
        [TopLinksManager.ID_CONTEST, TopLinksManager.ID_CONTEST_TABLE].forEach((id: string): void => {
            const tab: HTMLAnchorElement | undefined = this.id2element.get(id);
            if (tab !== undefined) tab.remove();
        });
        // https://yukicoder.me/problems/no/5000/submissions?my_submission=enabled
        if (problem.No !== null) {
            this.confirmLink(
                TopLinksManager.ID_CONTEST_SUBMISSION,
                `/problems/no/${problem.No}/submissions?my_submission=enabled`
            );
        } else {
            this.confirmLink(
                TopLinksManager.ID_CONTEST_SUBMISSION,
                `/problems/${problem.ProblemId}/submissions?my_submission=enabled`
            );
        }
    }
}
