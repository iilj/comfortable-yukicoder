// ==UserScript==
// @name         yukicoder contest informer
// @namespace    http://tampermonkey.net/
// @version      2020.2.15.1
// @description  タブを追加したりする
// @author       You
// @match        https://yukicoder.me/contests/*
// @exclude      https://yukicoder.me/contests/*/*
// @match        https://yukicoder.me/problems/no/*
// @match        https://yukicoder.me/problems/*
// @match        https://yukicoder.me/submissions/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    const localStorageKey = "myContestInfo";
    const href = location.href;

    // on contest page
    const m = href.match(/^https:\/\/yukicoder\.me\/contests\/(\d+)\/?$/);
    if (m) {
        // コンテスト情報の収集
        const contestid = Number(m[1]);
        const titleh4 = document.querySelector("h4");
        if (!titleh4) {
            return;
        }
        const contestname = titleh4.innerText.slice(0, -5);
        const content = document.querySelector("div#content");
        if (!content) {
            return;
        }
        let info = localStorage.getItem(localStorageKey);
        if (!info) {
            info = { contests: {}, problems: {} };
        } else {
            info = JSON.parse(info);
        }
        info.contests[contestid] = contestname;
        content.querySelectorAll("table.table tbody tr").forEach((tr) => {
            const lnk = tr.querySelector("a[href^='/problems/no/']");
            const mr = lnk.getAttribute("href").match(/^\/problems\/no\/(\d+)$/);
            if (!mr) {
                return;
            }
            const pno = Number(mr[1]);
            const sharp = tr.querySelector("td").innerText;
            // console.log(contestname, contestid, pno, sharp);
            info.problems[pno] = [contestid, sharp];
        });
        console.log(info);
        const json = JSON.stringify(info);
        console.log(json);
        localStorage.setItem(localStorageKey, json);
        return;
    }

    // リンクのタブを追加する
    const addTopLink = (href, txt) => {
        const toplinks = document.querySelector("div#toplinks");
        const left = toplinks.querySelector("div.left");
        const newtab = document.createElement("a");
        newtab.setAttribute("href", href);
        newtab.innerText = txt;
        left.insertAdjacentElement('afterbegin', newtab);
    };

    // on problem page
    const m2 = href.match(/^https:\/\/yukicoder\.me\/problems\/(no\/)?(\d+)/);
    if (m2) {
        // get contest info
        const pno = Number(m2[2]);
        let info = localStorage.getItem(localStorageKey);
        if (!info) {
            return;
        }
        info = JSON.parse(info);
        const probleminfo = info.problems[pno];
        if (!probleminfo) {
            return;
        }
        const contestid = probleminfo[0];
        const sharp = probleminfo[1];
        const contestname = info.contests[contestid];
        console.log(contestname, sharp, contestid);

        // print contest info
        const content = document.querySelector("div#content");
        const newdiv = document.createElement("div");
        newdiv.innerText = `${contestname} (id=${contestid}) #${sharp} (No.${pno})`;
        content.insertAdjacentElement('afterbegin', newdiv);

        // add tabs
        addTopLink(`/contests/${contestid}/submissions?my_submission=enabled`, "自分の提出");
        addTopLink(`/contests/${contestid}/table`, "ｺﾝﾃｽﾄ順位表");
        addTopLink(`/contests/${contestid}`, "ｺﾝﾃｽﾄ問題一覧");
    }

    // on submission result page
    const m3 = href.match(/^https:\/\/yukicoder\.me\/submissions\/\d+/);
    if (m3) {
        const lnk = document.querySelector('div#content a[href^="/problems/no/"]');
        const m4 = lnk.href.match(/^https:\/\/yukicoder\.me\/problems\/no\/(\d+)/);
        if (!m4) {
            return;
        }

        // get contest info
        const pno = Number(m4[1]);
        let info = localStorage.getItem(localStorageKey);
        if (!info) {
            return;
        }
        info = JSON.parse(info);
        const probleminfo = info.problems[pno];
        if (!probleminfo) {
            return;
        }
        const contestid = probleminfo[0];
        const sharp = probleminfo[1];
        const contestname = info.contests[contestid];
        console.log(contestname, sharp, contestid);

        // add tabs
        addTopLink(lnk.href, "問題");
        addTopLink(`/contests/${contestid}/submissions?my_submission=enabled`, "自分の提出");
        addTopLink(`/contests/${contestid}/table`, "ｺﾝﾃｽﾄ順位表");
        addTopLink(`/contests/${contestid}`, "ｺﾝﾃｽﾄ問題一覧");
    }
})();