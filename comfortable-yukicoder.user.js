// ==UserScript==
// @name         comfortable-yukicoder
// @namespace    iilj
// @version      2021.5.3.1
// @description  タブを追加したりする
// @author       iilj
// @match        https://yukicoder.me/contests/*
// @match        https://yukicoder.me/contests/*/*
// @match        https://yukicoder.me/problems/no/*
// @match        https://yukicoder.me/problems/*
// @match        https://yukicoder.me/submissions/*
// @grant        GM_addStyle
// ==/UserScript==

/**
 * 単一のコンテストを表すクラス．
 * @typedef {Object} Contest
 * @property {string} Date コンテスト開始日時（RFC 3339）
 * @property {string} EndDate コンテスト終了日時（RFC 3339）
 * @property {number} Id 一意な値　コンテスト ID
 * @property {string} Name コンテスト名
 * @property {number[]} ProblemIdList 問題 ID のリスト
 */

/**
 * 単一の問題の統計情報を表すクラス．
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
 * 単一のコンテストを表すクラス．
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

    const TAB_CONTAINER_ID = 'cy-tabs-container';
    GM_addStyle(`
#toplinks > div#${TAB_CONTAINER_ID} > a {
    background: linear-gradient(to bottom, white 0%, rgb(255, 242, 243) 100%);
}
`);

    const API_BASE = "https://yukicoder.me/api/v1";
    const getJson = async (url) => {
        try {
            const res = await fetch(url);
            return await res.json();
        } catch (e) {
            console.log(e);
            console.log(`Error on fetch ${url}`);
            return [];
        }
    };
    /** @type {() => Promise<Contest[]>} */
    const getCurrentContests = async () => (await getJson(`${API_BASE}/contest/current`));
    /** @type {() => Promise<Contest[]>} */
    const getPastContests = async () => (await getJson(`${API_BASE}/contest/past`));
    /** @type {(contestId: number) => Promise<Contest>} */
    const getContestById = async (contestId) => (await getJson(`${API_BASE}/contest/id/${contestId}`));
    /** @type {(ProblemNo: number) => Promise<Problem>} */
    const getProblemById = async (problemId) => (await getJson(`${API_BASE}/problems/${problemId}`));
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

    let toplinkAppended = false;
    let tabContainer = undefined;
    const appendAdditionalLinksSection = () => {
        const toplinks = document.querySelector("div#toplinks");
        tabContainer = document.createElement("div");
        tabContainer.classList.add('left');
        tabContainer.id = TAB_CONTAINER_ID;
        toplinks.insertAdjacentElement('beforeend', tabContainer);
        toplinkAppended = true;
        return tabContainer;
    };

    /** リンクのタブを追加する
     * @type {(href: string, txt: string) => void} */
    const addTopLink = (href, txt) => {
        // const toplinks = document.querySelector("div#toplinks");
        // const left = toplinks.querySelector("div.left");
        const left = (toplinkAppended) ? tabContainer : appendAdditionalLinksSection();
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
     * @type {(contest: Contest, problem?: Problem) => void} */
    const printContestInfo = (contest, problem = null) => {
        const newdiv = document.createElement("div");
        { // create newdiv
            const newContestdiv = document.createElement("div");

            const contestLnk = document.createElement("a");
            contestLnk.innerText = `${contest.Name}`;
            contestLnk.href = `/contests/${contest.Id}`;
            newContestdiv.appendChild(contestLnk);

            const contestSuffix = document.createTextNode(` (id=${contest.Id})`);
            newContestdiv.appendChild(contestSuffix);

            if (problem !== null) {
                const label = getHeader(contest.ProblemIdList.findIndex(problemId => problemId === problem.ProblemId));

                const space = document.createTextNode(` `);
                newContestdiv.appendChild(space);

                const problemLnk = document.createElement("a");
                problemLnk.innerText = `#${label}`;
                problemLnk.href = `/problems/no/${problem.No}`;
                newContestdiv.appendChild(problemLnk);

                const problemSuffix = document.createTextNode(` (No.${problem.No})`);
                newContestdiv.appendChild(problemSuffix);
            }

            const newDatediv = document.createElement("div");
            newDatediv.textContent = `(${contest.Date} - ${contest.EndDate})`;

            // newdiv.innerText = `${contest.Name} (id=${contest.Id}) #${label} (No.${problem.No})`;
            newdiv.appendChild(newContestdiv);
            newdiv.appendChild(newDatediv);
        }

        // styling newdiv
        newdiv.style.display = 'inline-block';
        newdiv.style.borderRadius = '2px';
        newdiv.style.padding = '10px';
        newdiv.style.margin = '10px 0px';
        newdiv.style.border = '1px solid rgb(59, 173, 214)';
        newdiv.style.backgroundColor = 'rgba(120, 197, 231, 0.1)';

        const content = document.querySelector("div#content");
        const newdivWrapper = document.createElement("div");
        newdivWrapper.appendChild(newdiv);
        content.insertAdjacentElement('afterbegin', newdivWrapper);
    };

    /** @type {(problemNo: number) => Promise<Problem>} */
    const onProblemPage = async (problemNo) => {
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

        return problem;
    };

    /** @type {(problemId: number) => Promise<Problem>} */
    const onProblemPageById = async (problemId) => {
        const problem = await getProblemById(problemId);
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

        return problem;
    };

    /** @type {(problem: Problem) => void} */
    const onProblemSubmissionsPage = (problem) => {
        const testerIds = problem.TesterIds.split(',').map(testerIdString => Number(testerIdString));
        const rows = document.querySelectorAll('table.table tbody tr');
        rows.forEach(row => {
            /** @type {HTMLAnchorElement} */
            const userLnk = row.querySelector('td.table_username a');
            const userLnkMatchArray = userLnk.href.match(/^https:\/\/yukicoder\.me\/users\/(\d+)/);
            if (userLnkMatchArray === null) return;
            const userId = Number(userLnkMatchArray[1]);
            if (userId === problem.AuthorId) {
                row.style.backgroundColor = 'honeydew';
                const label = document.createElement('div');
                label.textContent = '[作問者]';
                userLnk.insertAdjacentElement('afterend', label);
            } else if (testerIds.includes(userId)) {
                row.style.backgroundColor = 'honeydew';
                const label = document.createElement('div');
                label.textContent = '[テスター]';
                userLnk.insertAdjacentElement('afterend', label);
            }
        });
    };

    /** @type {(contestId: number) => Promise<void>} */
    const onContestSubmissionsPage = async (contestId) => {
        const contest = await getContestById(contestId);

        // print contest info
        printContestInfo(contest);

        // add tabs
        addTopLink(`/contests/${contest.Id}/submissions?my_submission=enabled`, "自分の提出");

        /** @type {Map<number, string>} */
        const problemId2Label = contest.ProblemIdList.reduce(
            (curMap, problemId, idx) => curMap.set(problemId, getHeader(idx)), new Map());

        const problems = await getProblems();
        /** @type {Map<number, Problem>} */
        const problemNo2ProblemMap = problems.reduce((curMap, problem) => curMap.set(problem.No, problem), new Map());

        const rows = document.querySelectorAll('table.table tbody tr');
        rows.forEach(async (row) => {
            // add label to each problem link
            const lnk = row.querySelector('td a[href^="/problems/no/"]');
            const contestSubmissionsPageProblemLnkMatchArray = lnk.href.match(/^https:\/\/yukicoder\.me\/problems\/no\/(\d+)/);
            if (contestSubmissionsPageProblemLnkMatchArray === null) return;
            const problemNo = Number(contestSubmissionsPageProblemLnkMatchArray[1]);
            if (!problemNo2ProblemMap.has(problemNo)) {
                const problem = await getProblemByNo(problemNo);
                if (problem.Message !== undefined) {
                    problemNo2ProblemMap.set(problemNo, undefined);
                } else {
                    problemNo2ProblemMap.set(problemNo, problem);
                }
            }
            const problem = problemNo2ProblemMap.get(problemNo);
            if (problem === undefined) return;
            const label = problemId2Label.get(problem.ProblemId);
            lnk.insertAdjacentText("afterbegin", `#${label} `);

            // color authors and testers
            /** @type {HTMLAnchorElement} */
            const userLnk = row.querySelector('td.table_username a');
            const userLnkMatchArray = userLnk.href.match(/^https:\/\/yukicoder\.me\/users\/(\d+)/);
            if (userLnkMatchArray === null) return;
            const userId = Number(userLnkMatchArray[1]);
            const testerIds = problem.TesterIds.split(',').map(testerIdString => Number(testerIdString));
            console.log(userId);
            if (userId === problem.AuthorId) {
                row.style.backgroundColor = 'honeydew';
                const label = document.createElement('div');
                label.textContent = '[作問者]';
                userLnk.insertAdjacentElement('afterend', label);
            } else if (testerIds.includes(userId)) {
                row.style.backgroundColor = 'honeydew';
                const label = document.createElement('div');
                label.textContent = '[テスター]';
                userLnk.insertAdjacentElement('afterend', label);
            }
        });
    };

    /** @type {() => Promise<void>} */
    const onSubmissionResultPage = async () => {
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

        const resultOrder = ['AC', 'WA', 'TLE', '--', 'MLE', 'OLE', 'QLE', 'RE', 'CE', 'IE'];
        /** @type {Map<string, number>} */
        const resultCountMap = resultOrder.reduce((prevMap, label) => prevMap.set(label, 0), new Map());

        /** @type {HTMLTableElement} */
        const testTable = document.getElementById("test_table");
        const results = testTable.querySelectorAll('tbody tr td span.label');
        results.forEach(span => {
            const resultLabel = span.textContent.trim();
            const cnt = resultCountMap.get(resultLabel) ?? 0;
            resultCountMap.set(resultLabel, cnt + 1);
        });

        // print result
        const resultTable = document.createElement("div");
        const addResultRow = (cnt, label) => {
            const resultEntry = document.createElement("div");

            const labelSpan = document.createElement("span");
            labelSpan.textContent = label;
            labelSpan.classList.add('label');
            labelSpan.classList.add(
                label === 'AC' ? 'label-success' :
                    label === 'IE' ? 'label-danger' : 'label-warning');
            resultEntry.appendChild(labelSpan);

            const countSpan = document.createTextNode(` × ${cnt}`);
            resultEntry.appendChild(countSpan);

            resultTable.appendChild(resultEntry);
        };
        resultCountMap.forEach((cnt, label) => {
            if (cnt > 0) addResultRow(cnt, label);
        });
        resultTable.style.display = 'inline-block';
        resultTable.style.borderRadius = '2px';
        resultTable.style.padding = '10px';
        resultTable.style.margin = '10px 0px';
        resultTable.style.border = '1px solid rgb(59, 173, 214)';
        resultTable.style.backgroundColor = 'rgba(120, 197, 231, 0.1)';
        const wrapper = document.createElement('div');
        wrapper.appendChild(resultTable);

        const content = document.querySelector("div#testcase_table h4");
        content.insertAdjacentElement('afterend', wrapper);
    };

    /** @type {() => void} */
    const onLeaderboardPage = () => {
        const myRankTableRow = document.querySelector("table.table tbody tr.my_rank");
        if (myRankTableRow !== null) {
            const myRankTableRowCloned = myRankTableRow.cloneNode(true);
            document.querySelector("table.table tbody").insertAdjacentElement("afterbegin", myRankTableRowCloned);
            /** @type {HTMLTableRowElement} */
            const myRankTableFirstRow = document.querySelector("table.table tbody tr.my_rank");
            myRankTableFirstRow.style.borderBottom = '2px solid #ddd';
        }
    };

    /** @type {(contestId: number) => void} */
    const onContestPage = (contestId) => {
        addTopLink(`/contests/${contestId}/submissions?my_submission=enabled`, "自分の提出");
    };

    // ===== main procedure =====
    {
        const href = location.href;

        // on problem page (ProblemNo)
        // e.g. https://yukicoder.me/problems/no/1313
        const problemPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/problems\/no\/(\d+)/);
        if (problemPageMatchArray !== null) {
            // get contest info
            const problemNo = Number(problemPageMatchArray[1]);
            const problem = await onProblemPage(problemNo);

            const problemSubmissionsPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/problems\/no\/(\d+)\/submissions/);
            if (problemSubmissionsPageMatchArray !== null) {
                onProblemSubmissionsPage(problem);
            }
            return;
        }

        // on problem page (ProblemId)
        // e.g. https://yukicoder.me/problems/5191
        const problemPageByIdMatchArray = href.match(/^https:\/\/yukicoder\.me\/problems\/(\d+)/);
        if (problemPageByIdMatchArray !== null) {
            // get contest info
            const problemId = Number(problemPageByIdMatchArray[1]);
            const problem = await onProblemPageById(problemId);

            const problemSubmissionsPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/problems\/(\d+)\/submissions/);
            if (problemSubmissionsPageMatchArray !== null) {
                onProblemSubmissionsPage(problem);
            }
            return;
        }

        // on contest submissions page / statistics page
        // e.g. https://yukicoder.me/contests/300/submissions, https://yukicoder.me/contests/300/statistics
        const contestSubmissionsPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/contests\/(\d+)\/(submissions|statistics)/);
        if (contestSubmissionsPageMatchArray !== null) {
            const contestId = Number(contestSubmissionsPageMatchArray[1]);
            onContestSubmissionsPage(contestId);
            return;
        }

        // on submission result page
        // e.g. https://yukicoder.me/submissions/591424
        const submissionPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/submissions\/\d+/);
        if (submissionPageMatchArray !== null) {
            onSubmissionResultPage();
            return;
        }

        // on contest leaderboard page
        // e.g. https://yukicoder.me/contests/300/table
        const leaderboardPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/contests\/(\d+)\/(table|all)/);
        if (leaderboardPageMatchArray !== null) {
            onLeaderboardPage();
            return;
        }

        // on contest problem list page
        // e.g. https://yukicoder.me/contests/300
        const contestPageMatchArray = href.match(/^https:\/\/yukicoder\.me\/contests\/(\d+)$/);
        if (contestPageMatchArray !== null) {
            const contestId = Number(contestPageMatchArray[1]);
            onContestPage(contestId);
            return;
        }
    }
})();
