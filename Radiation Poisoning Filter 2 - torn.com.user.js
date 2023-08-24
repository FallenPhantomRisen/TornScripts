// ==UserScript==
// @name        Custom Hospital Auto-Filter 5 - torn.com
// @namespace   Phantom Scripts
// @match       https://www.torn.com/hospitalview.php*
// @version     2.0
// @author      ErrorNullTag
// @description Search hospital for specific reasons.
// ==/UserScript==

(function() {
    'use strict';

    let scriptActive = true;
    let navigationInProgress = false;
    let recordedUsers = {
        'Radiation poisoning': new Set(),
        'Exploded': new Set()
    };
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('start');
    let currentPageCount = startParam ? Math.floor(Number(startParam) / 50) : 0;

    let isDragging = false;
    let offsetX, offsetY;

    function onMouseDown(event) {
        if (event.target.closest('#userListBox') || event.target.closest('button')) {
            isDragging = true;
            offsetX = event.clientX;
            offsetY = event.clientY;
        }
    }

    function onMouseMove(event) {
        if (!isDragging) return;

        const dx = event.clientX - offsetX;
        const dy = event.clientY - offsetY;

        const box = document.getElementById("userListBox").parentElement;
        const boxStyles = getComputedStyle(box);

        const top = parseInt(boxStyles.top) + dy;
        const right = parseInt(boxStyles.right) - dx;

        box.style.top = `${top}px`;
        box.style.right = `${right}px`;

        offsetX = event.clientX;
        offsetY = event.clientY;
    }

    function onMouseUp(event) {
        isDragging = false;
    }

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function clearUsersList() {
        recordedUsers = {
            'Radiation poisoning': new Set(),
            'Exploded': new Set()
        };
        populateBox();
    }

    function createAndDisplayBox() {
        let container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "10%";
        container.style.right = "10%";
        container.style.zIndex = 9999;
        container.style.cursor = "move";
        document.body.appendChild(container);

        let boxTitle = document.createElement("h3");
        boxTitle.textContent = "Phantom Scripts";
        boxTitle.style.margin = "0";
        boxTitle.style.padding = "10px";
        boxTitle.style.background = "#333";
        boxTitle.style.color = "#fff";
        container.appendChild(boxTitle);

        let box = document.createElement("div");
        box.id = "userListBox";
        box.style.width = "200px";
        box.style.height = "400px";
        box.style.overflowY = "scroll";
        box.style.background = "#f7f7f7";
        box.style.border = "1px solid #000";
        box.style.zIndex = 9999;
        box.style.padding = "10px";
        container.appendChild(box);

        let clearButton = document.createElement("button");
        clearButton.innerText = "Clear List";
        clearButton.onclick = clearUsersList;
        clearButton.style.width = "100%";
        clearButton.style.marginTop = "10px";
        container.appendChild(clearButton);

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
                for (let userName of recordedUsers[reason]) {
                    let p = document.createElement("p");
                    p.innerText = userName;
                    p.style.margin = "5px 0";
                    box.appendChild(p);
                }
            }
        }
    }

    function logAndStore(user, reason) {
        let userNameElem = user.querySelector(".user.name");
        if (userNameElem) {
            let userName = userNameElem.textContent.trim();
            recordedUsers[reason].add(userName);
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
        if (!scriptActive || navigationInProgress) return;

        navigationInProgress = true;
        const nextPageValue = currentPageCount + 1;
        if (nextPageValue <= 65) {
            setTimeout(function() {
                window.location.href = `https://www.torn.com/hospitalview.php#start=${nextPageValue * 50}`;
                currentPageCount++;
                navigationInProgress = false;
            }, 2000);
        } else {
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
