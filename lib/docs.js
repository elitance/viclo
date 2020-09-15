const url = require('url');
const fs = require('fs');
const db = require('./mysql');
const template = require('./template');

exports.home = (req,res) => {
    fs.readFile('html/index.html','utf8',(err,data) => {
        res.send(data);
    });
}

exports.search = (req,res) => {
    const query = url.parse(req.url,true).query.q;
    db.query('select * from docs where title = ?',[query],(err,doc) => {
        let html;
        if (!doc[0]) {
            html = template.html(query,`
            <div class="results-parent">
                <h1>¯\\_(ツ)_/¯</h1>
                <p>No search results found for '${query}'.<br>Try to search with another query, or <a href="/create">write a document yourself</a>!</p>
            </div>
            `);
        }
        res.send(html);
    });
}