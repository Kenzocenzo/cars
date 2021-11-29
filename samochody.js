var express = require("express");
var app = express();
var PORT = process.env.PORT || 3000;
const Datastore = require("nedb");
app.use(express.static("static"));
var hbs = require("express-handlebars");
var path = require("path");

const coll1 = new Datastore({
    filename: "kolekcja.db",
    autoload: true,
});
app.get("/", function (req, res) {
    let context = {};
    coll1.find({}, function (err, doc) {
        context.baza = doc;
        console.log(context);
        res.render("view1.hbs", context);
    });
});
app.get("/handler", function (req, res) {
    let obj = {
        ubezpieczony: req.query.a == "on" ? "TAK" : "NIE",
        benzyna: req.query.b == "on" ? "TAK" : "NIE",
        uszkodzony: req.query.c == "on" ? "TAK" : "NIE",
        naped4x4: req.query.d == "on" ? "TAK" : "NIE",
    };
    coll1.insert(obj, function (err, newDoc) {
        console.log("dodano dokument (obiekt):");
        console.log(newDoc);
        console.log("losowe id dokumentu: " + newDoc._id);
        let context = {};
        res.redirect("/");
    });
});
app.get("/delete", function (req, res) {
    coll1.remove({ _id: req.query.id }, {}, function (err, numRemoved) {
        console.log("usunięto dokumentów: ", numRemoved);
        let context = {};
        coll1.find({}, function (err, doc) {
            context.baza = doc;
            console.log(context);
            res.render("view1.hbs", context);
        });
    });
});
app.get("/edit", function (req, res) {
    let context = {};
    coll1.find({}, function (err, doc) {
        context.baza = doc;
        context.eid = req.query.id;
        console.log(context);
        res.render("view1.hbs", context);
    });
});
app.get("/update", function (req, res) {
    let obj = {
        ubezpieczony: req.query.e,
        benzyna: req.query.f,
        uszkodzony: req.query.g,
        naped4x4: req.query.h,
    };
    console.log(obj);
    console.log(req.query.id);
    coll1.update({ _id: req.query.id }, { $set: obj }, {}, function (err, numUpdated) {
        console.log("zaktualizowano " + numUpdated);
        let context = {};
        coll1.find({}, function (err, doc) {
            context.baza = doc;
            console.log(context);
            res.render("view1.hbs", context);
        });
    });
});
app.set("views", path.join(__dirname, "views")); // ustalamy katalog views
app.engine(
    "hbs",
    hbs({
        extname: ".hbs",
        partialsDir: "views/partials",
        defaultLayout: "main.hbs",
        helpers: {
            ifE: function (x, y, options) {
                if (x === y) {
                    return options.fn(this);
                }
                return options.inverse(this);
            },
        },
    })
);
app.set("view engine", "hbs");

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT);
});
