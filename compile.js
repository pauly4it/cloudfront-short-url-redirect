'use strict';

const fs = require('fs');
const handlebars = require('handlebars');

const configJson = require('./config.json');

function compileTemplate(templateFile, config) {
    handlebars.registerHelper('object', function (links) {
        return JSON.stringify(links);
    });

    let template = handlebars.compile(templateFile);
    return template(config);
}

fs.readFile('./function/url-forward.handlebars', function (err, data) {
    if (err) {
        console.log('Error reading file');
        return err;
    }

    let compiledFunction = compileTemplate(data.toString(), configJson);
    
    try {
        fs.writeFileSync('./dist/url-forward-build.js', compiledFunction);
    } catch (err) {
        console.log('Error writing file');
        return err;
    }

    console.log('Successfully wrote function to file');
    return;
});
