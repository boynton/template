var template = require("template");

var dat = {
    title: "The Title",
    foo: {
        author: "Lee"
    },
    error: "Cannot solve world hunger.",
    list: [
        {href: "/href/1", text: "One"},
        {href: "/href/2", text: "Two"},
        {href: "/href/3", text: "Three"},
    ]
}

function cleanString(s) {
    return s.replace(/\n/g, '\\n').replace(/'/g, "\\'");
}

//var tmp = template.fromFile('ex1.tmpl', ['.','..'], true);
//var tmp = template.fromFile('ex1.tmpl', ['.','..']);
var tmp = template.fromFile('ex1.tmpl');
console.log("tmp = " + tmp);
console.log(tmp(dat));
