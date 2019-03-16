var path = require('path');
var _root = path.resolve(__dirname, '..');
function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [_root].concat(args));
}

function sortChunk(packages) {
    return function sort(a, b) {
        if (packages.indexOf(a.names[0]) > packages.indexOf(b.names[0])) {
            return 1;
        }
        if (packages.indexOf(a.names[0]) < packages.indexOf(b.names[0])) {
            return -1;
        }
        return 0;
    }
}

exports.root = root;
exports.sortChunk = sortChunk;