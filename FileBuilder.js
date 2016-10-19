(function (window) {

    var utils = {
        showWarning: function (message) {
            console.warn(message);
        },
        showError: function (message) {
            console.error(message);
        },
        isString: function (item) {
            return (typeof item === 'string');
        },
        isArray: function (item) {
            if ((Array.isArray && Array.isArray(item)) || (Object.prototype.toString.call(item) == '[object Array]')) {
                return true;
            };
            return false;
        },
        isObject: function (item) {
            return (Object.prototype.toString.call(item) == '[object Object]');
        },
        isFunction: function (item) {
            return (typeof item === 'function');
        },
        parseExtension: function (extension) {
            if (!extension && !utils.isString(extension)) {
                this.config.showError.call(this, 'Extension must be a valid extension string. Default extension "txt" will be used.');
                return false;
            };

            var extArray = extension.split('.');

            extension = extArray[extArray.length - 1];

            if (extArray.length > 1) {
                if (this._fileHandlers[extension]) {
                    this.config.showError.call(this, 'Multiple extension is not supported. "' + extension + '" will be used.');
                }
                else {
                    this.config.showError.call(this, 'Invalid extension or FileBuilder does not support "' + extension + '" extension. Default extension "txt" will be used.');
                    return false;
                };
            };

            return extension;
        },

        // Helper Method to extend first order properties of objects.
        extend: function () {
            var newObject = {};
            for (var idx in arguments) {
                for (var objName in arguments[idx]) {
                    newObject[objName] = arguments[idx][objName];
                };
            };

            return newObject;
        }
    };

    var getDefaultConfig = function () {
        return {
            showWarning: utils.showWarning,
            showError: utils.showError,
            fileName: 'Export',
            fileExtension: 'txt',
            fileHandlerPlugins: null
        };
    };

    var FileBuilder = function (options) {
        var me = this;
        me.config = utils.extend(getDefaultConfig(), options || {});
        me.fileContentString = '';

        // Register if any new file handler plugins.
        if (me.config.fileHandlerPlugins) {
            me._registerNewPlugins(me.config.fileHandlerPlugins);
        };

        me.config.fileExtension = utils.parseExtension.call(me, me.config.fileExtension) || 'txt';

        me._loadHandlers();
    };

    FileBuilder.prototype.downloadFile = function () {
        var elem = document.createElement('a'),
            blob = new Blob([this.fileContentString], { type: 'application/octet-stream' }),
            config = this.config,
            fileName = (config.fileName || 'NoName') + '.' + config.fileExtension;

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
            'data:attachment/file;charset=utf-8,' + encodeURIComponent(this.fileContentString) :
            // for other browsers
            window.URL.createObjectURL(blob);

        elem.download = fileName;
        document.body.appendChild(elem);
        elem.click();
        elem.remove();
    };

    FileBuilder.prototype._loadHandlers = function () {
        var me = this,
            handlers = me._fileHandlers[me.config.fileExtension];

        for (var item in handlers) {
            if (handlers.hasOwnProperty(item) && utils.isFunction(handlers[item])) {
                me[item] = handlers[item];
            };
        };
    };

    FileBuilder.prototype._registerNewPlugins = function (plugins) {
        var me = this;
        if (utils.isArray(plugins)) {
            plugins.forEach(function (item) {
                if (!item.name && !utils.isString(item.name)) {
                    me.config.showError.call(me, 'Plugin name is required. Plugin object must consist of a "name" property.');
                }
                else {
                    me._fileHandlers[item.name] = plugins[item];
                };
            });
        }
        else if (utils.isObject(plugins)) {
            if (!plugins.name && !utils.isString(plugins.name)) {
                me.config.showError.call(me, 'Plugin name is required. Plugin object must consist of a "name" property.');
                return;
            };
            me._fileHandlers[plugins.name] = plugins;
        }
        else {
            me.config.showError.call(me, 'Invalid Plugin. Plugin must be a object or array of objects consisting of plugin methods.');
        };
    };

    FileBuilder.prototype._fileHandlers = {
        txt: {
            name: 'txt',
            appendText: function (text) {
                this.fileContentString = this.fileContentString + text + ' \n ';
            }
        }
    };

    window.FileBuilder = FileBuilder;

})(window);