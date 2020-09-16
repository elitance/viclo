const router = require('express').Router();
const showdown = require('showdown');
const db = require('./mysql');
const template = require('./template');

const converter = new showdown.Converter();

router.get('/write',(req,res) => {
    if (!req.cookies.un) {res.redirect('/account/login'); return; }
    res.send(template.html('Write',template.accPage,template.part('write','')));
});

router.post('/write',(req,res) => {
    db.query('insert into docs (title,content,author,keywords) values (?, ?, ?, ?)',[req.body.title,req.body.content,req.cookies.un,req.body.keywords],(err,data) => {
        if (err) throw err;
        res.redirect(`/docs/${data.insertId}`);
    });
});

router.get('/:page',(req,res) => {
    db.query('select * from docs where id = ?',[req.params.page],(err,docs) => {
        if (!docs[0]) {
            res.send(template.notFound);
        } else {
            const content = converter.makeHtml(docs[0].content);
            let acc = template.login;
            if (req.cookies.un) acc = template.accPage;
            res.send(template.html(docs[0].title,acc,template.part('doc',docs[0].title).replace('$2',content).replace('$3',docs[0].author).replace(/\$4/g,docs[0].id)));
        }
    });
});

router.get('/update/:page',(req,res) => {
    db.query('select * from docs where id = ?',[req.params.page],(err,doc) => {
        if (!req.cookies.un) {res.redirect('/account/login'); return;}
        if (!doc[0]) {
            res.send(template.notFound);
            return;
        }
        res.send(template.html('Update',template.accPage,`
        <div class="content write">
            <h1>Update a Document</h1>
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
    db.query('update docs set title = ?, content = ?, keywords = ? where id = ?',[req.body.title,req.body.content,req.body.keywords,req.params.page],(err,data) => {
        db.query('select * from docs where id = ?',[req.params.page],(err,data) => {
            if (!data[0].author.includes(req.cookies.un)) {
                db.query('update docs set author = ? where id = ?',[`${data[0].author}, ${req.cookies.un}`,req.params.page],(err,data) => {
                    res.redirect(`/docs/${req.params.page}`);
                });
            } else {
                res.redirect(`/docs/${req.params.page}`);
            }
        });
    });
});

module.exports = router;