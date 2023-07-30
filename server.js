"use strict";
const express = require("express");
const cors = require('cors');
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const _port = 3216;
const _app_folder = '../media-pedia/dist/media-pedia';

const app = express();
//app.use(cors());       

app.use((reg, res, next) => {
    // res.header("Access-Control-Allow-Origin", "*");
    next();
});

// ---- SERVE STATIC FILES ---- //
app.use(express.static(_app_folder));

// ---- SERVE APLICATION PATHS ---- //

app.get('/', (req, res, next) => {
    res.status(200).sendFile(`/`, {root: _app_folder});
});

app.get('/fetch', async (req, res, next) => {
    let url = req.query.url;
    console.log('url', url);
    let paras = await scrapePage(url);
    res.status(200).send(paras);
});

// ---- START UP THE NODE SERVER  ----
app.listen(_port, function () {
    console.log("Node Express server for " + app.name + " listening on http://localhost:" + _port);
});

async function scrapePage(url) {
    const htmlData = axios
        .get(url)
        .then(res => {
            let dom = new JSDOM(res.data);
            let docu = dom.window.document;
            let ps = Array.from(docu.querySelectorAll('p'));
            let texts = ps.map(p => p.textContent);
            let reduced = texts.reduce((prev, curr) => {
                if (prev.length >= 1500) return prev;
                let val = prev += '\n' + curr;
                return val;
              }, '');
            return JSON.stringify(reduced);
        })
        .catch((err) => {
            console.error('There was an error with url ' + url);
            console.error(err);
        })

    return htmlData;
}
