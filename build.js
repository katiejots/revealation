var fs = require('fs');
var path = require('path');
var sizeOf = require('image-size');
var PDFDocument = require('pdfkit');

module.exports = function (targetDir, filename, format, callback) {
    console.log("Rendering PDF");
    fs.readdir(targetDir, function (err, files) { 
        if (err) {
            return callback(err);
        } 
       
        var doc, stream, width, height;
        for (var i = 0; i < files.length; i++) { 
            var file = files[i];
            if (path.extname(file) === '.' + format) {
                var filepath = targetDir + '/' + file;
                if (!doc) {
                    var res = sizeOf(filepath);
                    var dpi = 300;
                    width = calcPdfPoints(res.width || 960, dpi);  
                    height = calcPdfPoints(res.height || 700, dpi);  
                    doc = new PDFDocument({layout: 'landscape', margin: 0, size: [height, width]});
                    stream = fs.createWriteStream(targetDir + '/' + filename + '.pdf');
                    doc.pipe(stream);
                } else {
                    doc.addPage();
                }
                doc.image(filepath, 0, 0, {fit: [width, height]});
            } 
        }
        if (doc) {
            callback(null);
            doc.end();
        } else {
            callback(new Error('Build error'));
        }
    });
}

var calcPdfPoints = function(res, dpi) {
    return res / dpi * 72;
}
