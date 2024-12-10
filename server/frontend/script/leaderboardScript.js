/*
Description: Client-side script for the Word Hunt leaderboard. 
Displays the ranked user scores, based on the date and language selected.
*/

// Fills table with default values
window.onload = function () {
    getTable();
};

// Every time someone changes the option, the table will be regenerated
function getTable() {
    const date = document.getElementById('date-select').value;
    const language = document.getElementById('language-select').value;

    // Make call to the API
    const httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }

    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const responseData = JSON.parse(httpRequest.responseText); // Parse the response
                fillTable(responseData);
            } else {
                alert('ERROR');
            }
        }
    };

    httpRequest.open('GET', `/api/scores?date=${date}&language=${language}`);
    httpRequest.send();
}

// Fill the table of scores
function fillTable(data) {
    const leaderboardTable = document.querySelector('#box table');
    leaderboardTable.innerHTML = `
        <tr>
            <th id="user" class="userCol">Username</th>
            <th id="score" class="scoreCol">Score</th>
        </tr>
    `; // Clear previous data and set table headers

    // ranks the user from hgihest to lowest score
    const usersRanked = data.users.sort(function(a, b){b.score - a.score}); // Assume the API returns a "users" array

    usersRanked.forEach(user => {
        const row = document.createElement('tr');

        const usernameCell = document.createElement('td');
        usernameCell.textContent = user.name; // Assuming the user object has a "name" property
        row.appendChild(usernameCell);

        const scoreCell = document.createElement('td');
        scoreCell.textContent = user.score; // Assuming the user object has a "score" property
        row.appendChild(scoreCell);

        leaderboardTable.appendChild(row);
    });
}
