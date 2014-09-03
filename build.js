var fs = require('fs');
var path = require('path');
var PDFDocument = require('pdfkit');

module.exports = function (targetDir, filename, format, callback) {
    console.log("Rendering PDF");
    var doc = new PDFDocument({layout: 'landscape', size: 'A4'});
    var stream = fs.createWriteStream(targetDir + '/' + filename + '.pdf')
    doc.pipe(stream);
    fs.readdir(targetDir, function (err, files) { 
        if (err) {
            return callback(err);
        } 

        var first = true;
        for (var i = 0; i < files.length; i++) { 
            var file = files[i];
            if (path.extname(file) === '.' + format) {
                // PDF initialised with one page
                if (first) {
                    first = false;
                } else {
                    doc.addPage();
                }
                //TODO Fix rendering properties
                doc.image(targetDir + '/' + file, 0, 0);
            } 
        }
        callback(null);
        doc.end();
    });
}
