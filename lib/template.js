const fs = require('fs');

module.exports = {
    html: (title,acc,content) => {
        return fs.readFileSync('html/base.html','utf8').replace('$1',title).replace('$2',acc).replace('$3',content);
    },
    listData: (data) => {
        let list = '';
        data.forEach((d) => {
            list += `<a href='/docs/${d[0]}' class='results'>${d[1]}<div>${d[2]}</div></a>`;
        });
        return list;
    },
    part: (file,replace = []) => {
        let result = fs.readFileSync(`html/part/${file}.html`,'utf8');
        for (var i = 1; i <= replace.length; i++) {
            result = result.replace(new RegExp(`\\$${i}`,'g'),replace[i - 1]);
        }
        return result;
    },
    verify: ($1,$2) => {
        return fs.readFileSync('html/verify.html','utf8').replace('$1',$1).replace('$2',$2);
    },
    parse: (strArr) => {
        let result = new Array();
        strArr.split(',').forEach((str) => {
            result.push(str.trim());
        });
        return result;
    },
    accLink: (un) => {
        let acc = '<a href="/account/login">Login</a>';
        if (un) acc = '<a href="/account">Account</a>';
        return acc;
    },
}