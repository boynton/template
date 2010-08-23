var fs = require('fs');

function template(src) {
    var parts = src.split(/\[|\]/);
    var fnBody = "var p=[];with(_TEMPLATE_INCLUDES){with(_TEMPLATE_DATA){";
    var templates = {};
    for (var ii = parts.length, i = 0; i < ii; i++) {
        if (i % 2) {
            var opargs = parts[i].split(' ');
            switch (opargs[0]) {
            case '-':
                break;
            case 'include':
                var name = "_TEMPLATE_INCLUDE_" + opargs[1];
                if (!templates[name])
                    templates[name] = templateFromFile(opargs[1] + ".tmpl");
                fnBody += "p.push(" + name + "(_TEMPLATE_DATA));";
                break;
            case 'ifdef':
                fnBody += "if (_TEMPLATE_DATA['" + opargs[1] + "']) {\n";
                break;
            case 'else':
                fnBody += "}else{";
                break;
            case '/ifdef':
                fnBody += "}\n";
                break;
            case 'ifndef':
                fnBody += "if (!_TEMPLATE_DATA['" + opargs[1] + "']) {\n";
                break;
            case '/ifndef':
                fnBody += "}\n";
                break;
            case 'for':
                fnBody += opargs[3] + ".forEach(function(" + opargs[1] + "){\n";
                break;
            case '/for':
                fnBody += "});\n";
                break;
            default:
                var path = parts[i].split('.');
                var data = opargs[0];
                var filterBegin = "", filterEnd = "";
                console.log("data = " + data + ", opargs[1] = " + opargs[1]);
                if (opargs.length > 1) {
                    switch (opargs[1]) {
                    case 'json':
                        filterBegin = "JSON.stringify(";
                        filterEnd = ",2)";
                        break;
                    default:
                        console.log("Unknown format: " + opargs[1]);
                        break;
                    }
                }
                if (path.length == 1) {
                    fnBody += "p.push("+filterBegin+"_TEMPLATE_DATA['" + data + "']"+filterEnd+");\n";
                } else {
                    fnBody += "try{p.push("+filterBegin+data+filterEnd+");}catch(err){}\n";
                }
                break;
            }
        } else {
            fnBody += "p.push('" + cleanString(parts[i]) + "');\n";
        }
    }
    fnBody += "    }}return p.join('');\n";
    var args = [];
    for (tmplName in templates)
        args.push(tmplName);
    var fn = new Function("_TEMPLATE_DATA", "_TEMPLATE_INCLUDES", fnBody);
    return function(obj) {        
        return fn(obj, templates);
    }
}

function cleanString(s) {
    return s.replace(/\n/g, '\\n').replace(/'/g, "\\'");
}


//-- node.js stuff
function templateFromFile(filename) {
    var src = fs.readFileSync(filename).toString();
    return template(src);
}

//-- exports

exports.create = template;
exports.fromFile = templateFromFile;

