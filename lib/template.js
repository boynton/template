var fs = require('fs');

function template(src) {
    var parts = src.split(/\[|\]/);
    var fnBody = "var p=[],s=[];function g(d,k){var p=k.split('.');for(k in p){if(!d[p[k]])return null;d=d[p[k]];}return d;};with(_I){with(_D){";
    var templates = {};
    function dataRef(data) {
        if (data == "*")
            return "_D";
        else
            return "g(_D,'"+data+"')";
    }
    for (var ii = parts.length, i = 0; i < ii; i++) {
        if (i % 2) {
            var opargs = parts[i].split(' ');
            switch (opargs[0]) {
            case '-':
                break;
            case 'include':
                var name = opargs[1];
                if (!templates[name])
                    templates[name] = templateFromFile(opargs[1]);
                fnBody += "p.push((_I['" + name + "'])(_D));\n";
                break;
            case 'define':
                fnBody += "s.push(p);s.push('"+opargs[1]+"');p=[];";
                break;
            case '/define':
                fnBody += "_D[s.pop()]=p.join('');p=s.pop();";
                break;
            case 'ifdef':
                fnBody += "if ("+dataRef(opargs[1])+"){ /* if */\n";
                break;
            case 'else':
                fnBody += "}else{\n";
                break;
            case '/ifdef':
                fnBody += "} /* /if */\n";
                break;
            case 'for':
                fnBody += dataRef(opargs[3]) + ".forEach(function(" + opargs[1] + "){ /* for */\n";
                break;
            case '/for':
                fnBody += "});/* /for */\n";
                break;
            default:
                var filterBegin = "", filterEnd = "";
                if (opargs.length > 1) {
                    switch (opargs[1]) {
                    case 'json':
                        filterBegin = "JSON.stringify(";
                        filterEnd = ",2)";
                        break;
                    default:
                        console.log("***Unknown format: " + opargs[1]+"***");
                        break;
                    }
                }
                fnBody += "p.push("+filterBegin+dataRef(opargs[0])+filterEnd+"); /* var */\n";
                //fnBody += "p.push("+dataRef(opargs[0])+"); /* var */\n";
                break;
            }
        } else {
            var s = parts[i];
            if (s != '\n' && s != '') {
                s = cleanString(parts[i]);            
                fnBody += "p.push('" + s + "'); /* literal */\n";
            }
        }
    }
    fnBody += "    }}return p.join('');\n";
    var args = [];
    for (tmplName in templates)
        args.push(tmplName);
    var fn = new Function("_D", "_I", fnBody);
    return function(obj) {        
        return fn(obj, templates);
    }
}


var tmplPath = ["."];

function templateFromFile(filename) {
    //this function should be improved
    for (var i in tmplPath) {		
        var dir = tmplPath[i];
        var f = dir + "/" + filename;
        try {
            var src = fs.readFileSync(f).toString(); //yuck
            return template(src);
        } catch (e) {
        }
    }
    return null;
}

function setTemplatePath(path) {
	tmplPath = path;
}

function cleanString(s) {
    return s.replace(/\n/g, '\\n').replace(/'/g, "\\'");
}


//-- exports

exports.create = template;
exports.fromFile = templateFromFile;
exports.setFilePath = setTemplatePath;
