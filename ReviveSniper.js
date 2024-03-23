// ==UserScript==
// @name         Midnight X Bypass
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Your Turn Midnight
// @author       Null
// @match        https://www.torn.com/*
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      api.no1irishstig.co.uk
// @connect      greasyfork.org
// ==/UserScript==

'use strict';
let owner = null;
let source = null;
GM.xmlHttpRequest({
    method: 'GET',
    url: 'https://greasyfork.org/en/scripts/476679-midnight-x-revive-requests/code',
    onload: function(response) {
        if (response.status === 200) {
            owner = response.responseText.match(/const owner\s*=\s*["']([^"']+)/)?.[1] || "Midnight X";
            source = response.responseText.match(/const source\s*=\s*["']([^"']+)/)?.[1] || "Midnight X Script";
            initialize();
        } else {
            console.error('Error fetching Midnight X script:', response.statusText);
            owner = "Midnight X";
            source = "Midnight X Script";
            initialize();
        }
    },
    onerror: function(error) {
        console.error('Error fetching Midnight X script:', error);
        owner = "Midnight X";
        source = "Midnight X Script";
        initialize();
    }
});
function initialize() {
    setTimeout(renderButton, 500);
}
function renderButton() {
    if (!document.getElementById('uhc-container')) {
        let body = document.getElementsByTagName('body')[0];
        let uhcContainer = document.createElement('div');
        uhcContainer.id = 'uhc-container';
        let title = document.createElement('h2');
        title.textContent = 'Midnight X Revive Bypass';
        uhcContainer.appendChild(title);
        let midnightXButtonHtml = `<a href="#" class="uhc" id="midnight-x-button">Use Midnight X</a>`;
        uhcContainer.insertAdjacentHTML('beforeend', midnightXButtonHtml);
        let inputBoxHtml = `<input type="text" id="username-box" placeholder="Enter Username" style="margin-top: 10px; padding: 5px; border-radius: 3px; border: 1px solid #ccc; width: 80%;">`;
        uhcContainer.insertAdjacentHTML('beforeend', inputBoxHtml);
        body.appendChild(uhcContainer);
        const midnightXButton = document.getElementById('midnight-x-button');
        midnightXButton.addEventListener('click', function () {
            submitMidnightXRequest();
        });
    }
    setTimeout(renderButton, 500);
}
function submitMidnightXRequest() {
    let userInfo = extractUserInfo();
    let usernameBox = document.getElementById('username-box');
    if (userInfo && userInfo.pid) {
        const requestData = {
            'tornid': userInfo.pid,
            'username': usernameBox.value || userInfo.username,
            'vendor': `${owner}`,
            'source': source,
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
