const wordsApi = "https://gist.githubusercontent.com/h3xx/1976236/raw/bbabb412261386673eff521dddbe1dc815373b1d/wiki-100k.txt";
let words = [];

async function loadData() {
    // Calls the API and initializes the words array
    const response = await fetch(wordsApi);

    if (!response.ok) {
        throw new Error(`API responded wih status: ${response.status}`);
    }

    const wordsTextList = await response.text();
    words = wordsTextList.trim().split("\n");
    words = words.filter(word => word[0] !== "#");
}

function sortObjectArray(arrayOfObjects, key) {
    // Sorts an array of objects based on a key in the object
    return arrayOfObjects.sort((a, b) => {
        const item1 = a[key];
        const item2 = b[key];

        if (item1 > item2) {
            return 1;
        } else if (item1 < item2) {
            return -1;
        } else {
            return 0;
        }
    });
}

function levDis(str1, str2) {
    // Calculates the Levenshtein Distance between two given words
    const len1 = str1.length;
    const len2 = str2.length;
    const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,       // deletion
                dp[i][j - 1] + 1,       // insertion
                dp[i - 1][j - 1] + cost // substitution
            );
        }
    }
    return dp[len1][len2];
}

function getClosestWords(wordList, word) {
    // Sorst the words array based on the Levenshtein distance
    const closestWords = wordList.map(w => ({
        word: w,
        distance: levDis(word, w)
    }));
    return sortObjectArray(closestWords, 'distance');
}

function main() {
    // Main Program

    const wordInput = document.getElementById("input");
    const outputElem = document.getElementById("outputs");

    loadData().then(() => {
        const debounce = (func, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), delay);
            };
        };

        const addToInput = (word) => {
            wordInput.value = word;
        };

        const handleInput = () => {
            const word = wordInput.value || "";

            // Clear previous outputs
            outputElem.innerHTML = "";

            // Calculate closest words
            const closestWords = getClosestWords(words, word);

            for (let i = 0; i < Math.min(closestWords.length, 5); i++) {
                const output = document.createElement('span');
                output.className = 'output';
                output.textContent = closestWords[i].word;
                output.addEventListener('click', () => addToInput(closestWords[i].word));
                outputElem.appendChild(output);
            }
        };
        wordInput.addEventListener("keyup", debounce(handleInput, 300));

    }).catch((error) => {
        let errorMessage = "An error occured while fetching data :(";
        outputElem.innerHTML = `<span class="error">${errorMessage}</span>`
        console.log(errorMessage, error);

    });
}

document.addEventListener("DOMContentLoaded", main);
