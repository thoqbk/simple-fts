# Simple Full-text search engine

## Get started

0. Clone project and run `npm i` to fetch dependencies
1. Download [data file](https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-abstract1.xml.gz) and extract it
2. Clone `.env.example` to `.env` and update parameter accordingly
3. Create index for data by running `npm run index`
4. Run server `npm run server` and try `curl http://localhost:3000/?q=Alfons-Maria-Jakob`

## Sample result

```json
{
    result: [
        {
            id: 160,
            title: "Wikipedia: Alfons Maria Jakob",
            abstract: "Alfons Maria Jakob (2 July 1884 – 17 October 1931) was a German neurologist who worked in the field of neuropathology."
        }
    ],
    timeSpentInNs: 31,
    found: 1,
    scan: 620515
}
```

The impression is the search speed is super fast, the response time is usually less than 200ns

## Reference

- [Let's build a Full-Text Search engine](https://artem.krylysov.com/blog/2020/07/28/lets-build-a-full-text-search-engine/)