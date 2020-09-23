const router = require('express').Router();
const showdown = require('showdown');
const db = require('../lib/mysql');
const template = require('../lib/template');

const converter = new showdown.Converter();

router.get('/write',(req,res) => {
    if (!req.user) {res.redirect('/account/login'); return; }
    res.send(template.html('Write',template.part('write'),req));
});

router.post('/write',(req,res) => {
    db.query('insert into docs (title,content,author,keywords) values (?, ?, ?, ?)',[req.body.title,req.body.content,`@${req.user.un}`,req.body.keywords.toLowerCase()],(err,data) => {
        if (err) throw err;
        res.redirect(`/docs/${data.insertId}`);
    });
});

router.get('/:page',(req,res) => {
    db.query('select * from docs where id = ?',[req.params.page],(err,docs) => {
        if (!docs[0]) {
            res.send(template.html('Not Found',template.part('notFound'),req));
        } else {
            const content = converter.makeHtml(docs[0].content);
            let deleteBtn = '';
            let authors = '';
            docs[0].author.split(', ').forEach((author) => {
                if (author !== '[Deleted Account]') {
                    authors += `, <a href="/account/user/${author}" class="user">@${author}</a>`;
                } else {
                    authors += `, <span class="del-auth">${author}</span>`;
                }
            });
            if (req.user) if (req.user.un === 'root') deleteBtn = '<button type="submit">Delete</button>';
            res.send(template.html(docs[0].title,template.part('doc',[docs[0].title,content,authors.slice(2),docs[0].id,deleteBtn]),req));
        }
    });
});

router.get('/update/:page',(req,res) => {
    db.query('select * from docs where id = ?',[req.params.page],(err,doc) => {
        if (!req.user) {res.redirect('/account/login'); return;}
        if (!doc[0]) {
            res.send(template.html('Not Found',template.part('notFound'),req));
            return;
        }
        res.send(template.html('Update',`
        <div class="content write">
            <form action="/docs/update/${req.params.page}" method="POST">
                <input type="text" name="title" placeholder="Title" required value="${doc[0].title}">
                <textarea name="content" placeholder="Content (Markdown Supported)" required>${doc[0].content}</textarea>
                <input type="text" name="keywords" placeholder="Search Keywords (Split by Comma)" required value="${doc[0].keywords}">
                <input type="submit" value="Update Document">
            </form>
        </div>
        `,req))
    })
});

router.post('/update/:page',(req,res) => {
    db.query('update docs set title = ?, content = ?, keywords = ? where id = ?',[req.body.title,req.body.content,req.body.keywords.toLowerCase(),req.params.page],(err,data) => {
        db.query('select * from docs where id = ?',[req.params.page],(err,data) => {
            let includes = false;
            data[0].author.split(', ').forEach((a) => {if (a === req.user.un) includes = true;});
            if (!includes) {
                db.query('update docs set author = ? where id = ?',[`${data[0].author}, ${req.user.un}`,req.params.page],(err,data) => {
                    res.redirect(`/docs/${req.params.page}`);
                });
            } else {
                res.redirect(`/docs/${req.params.page}`);
            }
        });
    });
});

router.post('/delete',(req,res) => {
    db.query('delete from docs where id = ?',[req.body.id],(err,data) => {
        res.redirect('/');
    });
});

module.exports = router;