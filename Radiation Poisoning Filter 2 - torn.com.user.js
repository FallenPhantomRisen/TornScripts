// ==UserScript==
// @name        Radiation Poisoning Filtering 5 - torn.com
// @namespace   Phantom Scripts
// @match       https://www.torn.com/hospitalview.php*
// @version     1.9
// @author      ErrorNullTag
// @description Search hospital for specific reasons.
// @license     GNU GPLv3
// ==/UserScript==

(function() {
    'use strict';

    let scriptActive = true;
    let navigationInProgress = false;
    let recordedUsers = {
        'Radiation poisoning': new Map(),
        'Exploded': new Map()
    };

    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('start');
    let currentPageCount = startParam ? Math.floor(Number(startParam) / 50) : 0;

    function clearUsersList() {
        recordedUsers = {
            'Radiation poisoning': new Map(),
            'Exploded': new Map()
        };
        populateBox();
    }

    function createAndDisplayBox() {
        let box = document.createElement("div");
        box.id = "userListBox";
        box.style.position = "fixed";
        box.style.top = "10%";
        box.style.right = "10%";
        box.style.width = "200px";
        box.style.height = "400px";
        box.style.overflowY = "scroll";
        box.style.background = "#fff";
        box.style.border = "1px solid #000";
        box.style.zIndex = 9999;
        box.style.padding = "10px";
        document.body.appendChild(box);

        let clearButton = document.createElement("button");
        clearButton.innerText = "Clear List";
        clearButton.onclick = clearUsersList;
        clearButton.style.width = "100%";
        clearButton.style.marginBottom = "10px";
        document.body.insertBefore(clearButton, box);

        populateBox();
    }

  function populateBox() {
        let box = document.getElementById("userListBox");
        box.innerHTML = '';
        for (let reason in recordedUsers) {
            let heading = document.createElement("h4");
            heading.innerText = reason;
            heading.style.marginTop = "10px";
            box.appendChild(heading);

            if (!recordedUsers[reason].size) {
                let emptyMessage = document.createElement("p");
                emptyMessage.innerText = "No users found";
                box.appendChild(emptyMessage);
            } else {
                recordedUsers[reason].forEach(userObj => {
                    let a = document.createElement("a");
                    a.innerText = userObj.name;
                    a.href = `https://www.torn.com/profiles.php?XID=${userObj.id}`;
                    a.target = "_blank";
                    a.style.display = "block";
                    a.style.margin = "5px 0";
                    box.appendChild(a);
                });
            }
        }
    }

    function logAndStore(user, reason) {
        let userNameElem = user.querySelector(".user.name");
        if (userNameElem) {
            let userName = userNameElem.textContent.trim();
            let userId = user.querySelector("a[href^='/profiles.php?XID=']").href.match(/XID=(\d+)/)[1];
            recordedUsers[reason].set(userName, { name: userName, id: userId });
            populateBox();
        }
    }


    function hideNonRadiationUsers() {
        let allUsers = document.querySelectorAll(".user-info-list-wrap li");
        for (let user of allUsers) {
            let reasonSpan = user.querySelector(".reason");
            if (reasonSpan) {
                if (reasonSpan.textContent.includes("Radiation poisoning")) {
                    logAndStore(user, "Radiation poisoning");
                } else if (reasonSpan.textContent.includes("Exploded")) {
                    logAndStore(user, "Exploded");
                } else {
                    user.style.display = 'none';
                }
            } else {
                user.style.display = 'none';
            }
        }
    }

    function navigateToNextPage() {
        console.log('Attempting navigation...');
        if (!scriptActive || navigationInProgress) {
            console.log('Navigation aborted: scriptActive:', scriptActive, ' navigationInProgress:', navigationInProgress);
            return;
        }

        navigationInProgress = true;
        const nextPageValue = currentPageCount + 1;
        if (nextPageValue <= 65) {
            console.log('Navigating to page:', nextPageValue);
            setTimeout(function() {
                window.location.href = `https://www.torn.com/hospitalview.php#start=${nextPageValue * 50}`;
                currentPageCount++;
                navigationInProgress = false;
            }, 1000);
        } else {
            console.log('Script deactivated after reaching the last desired page.');
            scriptActive = false;
        }
    }

    const targetNode = document.querySelector('.user-info-list-wrap');
    const config = { childList: true, subtree: true };
    const callback = function(mutationList, observer) {
        if (!scriptActive) return;

        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                hideNonRadiationUsers();
                navigateToNextPage();
            }
        }
    };

if (targetNode) {
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    createAndDisplayBox();

})();
