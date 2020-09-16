const fs = require('fs');

module.exports = {
    html: (title,acc,content) => {
        return fs.readFileSync('html/base.html','utf8').replace('$1',title).replace('$2',acc).replace('$3',content);
    },
    listData: (data) => {
        let list = '';
        data.forEach((d) => {list += `<div class='results'>${d}</div>`});
        return list;
    },
    part: (file,$) => {
        return fs.readFileSync(`html/part/${file}.html`,'utf8').replace(/\$1/g,$);
    },
    verify: ($1,$2,$3) => {
        return fs.readFileSync('html/verify.html','utf8').replace('$1',$1).replace('$2',$2);
    },
    notFound: fs.readFileSync('html/base.html','utf8').replace('$1','Not Found').replace('$2','<a href="/account/login">Login</a>').replace('$3','<div class="content"><h1>Not Found</h1><p>The site you are looking for doesn\'t exist. Try again with different URL.</p></div>'),
    login: '<a href="/account/login">Login</a>',
    accPage: '<a href="/account">Account</a>',
}