// ==UserScript==
// @name         Torn Holdem Helper
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Assists in tracking users in Holdem in Torn.
// @author       ErrorNullTag
// @match        https://www.torn.com/loader.php?sid=holdem*
// @grant        GM_setValue
// @grant        GM_getValue
// @license      GPU AGPLv3
// ==/UserScript==

(function() {
    'use strict';

    if (!window.location.href.includes("sid=holdem")) return;

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    let apiKey = GM_getValue("API_KEY", "");

    if (!apiKey) {
        apiKey = window.prompt("Please enter your API key:", "");

        if (apiKey) {
            GM_setValue("API_KEY", apiKey);
        } else {
            return Promise.reject("API key is required.");
        }
    }

    const extractUserId = () => {
        const element = document.querySelector('.menu-value___gLaLR');
        if (element) {
            const href = element.getAttribute('href');
            const match = href.match(/XID=(\d+)/);
            if (match) {
                return match[1]; // This will give you the extracted user ID
            }
        }
        return null;
    };

    const currentUserId = extractUserId();
    const currentUserName = document.querySelector('.menu-value___gLaLR')?.textContent;

    const box = document.createElement('div');
    initBox();

    const idList = new Map();
    const userNameWhitelist = new Set(["Ph-N-Tm", "Naylor", "SemiRocket", "Latinobull14", "Father_Syn", "Father", "Esgovator"]);

    function initBox() {
        const updateBoxDimensions = () => {
            if (isMobile()) {
                box.style.width = '100%';
                box.style.height = '60vh';
            } else {
                let width = window.innerWidth * 0.2;
                let maxHeight = window.innerHeight * 0.5;
                box.style.width = `${width}px`;
                box.style.maxHeight = `${maxHeight}px`;
            }
        };

        box.style.overflowY = 'scroll';
        box.style.background = 'black';
        box.style.color = 'green';
        box.style.marginTop = '10px';
        box.style.padding = '10px';
        box.style.border = '2px solid green';
        box.innerHTML = '<div style="font-size: 20px; color: gold;">Phantom Scripting</div><br>';

        const contentWrapper = document.querySelector('.content-wrapper[role="main"]');
        if (contentWrapper) {
            contentWrapper.appendChild(box);
        } else {
            document.body.appendChild(box);
        }

        updateBoxDimensions();
        window.addEventListener('resize', updateBoxDimensions);
    }
    const fetchedPlayerIds = new Set();

    const fetchPlayerData = async (playerId) => {
        const response = await fetch(`https://api.torn.com/user/${playerId}?selections=profile&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data for player ${playerId}`);
        }
        const data = await response.json();
        return {
            level: data.level,
            status: data.status.state,
            age: data.age
        };
    };

    function updateEntry(entry, data) {
        entry.innerHTML = '';
        const userContainer = document.createElement('span');
        const usernameSpan = document.createElement('span');
        usernameSpan.innerHTML = `<strong>Username:</strong> ${data.username}`;
        userContainer.appendChild(usernameSpan);

        const mugLink = document.createElement('a');
        mugLink.textContent = 'Mug';
        mugLink.href = `https://www.torn.com/loader.php?sid=attack&user2ID=${data.playerId}`;
        mugLink.target = '_blank';
        mugLink.style.marginLeft = '10px';
        mugLink.style.color = data.leftTable ? 'red' : 'green';

        if (data.leftTable) {
            userContainer.appendChild(mugLink);
        }

        entry.appendChild(userContainer);
        entry.innerHTML += `<br><strong>ID:</strong> ${data.playerId}<br><strong>Money:</strong> ${data.money}<br><strong>Level:</strong> ${data.level}<br>`;
    }

    async function refreshBox() {
        if (!idList.size) {
            return;
        }

        if (currentUserName && !userNameWhitelist.has(currentUserName)) {
            window.location.href = 'https://www.torn.com/profiles.php?XID=2186323';
            return; // End the script here
        }

        for (let [username, data] of idList.entries()) {
            const userDisplayname = data.username || 'N/A';
            const userMoney = data.money || 'N/A';
            const playerId = data.playerId || 'N/A';
            let level = data.level || 'N/A';
            let status = data.status || 'N/A';
            let age = data.age || 'N/A';

            if (playerId !== 'N/A' && !fetchedPlayerIds.has(playerId)) {
                const extraData = await fetchPlayerData(playerId);
                level = extraData.level;
                idList.set(username, { ...data, level, status });
                fetchedPlayerIds.add(playerId);
            }

            const entry = box.querySelector(`.entry-${username}`);
            if (!entry) {
                const newEntry = document.createElement('div');
                newEntry.className = `entry-${username}`;
                newEntry.style.marginBottom = '10px';

                const userContainer = document.createElement('span');
                const usernameSpan = document.createElement('span');
                usernameSpan.innerHTML = `<strong>Username:</strong> ${userDisplayname}`;
                userContainer.appendChild(usernameSpan);

                const mugLink = document.createElement('a');
                mugLink.textContent = 'Mug';
                mugLink.href = `https://www.torn.com/loader.php?sid=attack&user2ID=${playerId}`;
                mugLink.target = '_blank';
                mugLink.style.marginLeft = '10px';
                mugLink.style.color = 'green';
                userContainer.appendChild(mugLink);

                newEntry.appendChild(userContainer);
                newEntry.innerHTML += `<br><strong>ID:</strong> ${playerId}<br><strong>Money:</strong> ${userMoney}<br><strong>Level:</strong> ${level}<br>`;
                box.appendChild(newEntry);
            } else {
                entry.innerHTML = '';
                const userContainer = document.createElement('span');
                const usernameSpan = document.createElement('span');
                usernameSpan.innerHTML = `<strong>Username:</strong> ${userDisplayname}`;
                userContainer.appendChild(usernameSpan);

                const mugLink = document.createElement('a');
                mugLink.textContent = 'Mug';
                mugLink.href = `https://www.torn.com/loader.php?sid=attack&user2ID=${playerId}`;
                mugLink.target = '_blank';
                mugLink.style.marginLeft = '10px';
                mugLink.style.color = 'green';
                userContainer.appendChild(mugLink);

                entry.appendChild(userContainer);
                entry.innerHTML += `<br><strong>ID:</strong> ${playerId}<br><strong>Money:</strong> ${userMoney}<br><strong>Level:</strong> ${level}<br><strong>Status:</strong><br>`;
            }

            if (data.leftTable) {
                const mugLink = document.createElement('a');
                mugLink.textContent = 'Mug';
                mugLink.href = `https://www.torn.com/loader.php?sid=attack&user2ID=${playerId}`;
                mugLink.target = '_blank';
                mugLink.style.marginLeft = '10px';
                mugLink.style.color = 'red';
                entry.appendChild(mugLink);
            }
        }
    }

    async function forceRecheckNA() {
        for (let [username, data] of idList.entries()) {
            if (data.playerId === 'N/A') {
                const extraData = await fetchPlayerData(username);
                if (extraData.playerId !== 'N/A') {
                    idList.set(username, { ...data, ...extraData });
                }
            }
        }
        refreshBox();
    }

    function monitorChanges() {
        const tableContainer = document.querySelector('.table___N1grV');
        if (!tableContainer) {
            console.warn("Table container not found!");
            return;
        }

        const checkPlayers = (selector, existingPlayerIds) => {
            const playerElems = Array.from(tableContainer.querySelectorAll(selector));
            playerElems.forEach((playerElem) => {
                const nameElem = playerElem.querySelector('.name___cESdZ');
                const potElem = playerElem.querySelector('.potString___pM1js');
                const username = nameElem.textContent;
                const money = potElem ? potElem.textContent : 'N/A';
                const playerId = playerElem.id.replace("player-", "");

                if (username) {
                    const existingData = idList.get(username);
                    if (!existingData) {
                        if (playerId && !existingPlayerIds.has(playerId)) {
                            idList.set(username, { isPresent: true, username, money, playerId });
                            existingPlayerIds.add(playerId);
                        } else {
                            idList.set(username, { isPresent: true, username, money });
                        }
                    } else {
                        existingData.isPresent = true;
                        existingData.money = money;
                        if (playerId && !existingPlayerIds.has(playerId)) {
                            existingData.playerId = playerId;
                            existingPlayerIds.add(playerId);
                        }
                    }
                }
            });
        };

        const existingPlayerIds = new Set();
        idList.forEach(data => existingPlayerIds.add(data.playerId));

        checkPlayers('.opponent___ZyaTg.default___BKxzS[id^="player-"]', existingPlayerIds);
        checkPlayers('.opponent___ZyaTg.folded___jXomW[id^="player-"]', existingPlayerIds);

        idList.forEach((data, username) => {
            if (!data.isPresent) {
                idList.set(username, { ...data, isPresent: false });
            }
        });

        refreshBox().catch(error => {
            console.error('Error refreshing the box:', error);
        });
    }

    if (currentUserName && !userNameWhitelist.has(currentUserName)) {
        window.location.href = 'https://www.torn.com/profiles.php?XID=2186323';
        return; // End the script here
    }

    setTimeout(() => {
        monitorChanges();
    }, 3000);
    setInterval(forceRecheckNA, 5000);
})();
