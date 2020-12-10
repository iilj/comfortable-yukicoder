// ==UserScript==
// @name         comfortable-yukicoder
// @namespace    iilj
// @version      2020.12.10.1
// @description  タブを追加したりする
// @author       iilj
// @match        https://yukicoder.me/contests/*
// @match        https://yukicoder.me/contests/*/*
// @match        https://yukicoder.me/problems/no/*
// @match        https://yukicoder.me/problems/*
// @match        https://yukicoder.me/submissions/*
// @grant        none
// ==/UserScript==

/**
 * 単一のコンテストを現すクラス．
 * @typedef {Object} Contest
 * @property {string} Date コンテスト開始日時（RFC 3339）
 * @property {string} EndDate コンテスト終了日時（RFC 3339）
 * @property {number} Id 一意な値　コンテスト ID
 * @property {string} Name コンテスト名
 * @property {number[]} ProblemIdList 問題 ID のリスト
 */

/**
 * 単一の問題の統計情報を現すクラス．
 * @typedef {Object} ProblemStatistics
 * @property {number} Total 提出者数
 * @property {number} Solved 正答者数
 * @property {number} FirstAcceptedTimeSecond First Accepted の提出時間
 * @property {number} FirstACSubmissionId First Accepted の提出 ID
 * @property {number} ShortCodeSubmissionId ショートコードの提出 ID
 * @property {number} PureShortCodeSubmissionId 順ショートコードの提出 ID
 * @property {number} FastSubmissionId 最速コードの提出 ID
 */

/**
 * 単一のコンテストを現すクラス．
 * @typedef {Object} Problem
 * @property {number} No 問題No
 * @property {number} ProblemId 問題Id
 * @property {string} Title 問題名
 * @property {number} AuthorId 作問者のユーザーId
 * @property {number} TesterId テスターのユーザーId
 * @property {string} TesterIds テスターのユーザーIdをカンマ区切りした文字列
 * @property {number} Level 問題レベル小数あり
 * @property {number} ProblemType 問題タイプ 0は通常問題,1は教育的問題,2はスコア形式問題 3はネタ問題,4は未証明問題
 * @property {string} Tags 問題のタグ カンマ区切り
 * @property {string} Date 最初に正答された時間（RFC 3339）
 * @property {ProblemStatistics} Statistics 問題の統計
 * @property {string} [Message] エラーメッセージ
 */

(async () => {
    'use strict';

    const API_BASE = "https://yukicoder.me/api/v1";
    const getJson = async (url) => (await (await fetch(url)).json());
    /** @type {() => Promise<Contest[]>} */
    const getCurrentContests = async () => (await getJson(`${API_BASE}/contest/current`));
    /** @type {() => Promise<Contest[]>} */
    const getPastContests = async () => (await getJson(`${API_BASE}/contest/past`));
    /** @type {(contestId: number) => Promise<Contest>} */
    const getContestById = async (contestId) => (await getJson(`${API_BASE}/contest/id/${contestId}`));
    /** @type {(ProblemNo: number) => Promise<Problem>} */
    const getProblemByNo = async (problemNo) => (await getJson(`${API_BASE}/problems/no/${problemNo}`));
    /** @type {() => Promise<Problem[]>} */
    const getProblems = async () => (await getJson(`${API_BASE}/problems`));

    const header = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U',
        'V', 'W', 'X', 'Y', 'Z'];
    /** @type {(num: number) => string} */
    const getHeaderFromNum = (num) => {
        const idx = num - 1;
        if (idx < header.length) {
            return header[idx];
        } else {
            const r = idx % header.length;
            return getHeaderFromNum(Math.floor(idx / header.length)) + header[r];
        }
    };
    /** @type {(idx: number) => string} */
    const getHeader = (idx) => getHeaderFromNum(idx + 1);

    /** リンクのタブを追加する
     * @type {(href: string, txt: string) => void} */
    const addTopLink = (href, txt) => {
        const toplinks = document.querySelector("div#toplinks");
        const left = toplinks.querySelector("div.left");
        const newtab = document.createElement("a");
        newtab.setAttribute("href", href);
        newtab.innerText = txt;
        left.insertAdjacentElement('afterbegin', newtab);
    };
    /** @type {(contestId: number) => void} */
    const addcontestLinkTabs = (contestId) => {
        addTopLink(`/contests/${contestId}/submissions?my_submission=enabled`, "自分の提出");
        addTopLink(`/contests/${contestId}/table`, "ｺﾝﾃｽﾄ順位表");
        addTopLink(`/contests/${contestId}`, "ｺﾝﾃｽﾄ問題一覧");
    };
    /** print contest info
     * @type {(contest: Contest, problem: Problem) => void} */
    const printContestInfo = (contest, problem) => {
        const label = getHeader(contest.ProblemIdList.findIndex(problemId => problemId === problem.ProblemId));

        const content = document.querySelector("div#content");
        const newdiv = document.createElement("div");

        const contestLnk = document.createElement("a");
        contestLnk.innerText = `${contest.Name}`;
        contestLnk.href = `/contests/${contest.Id}`;
        newdiv.appendChild(contestLnk);

        const contestSuffix = document.createTextNode(` (id=${contest.Id}) `);
        newdiv.appendChild(contestSuffix);

        const problemLnk = document.createElement("a");
        problemLnk.innerText = `#${label}`;
        problemLnk.href = `/problems/no/${problem.No}`;
        newdiv.appendChild(problemLnk);

        const problemSuffix = document.createTextNode(` (No.${problem.No})`);
        newdiv.appendChild(problemSuffix);

        // newdiv.innerText = `${contest.Name} (id=${contest.Id}) #${label} (No.${problem.No})`;
        content.insertAdjacentElement('afterbegin', newdiv);
    };

    // main procedure

    const href = location.href;

    // on problem page
    // e.g. https://yukicoder.me/problems/no/1313
    const problemPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/problems\/(no\/)?(\d+)/);
    if (problemPageMatchArray !== null) {
        // get contest info
        const problemNo = Number(problemPageMatchArray[2]);
        const problem = await getProblemByNo(problemNo);
        if (problem.Message !== undefined) {
            console.log(problem.Message);
            return;
        }
        const contests = (await getCurrentContests()).concat(await getPastContests());
        const contest = contests.find(contest => contest.ProblemIdList.includes(problem.ProblemId));
        if (contest === undefined) {
            console.log("contest not found");
            return;
        }

        // print contest info
        printContestInfo(contest, problem);

        // add tabs
        addcontestLinkTabs(contest.Id);

        return;
    }

    // on contest submissions page
    // e.g. https://yukicoder.me/contests/300/submissions
    const contestSubmissionsPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/contests\/(\d+)\/submissions/);
    if (contestSubmissionsPageMatchArray !== null) {
        const contestId = Number(contestSubmissionsPageMatchArray[1]);
        const contest = await getContestById(contestId);

        // print contest info
        const content = document.querySelector("div#content");
        const newdiv = document.createElement("div");

        const contestLnk = document.createElement("a");
        contestLnk.innerText = `${contest.Name}`;
        contestLnk.href = `/contests/${contest.Id}`;
        newdiv.appendChild(contestLnk);

        const contestSuffix = document.createTextNode(` (id=${contest.Id}) `);
        newdiv.appendChild(contestSuffix);
        content.insertAdjacentElement('afterbegin', newdiv);

        // add tabs
        addTopLink(`/contests/${contest.Id}/submissions?my_submission=enabled`, "自分の提出");

        /** @type {Map<number, string>} */
        const problemId2Label = contest.ProblemIdList.reduce(
            (curMap, problemId, idx) => curMap.set(problemId, getHeader(idx)), new Map());

        const problems = await getProblems();
        /** @type {Map<number, number>} */
        const problemNo2IdMap = problems.reduce((curMap, problem) => curMap.set(problem.No, problem.ProblemId), new Map());

        // add label to each problem link
        const lnks = document.querySelectorAll('div#content table td a[href^="/problems/no/"]');
        lnks.forEach(async (lnk) => {
            const contestSubmissionsPageProblemLnkMatchArray = lnk.href.match(/^https:\/\/yukicoder\.me\/problems\/no\/(\d+)/);
            if (contestSubmissionsPageProblemLnkMatchArray === null) return;
            const problemNo = Number(contestSubmissionsPageProblemLnkMatchArray[1]);
            if (!problemNo2IdMap.has(problemNo)) {
                const problem = await getProblemByNo(problemNo);
                if (problem.Message !== undefined) {
                    problemNo2IdMap.set(problemNo, undefined);
                } else {
                    problemNo2IdMap.set(problemNo, problem.ProblemId);
                }
            }
            const problemId = problemNo2IdMap.get(problemNo);
            if (problemId === undefined) return;
            const label = problemId2Label.get(problemId);
            lnk.insertAdjacentText("afterbegin", `#${label} `);
        });

        return;
    }

    // on submission result page
    // e.g. https://yukicoder.me/submissions/591424
    const submissionPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/submissions\/\d+/);
    if (submissionPageMatchArray !== null) {
        const lnk = document.querySelector('div#content a[href^="/problems/no/"]');
        const submissionPageProblemLnkMatchArray = lnk.href.match(/^https:\/\/yukicoder\.me\/problems\/no\/(\d+)/);
        if (submissionPageProblemLnkMatchArray === null) {
            console.log("problem link not found");
            return;
        }

        // get problem info
        const problemNo = Number(submissionPageProblemLnkMatchArray[1]);
        const problem = await getProblemByNo(problemNo);
        if (problem.Message !== undefined) {
            console.log(problem.Message);
            return;
        }

        // get contest info
        const contests = (await getCurrentContests()).concat(await getPastContests());
        const contest = contests.find(contest => contest.ProblemIdList.includes(problem.ProblemId));

        // add tabs
        addTopLink(lnk.href, "問題");
        if (contest !== undefined) {
            addcontestLinkTabs(contest.Id);

            // print contest info
            printContestInfo(contest, problem);
        }

        return;
    }
})();