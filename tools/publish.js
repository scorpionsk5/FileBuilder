(function (require, process) {

    // Load required modules.
    var fs = require('fs'),
        minifyJs = require('minify'),
        pathJs = require('path'),

        // Source directory.
        dir = __dirname.replace(/\\/g, '/'),
        sourcePath = dir.replace('tools', ''),

        // Array of folder names which should not be published.
        foldersToIgnore = ['node_modules', 'build', '.git', 'tools'],

        // Array of file names which should not be published.
        filesToIgnore = ['publish.bat', '.gitattributes', '.gitignore', 'build.bat', 'package.json', 'README.md'],

        // Method to handle log messages.
        logger = function (msg) {
            console.log(msg);
        },

        // Method to check if directory exists alse it creates it.
        createDirectory = function (folderPath) {
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
                logger(folderPath + ' - directory created because it didn\'t exist in destination.');
            };
        },

        // Method to check if item at end of path is an directory.
        isDirectory = function (path) {
            return fs.statSync(path).isDirectory();
        },

        // Method to check if file is a javascript file.
        isJsFile = function (fileName) {
            return fileName.match(/\.js$/i);
        },

        // Method to loop through folders and publish files.
        processFolder = function (src, dest) {
            fs.readdir(src, function (err, items) { // Read items in source folder.
                if (err) {
                    logger(err.message);
                }
                else {
                    items.forEach(function (item) {// Loop through items in source folder.
                        var newDest = pathJs.join(dest, item),
                            newSrc = pathJs.join(src, item);

                        if (isDirectory(newSrc)) {
                            // Executes if item is a directory.
                            if (foldersToIgnore.indexOf(item) == -1) {
                                // Create folder if doesn't exist in destination folder.
                                createDirectory(newDest);
                                // Loop through the current folder.
                                processFolder(newSrc, newDest);
                            };
                        }
                        else {
                            // Executes if item is a file.
                            processFile(newSrc, newDest, item);
                        };
                    });
                };
            });
        },

        // Method to copy files to destination directory. JavaScript files are minified before copying.
        processFile = function (src, dest, item) {
            if (isJsFile(item)) {
                // If JavaScript file then minify before copying.
                minifyJs(src, function (error, data) {
                    if (error) {
                        logger(error.message);
                    }
                    else {
                        // Write minified code into destination file.
                        fs.writeFile(dest, data, function (err, fileRef) {
                            if (err) {
                                logger(err.message);
                            }
                            else {
                                logger(src + ' - file minified and published.');
                            };
                        });
                    };
                });
            }
            else {
                // Copy non JavaScript files to destination.
                (filesToIgnore.indexOf(item) == -1) && (fs.createReadStream(src).pipe(fs.createWriteStream(dest)), logger(src + ' - file published.'));
            };
        },

        // Method to start publish process.
        startPublish = function (destinationPath) {
            processFolder(sourcePath, destinationPath);
        };

    // Publish process is initiated from here.
    try {
        var destinationPath = process.argv[2] ? process.argv[2].replace('"', '') : dir.replace('tools', 'build');

        // Initialize destination directory.
        createDirectory(destinationPath);

        // Start publishing.
        startPublish(destinationPath);
    }
    catch (err) {
        logger(err.message);
    };

})(require, process);