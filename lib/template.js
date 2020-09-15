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
    },
    part: (file,$) => {
        return fs.readFileSync(`html/part/${file}.html`,'utf8').replace('$1',$);
    },
    notFound: fs.readFileSync('html/base.html','utf8').replace('$1','Not Found').replace('$2','<div class="content"><h1>Not Found</h1><p>The site you are looking for doesn\'t exist. Try again with different URL.</p></div>'),
}