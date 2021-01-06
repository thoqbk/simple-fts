const express = require('express');
const fs = require('fs');
const _ = require('lodash');
const { nowInNs, normalize, wordToKey } = require('./lib.js');

const app = express();
const port = 3000;

// These variables will be updated by loadIndex()
let index = null; // word -> list of doc id
let docs = null;
let docByIds = null;

const intersect = (ids1, ids2) => {
    let idx1 = 0;
    let idx2 = 0;
    const retVal = [];
    while (idx1 < ids1.length && idx2 < ids2.length) {
        if (ids1[idx1] == ids2[idx2]) {
            retVal.push(ids1[idx1]);
            idx1 += 1;
            idx2 += 1;
        } else if (ids1[idx1] < ids2[idx2]) {
            idx1 += 1;
        } else {
            idx2 += 1;
        }
    }
    return retVal;
}

const searchDocs = (q) => {
    const words = normalize(q);
    if (!words.length) {
        return [];
    }
    let docIds = null;
    for (const word of words) {
        const key = wordToKey(word);
        const result = index[key];
        if (!result) {
            docIds = null;
            break;
        }
        if (!docIds) {
            docIds = result;
        } else {
            docIds = intersect(docIds, result);
        }
    }
    if (!docIds) {
        return [];
    }
    return _.uniq(docIds).map(docId => docByIds[docId]);
}

const loadIndex = () => {
    const indexContent = fs.readFileSync(process.env.INDEX_FILE, "utf8");
    const result = JSON.parse(indexContent);
    index = result.index;
    docs = result.docs;
    docByIds = {}
    for (const doc of docs) {
        docByIds[doc.id] = doc;
    }
}

app.get('/', (req, res) => {
    if (docs == null || docByIds == null) {
        return res.send('Index is not ready');
    }
    const startNs = nowInNs();
    const result = searchDocs(req.query.q);
    res.send(JSON.stringify({
        result,
        timeSpentInNs: Math.trunc(nowInNs() - startNs),
        found: result.length,
        scan: docs.length,
    }, null, 4));
});

app.listen(port, () => {
    console.log(`Fts-demo listening at http://localhost:${port}`);
});

loadIndex();