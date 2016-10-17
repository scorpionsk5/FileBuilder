(function (window) {

    var fileHandler = {
        rtf: function (fileContents) {
            return new Blob([fileContent], { type: 'application/octet-stream' });
        }
    };

    return Object.create({
        saveFile: function (fileContent, fileName, fileExtension) {
            var elem = document.createElement('a');

            fileExtension = fileExtension || '.rtf';
            fileName = (fileName || 'NoName') + fileExtension;

            if (window.navigator.msSaveBlob) {
                // for IE
                window.navigator.msSaveBlob(blob, fileName);
                return;
            }
            //else if (/constructor/i.test(window.HTMLElement)) {   // to download in safari
            //    var reader = new FileReader();
            //    reader.onloadend = function () {
            //    };
            //    reader.readAsDataURL(blob);
            //}
            elem.href = /constructor/i.test(window.HTMLElement) ?
                // for Safari       //data:application/octet-stream;base64,charset=utf-8,
                'data:attachment/file;charset=utf-8,' + encodeURIComponent(fileContent) :
                // for other browsers
                window.URL.createObjectURL(blob);

            elem.download = fileName;
            document.body.appendChild(elem);
            elem.click();
            elem.remove();
        }
    });
})(window)