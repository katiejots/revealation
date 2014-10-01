var fs = require('fs');
var path = require('path');
var sizeOf = require('image-size');
var PDFDocument = require('pdfkit');

var dpi = 300;

module.exports = function (targetDir, filename, format, callback) {
    console.log("Rendering PDF");
    fs.readdir(targetDir, function (err, files) {
        if (err) {
            return callback(err);
        }

        var doc, stream, width, height;
        files.forEach(function(file){
            if (path.extname(file) === '.' + format) {
                var filepath = targetDir + '/' + file;

                if (!doc) {
                    var res = sizeOf(filepath);
                    width = calcPdfPoints(res.width || 960, dpi);
                    height = calcPdfPoints(res.height || 700, dpi);
                    doc = new PDFDocument({layout: 'landscape', margin: 0, size: [height, width]});
                    stream = fs.createWriteStream(targetDir + '/' + filename + '.pdf');
                    doc.pipe(stream);

                    doc.on('error', function(err){
                      throw err;
                    })
                } else {
                  doc.addPage();
                }

                doc.image(filepath, 0, 0, {fit: [width, height]});
            }
        });

        doc.end();
        callback();
    });
};

var calcPdfPoints = function(res, dpi) {
    return res / dpi * 72;
};
