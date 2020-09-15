const fs = require('fs');
const url = require('url');
const db = require('./mysql');

module.exports = {
    html: {
        searchResult: (req,res) => {
            const query = url.parse(req.url,true).query.q;
            function basic(title,results) { return fs.readFileSync('html/search.html','utf8').replace('$1',title).replace('$2',results); }
            db.query('select * from docs where title = ?',[query],(err,doc) => {
                res.send(basic(query,`<h1 style='font-size: 55px; color: gray;'>¯\\_(ツ)_/¯</h1><p>No Search results found for '${query}'.</p>`));
            });
        }
    },
    listData: (data) => {
        let list = '';
        data.forEach((d) => {list += `<div class='results'>${d}</div>`});
        return list;
    }
}