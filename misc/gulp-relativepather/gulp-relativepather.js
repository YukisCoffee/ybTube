// gulp version
const through = require("through2");
const PluginError = require("plugin-error");
const relativepather = require("./relativepather");

module.exports = plugin;

function plugin(options = {})
{
    return through.obj(function setup(file, encoding, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit("error", new PluginError("gulp-relativepather", "Streaming not supported"));
            return cb();
        }

        var root = file.path.split(file.base)[0] + file.base;

        if (null == options.projectRoot)
        {
            options.projectRoot = root;
        }

        options.filePath = file.path;

        // Convert file contents to a string to work with.
        var contents = file.contents.toString();

        // Run everything through relativepather
        try
        {
            contents = relativepather(contents, options);
        }
        catch (e)
        {
            this.emit("error", e);
        }

        // Reconvert to a Buffer and push
        file.contents = Buffer.from(contents, "utf-8");
        this.push(file);

        cb();
    });
}