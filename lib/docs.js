const url = require('url');
const fs = require('fs');
const db = require('./mysql');

exports.search = (req,res) => {
    const query = url.parse(req.url,true).query.q;
    fs.readFile('html/search.html','utf8',(err,data) => {
        db.query('select * from docs where title = ?',[query],(err,doc) => {
            let html;
            if (!doc[0]) {
                html = data.replace('$1',query).replace('$2',`
                <h1 style='font-size: 55px; color: gray;'>¯\\_(ツ)_/¯</h1>
                <p>No search results found for '${query}'.<br>Try to search with another query, or <a href="/create">write a document yourself</a>!</p>
                `);
                console.log(html);
            }
            res.send(html);
        });
    });
}