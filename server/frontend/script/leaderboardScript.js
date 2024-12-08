/*
Description: Client-side script for the Word Hunt leaderboard. 
Displays the ranked user scores, based on the date and language selected.
*/

//need to load 
window.onload() = function () {
   getTable()
}

function getTable() {

    const date = document.getElementById('date-select').value
    const language = document.getElementById('language-select').value

    //get current date value and langaueg value
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
                fillTable(date, language);
            } else { alert('ERROR'); }
        }
    };
}


    // Fill the table of scores
    function fillTable(date, language){
        

        
        // The number of users for that day and language
        //const userNum = 

        // Iterate through every user and give them a row in the correct ranking order 
        // userNum must already have the users ranked in order first to last
        // same goes for score
        for(i = 0; i < userNum; i++){
            const row = document.createElement('tr');

            for(let f = 0; f < 1; f++){
                const cell = document.createElement('td');
                
                if(f == 0){
                    cell.textContent = //userNum[0];
                }

                if(f == 1){
                    cell.textContent = //score[0];
                }


            }
        }
        
    }
}

