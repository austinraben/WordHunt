/*
Description: Client-side script for the Word Hunt leaderboard. 
Displays the ranked user scores, based on the date and language selected.
*/

window.onload() = function () {
    const today = getDate();
    fillBoard(today, English)
    //streamers
}

function fillBoard() {

}

function getDate() {

    // Make call to the API
    const httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }

    // 
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                //create new row with username and score
            } else { alert('ERROR'); }
        }
    };
}

function getLanguage() {
    // Make call to the API
    const httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Error!');
        return false;
    }

    // 
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                //create new row with username and score
            } else { alert('ERROR'); }
        }
    };


}

