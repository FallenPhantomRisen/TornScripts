// ==UserScript==
// @name         Force Revive
// @namespace    http://tampermonkey.net/
// @version      1.2.5
// @description  Adds functionality for UHC force revive, Midnight X, and Nuke options
// @author       Ph-N-Tm [2186323]
// @match        https://www.torn.com/profiles.php?*
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      elimination.me
// @connect      api.no1irishstig.co.uk
// @connect      nukefamily.org
// ==/UserScript==

'use strict';
setTimeout(renderButton, 500);
GM_addStyle ( `
    #uhc-container {
        position: fixed;
        top: 0;
        right: 0;
        background-color: #1a1a1a;
        padding: 10px;
        border: 2px solid #ccc;
        z-index: 1000;
        border-radius: 0 0 0 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    #uhc-container h2 {
        color: gold;
        font-size: 1em;
        margin: 0 0 10px 0;
        text-align: center;
        font-weight: bold;
    }
    .uhc {
        color: #4CAF50;
        font-family: Arial, sans-serif;
        font-size: .75em;
        cursor: pointer;
        text-decoration: none;
        display: block;
        text-align: center;
        background-color: #333;
        border: 1px solid #4CAF50;
        padding: 5px 10px;
        border-radius: 3px;
        margin: 0 auto;
        transition: background-color 0.3s ease;
    }
    .uhc:hover {
        background-color: #4CAF50;
        color: white;
    }
` );
function renderButton() {
    if (!document.getElementById('uhc-container')) {
        let body = document.getElementsByTagName('body')[0];
        let uhcContainer = document.createElement('div');
        uhcContainer.id = 'uhc-container';
        let title = document.createElement('h2');
        title.textContent = 'Phantom Scripting Force Revive';
        uhcContainer.appendChild(title);
        let reviveHtml = `<a href="#" class="uhc" id="uhc-button">Use UHC</a>`;
        uhcContainer.insertAdjacentHTML('beforeend', reviveHtml);
        let midnightXButtonHtml = `<a href="#" class="uhc" id="midnight-x-button">Use Midnight X</a>`;
        uhcContainer.insertAdjacentHTML('beforeend', midnightXButtonHtml);
        let nukeButtonHtml = `<a href="#" class="uhc" id="nuke-button">Use Nuke</a>`;
        uhcContainer.insertAdjacentHTML('beforeend', nukeButtonHtml);
        body.appendChild(uhcContainer);
        const uhcButton = document.getElementById('uhc-button');
        uhcButton.addEventListener('click', function () {
            checkAndTransmit();
        });
        const midnightXButton = document.getElementById('midnight-x-button');
        midnightXButton.addEventListener('click', function () {
            submitMidnightXRequest();
        });
        const nukeButton = document.getElementById('nuke-button');
        nukeButton.addEventListener('click', function () {
            callForRevive();
        });
    }
    setTimeout(renderButton, 500);
}
function checkAndTransmit() {
    let userInfo = extractUserInfo();
    if (userInfo && userInfo.pid) {
        var obj = new Object();
        obj.userID = userInfo.pid;
        obj.userName = userInfo.username;
        obj.factionName = userInfo.faction;
        obj.source = "UHC Script";
        var jsonString = JSON.stringify(obj);
        if (!confirm('Send this data? ' + jsonString)) {
            return;
        }
        let url = 'https://elimination.me/api/request';
        GM.xmlHttpRequest({
            method: 'POST',
            url: url,
            data: jsonString,
            headers: {
                "Content-Type": "application/json"
            },
            onload: function (response) {
                if (response.status == 200) {
                    alert('Target Sent Successfully');
                } else {
                    alert('Error: ' + JSON.parse(response.responseText).reason);
                }
            },
            onerror: function (error) {
                alert('Error:' + error);
            }
        });
    } else {
        alert('User information could not be found on this page.');
    }
}
function submitMidnightXRequest() {
    let userInfo = extractUserInfo();

    if (userInfo && userInfo.pid) {
        const requestData = {
            'tornid': userInfo.pid,
            'username': userInfo.username,
            'vendor': 'Midnight X Script 1.2',
            'source': 'Midnight X Script',
            'type': 'revive'
        };
        if (!confirm('Send this data to Midnight X? ' + JSON.stringify(requestData))) {
            return;
        }
        GM.xmlHttpRequest({
            method: 'POST',
            url: 'https://api.no1irishstig.co.uk/request',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(requestData),
            onload: handleMidnightXResponse,
        });
    } else {
        alert('You are not in the hospital or user info is missing.');
    }
}
function handleMidnightXResponse(response) {
    if (response.status !== 200) {
        const errorMessage = ERRORS[response.status] || `Error: ${response.statusText}`;
        alert(errorMessage);
        return;
    }
    alert('Request has been sent to Midnight X. Please check for confirmation.');
}
function extractUserInfo() {
    let userElements = document.querySelectorAll('.user-info-value');
    if (userElements.length >= 3) {
        let usernameAndPid = userElements[0].querySelector('.bold').textContent.trim();
        let pidMatch = usernameAndPid.match(/\[(\d+)\]/);
        let pid = pidMatch ? parseInt(pidMatch[1], 10) : null;
        let username = usernameAndPid.split('[')[0].trim();
        let factionFullText = userElements[2].textContent.trim();
        let factionSplit = factionFullText.split(' ');
        let ofIndex = factionSplit.indexOf('of');
        let faction = factionSplit.slice(ofIndex + 1).join(' ');
        return { pid: pid, username: username, faction: faction };
    }
    return null;
}
const ERRORS = {
  401: `Request denied - Contact Midnight X leadership.`,
  429: `You have already submitted a request to be revived.`,
  499: `Outdated Script - Please update.`,
  500: `An unknown error has occurred - Please report this to Midnight X leadership.`,
};
function callForRevive() {
    let userInfo = extractUserInfo();
    if (!userInfo || !userInfo.pid) {
        alert('User information could not be found on this page.');
        return;
    }
    const hospitalIcon = document.querySelector('li.user-status-16-Hospital a[href="/hospitalview.php"]');
    if (!hospitalIcon) {
        alert("This user is not hospitalized.");
        return;
    }
    let Country = {
        name: 'torn',
        title: 'Torn'
    };
    let premiumRandom = Math.random() < 0.5;
    var postData = {
        uid: userInfo.pid,
        Player: userInfo.username,
        Faction: userInfo.faction,
        Country: Country.title,
        Premium: premiumRandom
    };
    if (confirm('Send this data? ' + JSON.stringify(postData))) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://www.nukefamily.org/dev/reviveme.php',
            data: JSON.stringify(postData),
            onload: function (responseDetails) {
                alert(responseDetails.responseText);
            }
        });
    }
}
