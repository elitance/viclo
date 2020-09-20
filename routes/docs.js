const router = require('express').Router();
const showdown = require('showdown');
const db = require('../lib/mysql');
const template = require('../lib/template');

const converter = new showdown.Converter();

router.get('/write',(req,res) => {
    if (!req.session.un) {res.redirect('/account/login'); return; }
    res.send(template.html('Write',template.accLink(req.session.un),template.part('write')));
});

router.post('/write',(req,res) => {
    db.query('insert into docs (title,content,author,keywords) values (?, ?, ?, ?)',[req.body.title,req.body.content,req.session.un,req.body.keywords.toLowerCase()],(err,data) => {
        if (err) throw err;
        res.redirect(`/docs/${data.insertId}`);
    });
});

router.get('/:page',(req,res) => {
    db.query('select * from docs where id = ?',[req.params.page],(err,docs) => {
        if (!docs[0]) {
            res.send(template.html('Not Found',template.accLink(req.session.un),template.part('notFound')));
        } else {
            const content = converter.makeHtml(docs[0].content);
            let deleteBtn = '';
            if (req.session.un === 'root') {
                deleteBtn = '<button type="submit">Delete</button>'
            }
            res.send(template.html(docs[0].title,template.accLink(req.session.un),template.part('doc',[docs[0].title,content,docs[0].author,docs[0].id,deleteBtn])));
        }
    });
});

router.get('/update/:page',(req,res) => {
    db.query('select * from docs where id = ?',[req.params.page],(err,doc) => {
        if (!req.session.un) {res.redirect('/account/login'); return;}
        if (!doc[0]) {
            res.send(template.html('Not Found',template.accLink(req.session.un),template.part('notFound')));
            return;
        }
        res.send(template.html('Update',template.accLink(req.session.un),`
        <div class="content write">
            <form action="/docs/update/${req.params.page}" method="POST">
                <input type="text" name="title" placeholder="Title" required value="${doc[0].title}">
                <textarea name="content" placeholder="Content (Markdown Supported)" required>${doc[0].content}</textarea>
                <input type="text" name="keywords" placeholder="Search Keywords (Split by Comma)" required value="${doc[0].keywords}">
                <input type="submit" value="Update Document">
            </form>
        </div>
        `))
    })
});

router.post('/update/:page',(req,res) => {
    db.query('update docs set title = ?, content = ?, keywords = ? where id = ?',[req.body.title,req.body.content,req.body.keywords.toLowerCase(),req.params.page],(err,data) => {
        db.query('select * from docs where id = ?',[req.params.page],(err,data) => {
            if (!data[0].author.includes(req.session.un)) {
                db.query('update docs set author = ? where id = ?',[`${data[0].author}, ${req.session.un}`,req.params.page],(err,data) => {
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