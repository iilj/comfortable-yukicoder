import css from './timer.scss';
import { Contest } from '../interfaces/Contest';
import { formatDate, formatTime } from '../utils/TimeFormat';

const diffMsToString = (diffMs: number): string => {
    const diffWholeSecs = Math.ceil(diffMs / 1000);
    const diffSecs = diffWholeSecs % 60;
    const diffMinutes = Math.floor(diffWholeSecs / 60) % 60;
    const diffHours = Math.floor(diffWholeSecs / 3600) % 24;
    const diffDate = Math.floor(diffWholeSecs / (3600 * 24));
    const diffDateText = diffDate > 0 ? `${diffDate}日と` : '';
    return diffDateText + formatTime(diffHours, diffMinutes, diffSecs);
};

export class Timer {
    static readonly ELEMENT_ID = 'js-cy-timer';
    element: HTMLDivElement;
    top: HTMLDivElement;
    bottom: HTMLDivElement;
    intervalID: number;
    prevSeconds: number;

    startDate: Date | undefined;
    endDate: Date | undefined;

    constructor() {
        GM_addStyle(css);
        this.element = document.createElement('div');
        this.element.id = Timer.ELEMENT_ID;
        document.body.appendChild(this.element);

        this.top = document.createElement('div');
        this.element.appendChild(this.top);
        this.bottom = document.createElement('div');
        this.element.appendChild(this.bottom);

        this.prevSeconds = -1;
        this.startDate = undefined;
        this.endDate = undefined;
        this.intervalID = window.setInterval(() => {
            this.updateTime();
        }, 100);
    }

    updateTime(): void {
        const d = new Date();
        const seconds = d.getSeconds();
        if (seconds === this.prevSeconds) return;
        this.prevSeconds = seconds;

        if (this.startDate !== undefined && this.endDate !== undefined) {
            if (d < this.startDate) {
                this.top.textContent = '開始まであと';
                const diffMs = this.startDate.getTime() - d.getTime();
                this.bottom.textContent = diffMsToString(diffMs);
            } else if (d < this.endDate) {
                this.top.textContent = '残り時間';
                const diffMs = this.endDate.getTime() - d.getTime();
                this.bottom.textContent = diffMsToString(diffMs);
            } else {
                this.top.textContent = formatDate(d, '%Y-%m-%d (%a)');
                this.bottom.textContent = formatDate(d, '%H:%M:%S %z');
            }
        } else {
            this.top.textContent = formatDate(d, '%Y-%m-%d (%a)');
            this.bottom.textContent = formatDate(d, '%H:%M:%S %z');
        }
    }

    registerContest(contest: Contest): void {
        this.startDate = new Date(contest.Date);
        this.endDate = new Date(contest.EndDate);
    }
}
