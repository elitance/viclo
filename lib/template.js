const fs = require('fs');
const url = require('url');
const db = require('./mysql');

module.exports = {
    html: (title,content) => {
        return fs.readFileSync('html/base.html','utf8').replace('$1',title).replace('$2',content);
    },
    listData: (data) => {
        let list = '';
        data.forEach((d) => {list += `<div class='results'>${d}</div>`});
        return list;
    }
}