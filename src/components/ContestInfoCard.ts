import { Contest } from '../interfaces/Contest';
import { Problem } from '../interfaces/Problem';
import { createCard } from './Card';
import { getHeader } from '../utils/Header';
import { formatDate } from '../utils/TimeFormat';

export class ContestInfoCard {
    card: HTMLDivElement;

    contestDiv: HTMLDivElement;
    dateDiv: HTMLDivElement;
    prevNextProblemLinks: HTMLDivElement | undefined;

    contestLnk: HTMLAnchorElement;
    contestSuffix: Text;
    problemLnk: HTMLAnchorElement | undefined;
    problemSuffix: Text | undefined;
    isProblemPage: boolean;

    constructor(isProblemPage = true) {
        this.isProblemPage = isProblemPage;
        const [card, cardWrapper] = createCard();
        this.card = card;
        {
            // create newdiv
            this.contestDiv = document.createElement('div');

            // add contest info
            this.contestLnk = document.createElement('a');
            this.contestLnk.innerText = '(fetching contest info...)';
            this.contestLnk.href = '#';
            this.contestDiv.appendChild(this.contestLnk);

            this.contestSuffix = document.createTextNode(` (id=---)`);
            this.contestDiv.appendChild(this.contestSuffix);

            // add problem info
            if (isProblemPage) {
                const space = document.createTextNode(` `);
                this.contestDiv.appendChild(space);

                this.problemLnk = document.createElement('a');
                this.problemLnk.innerText = '#?';
                this.problemLnk.href = '#';
                this.contestDiv.appendChild(this.problemLnk);

                this.problemSuffix = document.createTextNode(' (No.---)');
                this.contestDiv.appendChild(this.problemSuffix);
            }

            this.dateDiv = document.createElement('div');
            this.dateDiv.textContent = 'xxxx-xx-xx xx:xx:xx 〜 xxxx-xx-xx xx:xx:xx';

            // newdiv.innerText = `${contest.Name} (id=${contest.Id}) #${label} (No.${problem.No})`;
            card.appendChild(this.contestDiv);
            card.appendChild(this.dateDiv);

            if (isProblemPage) {
                this.prevNextProblemLinks = document.createElement('div');
                this.prevNextProblemLinks.textContent = '(情報取得中)';
                card.appendChild(this.prevNextProblemLinks);
            }
        }

        const content: HTMLDivElement | null = document.querySelector<HTMLDivElement>('div#content');
        if (content === null) {
            throw new Error('div#content が見つかりませんでした');
        }
        content.insertAdjacentElement('afterbegin', cardWrapper);
    }

    confirmContest(contest: Contest): void {
        this.contestLnk.innerText = `${contest.Name}`;
        this.contestLnk.href = `/contests/${contest.Id}`;
        this.contestSuffix.textContent = ` (id=${contest.Id})`;

        const format = '%Y-%m-%d (%a) %H:%M:%S';
        const start = formatDate(new Date(contest.Date), format);
        const end = formatDate(new Date(contest.EndDate), format);
        this.dateDiv.textContent = `${start} 〜 ${end}`;
    }

    confirmContestAndProblem(contest: Contest, problem: Problem, suffix = ''): void {
        this.confirmContest(contest);

        if (this.isProblemPage) {
            if (this.prevNextProblemLinks === undefined) {
                throw new ErrorEvent('prevNextProblemLinks が undefined です');
            }
            if (this.problemLnk === undefined) {
                throw new ErrorEvent('problemLnk が undefined です');
            }
            if (this.problemSuffix === undefined) {
                throw new ErrorEvent('problemSuffix が undefined です');
            }
            const idx: number = contest.ProblemIdList.findIndex((problemId) => problemId === problem.ProblemId);
            const label = getHeader(idx);
            this.problemLnk.innerText = `#${label}`;
            if (problem.No !== null) {
                this.problemLnk.href = `/problems/no/${problem.No}`;
                this.problemSuffix.textContent = ` (No.${problem.No})`;
            } else {
                this.problemLnk.href = `/problems/${problem.ProblemId}`;
            }

            this.prevNextProblemLinks.textContent = ' / ';
            if (idx > 0) {
                // prev
                const lnk = document.createElement('a');
                lnk.innerText = `←前の問題 (#${getHeader(idx - 1)})`;
                lnk.href = `/problems/${contest.ProblemIdList[idx - 1]}${suffix}`;
                this.prevNextProblemLinks.insertAdjacentElement('afterbegin', lnk);
            }
            if (idx + 1 < contest.ProblemIdList.length) {
                // next
                const lnk = document.createElement('a');
                lnk.innerText = `次の問題 (#${getHeader(idx + 1)})→`;
                lnk.href = `/problems/${contest.ProblemIdList[idx + 1]}${suffix}`;
                this.prevNextProblemLinks.insertAdjacentElement('beforeend', lnk);
            }
        }
    }

    confirmContestIsNotFound(): void {
        this.contestLnk.remove();
        this.contestSuffix.remove();
        this.problemLnk?.remove();
        this.problemSuffix?.remove();
        this.dateDiv.remove();
        if (this.prevNextProblemLinks !== undefined) {
            this.prevNextProblemLinks.textContent = '(どのコンテストにも属さない問題です)';
        }
    }

    onProblemFetchFailed(): void {
        this.contestLnk.innerText = '???';
        if (this.prevNextProblemLinks !== undefined) {
            this.prevNextProblemLinks.textContent = '(情報が取得できませんでした)';
        }
    }
}
