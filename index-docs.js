const XmlStream = require('xml-stream');
const EventEmitter = require('events');
const fs = require('fs');
const { normalize, wordToKey } = require('./lib.js');

const eventEmitter = new EventEmitter();

const indexString = (index, s, docId) => {
    const words = normalize(s);
    for (const word of words) {
        const key = wordToKey(word);
        if (!index[key]) {
            index[key] = [];
        }
        index[key].push(docId);
    }
}

const loadDocs = () => {
    const stream = fs.createReadStream(process.env.DATA_FILE);
    const xmlStream = new XmlStream(stream);
    const docs = [];
    let currentId = 0;
    xmlStream.on('endElement: doc', (raw) => {
        docs.push({
            id: currentId++,
            title: raw.title,
            abstract: raw.abstract,
        });
        if (docs.length % 1000 == 0) {
            console.log(`Document(s) read ${docs.length}`);
        }
        if (process.env.DOCS_LIMIT && parseInt(process.env.DOCS_LIMIT) <= docs.length) {
            console.log(`Reach the docs_limit ${docs.length}, stop reading`);
            stream.destroy();
        }
    });

    return new Promise((resolve, reject) => {
        stream.on('close', () => {
            console.log(`Finish reading ${docs.length} document(s)`);
            resolve(docs);
        });

        xmlStream.on('error', (err) => {
            console.log('Read data fails', err);
            reject(err);
        });
    });
}

const indexDocs = async () => {
    const docs = await loadDocs();
    console.log(`Create index for ${docs.length} document(s)`);
    const index = {};
    for (const doc of docs) {
        // TODO: fix duplication id in same word index
        indexString(index, doc.title, doc.id);
        indexString(index, doc.abstract, doc.id);
    }
    // save index to file
    fs.writeFileSync(process.env.INDEX_FILE, JSON.stringify({
        index,
        docs,
    }));
}

eventEmitter.emit('waiting');
indexDocs().then(eventEmitter.on('waiting', () => {
    console.log('Index completed');
}));
