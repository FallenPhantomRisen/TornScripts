// ==UserScript==
// @name        Search Hospital For Reason - torn.com
// @namespace   Phantom Scripts
// @match       https://www.torn.com/hospitalview.php*
// @version     4.0
// @author      ErrorNullTag
// @description Search hospital for specific reasons.
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let scriptActive = true;
    let navigationInProgress = false;
    let recordedUsers = [];

    const targetNode = document.querySelector('.user-info-list-wrap');
    const config = { childList: true, subtree: true };

    const callback = function(mutationList, observer) {
        if (!scriptActive) return;

        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                hideNonTargetedUsers();
                navigateToNextPage();
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    function hideNonTargetedUsers() {
        let allUsers = document.querySelectorAll(".user-info-list-wrap li");
        for (let user of allUsers) {
            let reasonSpan = user.querySelector(".reason");
            if (reasonSpan) {
                let reasonText = reasonSpan.textContent;
                let userID = user.querySelector(".user.name").getAttribute("data-player");
                let userName = user.querySelector(".user.name").textContent.trim();
                let existingIndex = recordedUsers.findIndex(u => u.name === userName);
                if (existingIndex !== -1) {
                    recordedUsers.splice(existingIndex, 1); // Remove previous record
                }
                recordedUsers.push({id: userID, name: userName, reason: reasonText});
                user.style.display = 'none';
            } else {
                user.style.display = 'none';
            }
        }
    }

    function navigateToNextPage() {
        if (navigationInProgress) return;

        navigationInProgress = true;
        const nextPageValue = Number(window.location.hash.replace('#start=', '')) + 50;
        if (nextPageValue <= 3000) {
            setTimeout(function() {
                window.location.href = `https://www.torn.com/hospitalview.php#start=${nextPageValue}`;
                navigationInProgress = false;
            }, 850);
        } else {
            scriptActive = false;
            createMenu();
        }
    }

    function createMenu() {
        // Check if menu box already exists and remove it
        let existingMenu = document.getElementById("hospitalUsersMenu");
        if (existingMenu) existingMenu.remove();

        let menuBox = document.createElement("div");
        menuBox.id = "hospitalUsersMenu";
        menuBox.style.position = "fixed";
        menuBox.style.top = "10px";
        menuBox.style.right = "10px";
        menuBox.style.zIndex = 9999;
        menuBox.style.border = "1px solid #ddd";
        menuBox.style.background = "#fff";
        menuBox.style.padding = "10px";
        menuBox.style.width = "350px";
        menuBox.style.height = "500px";
        menuBox.style.overflowY = "auto";
        menuBox.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
        document.body.appendChild(menuBox);

        let searchBox = document.createElement("input");
        searchBox.setAttribute("type", "text");
        searchBox.setAttribute("placeholder", "Search users by reason...");
        searchBox.style.width = "100%";
        searchBox.style.padding = "5px";
        searchBox.style.marginBottom = "10px";
        searchBox.addEventListener("input", function() {
            filterUsersByReason(this.value.toLowerCase());
        });
        menuBox.appendChild(searchBox);

        let table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        menuBox.appendChild(table);

        let thead = document.createElement("thead");
        let tr = document.createElement("tr");
        let th1 = document.createElement("th");
        th1.textContent = "User";
        th1.style.borderBottom = "1px solid #ddd";
        th1.style.padding = "5px";
        let th2 = document.createElement("th");
        th2.textContent = "Reason";
        th2.style.borderBottom = "1px solid #ddd";
        th2.style.padding = "5px";
        tr.appendChild(th1);
        tr.appendChild(th2);
        thead.appendChild(tr);
        table.appendChild(thead);

        let tbody = document.createElement("tbody");
        table.appendChild(tbody);

        for (let user of recordedUsers) {
            let tr = document.createElement("tr");

            let td1 = document.createElement("td");
            let profileLink = document.createElement("a");
            profileLink.href = `https://www.torn.com/profiles.php?XID=${user.id}`;
            profileLink.textContent = user.name;
            profileLink.target = "_blank";
            td1.appendChild(profileLink);
            td1.style.padding = "5px";

            let td2 = document.createElement("td");
            td2.textContent = user.reason;
            td2.style.padding = "5px";

            tr.appendChild(td1);
            tr.appendChild(td2);
            tbody.appendChild(tr);
        }
    }

    function filterUsersByReason(query) {
        let tbody = document.querySelector("#hospitalUsersMenu tbody");
        let rows = tbody.querySelectorAll("tr");
        for (let row of rows) {
            if (row.querySelector("td:last-child").textContent.toLowerCase().includes(query)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    }

})();
