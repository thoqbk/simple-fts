const dotenv = require('dotenv');

dotenv.config({ path: '.env' });
const stopWords = ['a', 'and', 'be', 'have', 'i', 'in', 'of', 'that', 'the', 'to'];

const normalize = (s) => {
    return (s || '').split(/[^a-z0-9]/)
        .filter(w => w)
        .map(w => w.toLowerCase())
        .filter(w => w && stopWords.indexOf(w) == -1);
}

const wordToKey = (w) => `#${w}`;

const nowInNs = () => {
    const hrTime = process.hrtime();
    return hrTime[0] * 1000000 + hrTime[1] / 1000
}

module.exports = {
    normalize,
    wordToKey,
    nowInNs,
}