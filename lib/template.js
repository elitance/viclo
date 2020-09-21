const fs = require('fs');
const crypto = require('crypto');
const db = require('./mysql');

module.exports = {
    html: (title,acc,content) => {
        return fs.readFileSync('html/base.html','utf8').replace('$1',title).replace('$2',acc).replace('$3',content);
    },
    listData: (data) => {
        let list = '<div class="search-results">';
        data.forEach((d) => {
            list += `<a href='/docs/${d[0]}' class='results'>${d[1]}<div>${d[2]}</div></a>`;
        });
        list += '</div>'
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
        let acc = '<a href="/account/login">Login</a><a href="/account/signup">Sign Up</a>';
        if (un) acc = '<a href="/account">Account</a>';
        return acc;
    },
    editAuthor: (un,replace) => {
        db.query('select * from docs',(err,docs) => {
            docs.forEach((row) => {
                let temp = '';
                row.author.split(', ').forEach((author) => {
                    if (author === un) {
                        temp += `, ${replace}`;
                    } else {
                        temp += `, ${author}`;
                    }
                });
                temp = temp.slice(2);
                db.query('update docs set author = ? where id = ?',[temp,row.id],(err,data) => {return});
            });
        });
    },
    crypto: (string,encoding = 'base64') => {
        return crypto.createHash('sha512').update(string).digest(encoding);
    }
}