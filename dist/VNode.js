"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const path_1 = require("path");
const yaml_1 = __importDefault(require("yaml"));
const lodash_get_1 = __importDefault(require("lodash.get"));
const lodash_set_1 = __importDefault(require("lodash.set"));
const readFile = util_1.promisify(fs_1.default.readFile);
const writeFile = util_1.promisify(fs_1.default.writeFile);
const mkdir = util_1.promisify(fs_1.default.mkdir);
exports.removeSurroundingSlashes = (input) => input.replace(/^\/+/, '').replace(/\/+$/, '');
var VNodeType;
(function (VNodeType) {
    VNodeType[VNodeType["file"] = 0] = "file";
    VNodeType[VNodeType["directory"] = 1] = "directory";
})(VNodeType = exports.VNodeType || (exports.VNodeType = {}));
// 
// The base class of virual filesystem nodes, doesn't do very much
// Other things extend this and add functionality
// 
class VNode {
    constructor(name) {
        this.name = exports.removeSurroundingSlashes(name);
        Object.defineProperty(this, 'parent', { enumerable: false, writable: true });
    }
    async serialize(path) { }
}
exports.VNode = VNode;
// 
// A virtual file
//
// Ideas:
// - The contents could be set based on the result of some template
// 
class VFile extends VNode {
    constructor(name, contents = '') {
        super(name);
        this.contents = contents;
    }
    serialize(path) {
        return writeFile(path_1.join(path, this.name), this.contents);
    }
}
exports.VFile = VFile;
// 
// A virtual directory to hold more virtual nodes
// 
class VDir extends VNode {
    constructor(name, children = new Array()) {
        super(name);
        this.children = new Array();
        this.children = children;
        for (let child of children)
            child.parent = this;
    }
    /** find a VNode under this directory using a path e.g. src/index.js */
    find(path) {
        let name;
        let rest;
        if (Array.isArray(path)) {
            ;
            [name, ...rest] = path;
        }
        else {
            ;
            [name, ...rest] = exports.removeSurroundingSlashes(path).split('/');
        }
        for (let child of this.children) {
            if (child.name !== name)
                continue;
            if (rest.length === 0)
                return child;
            return child instanceof VDir ? child.find(rest) : null;
        }
        return null;
    }
    async serialize(path) {
        const dir = path_1.join(path, this.name);
        await mkdir(dir, { recursive: true });
        await Promise.all(this.children.map(child => child.serialize(dir)));
    }
}
exports.VDir = VDir;
//
// A special virtual directory to be at the root of the virual file system
// 
class VRoot extends VDir {
    constructor(children = new Array()) {
        super('.', children);
    }
}
exports.VRoot = VRoot;
// 
// The supported types of config files
// 
var VConfigType;
(function (VConfigType) {
    VConfigType[VConfigType["json"] = 0] = "json";
    VConfigType[VConfigType["yaml"] = 1] = "yaml";
})(VConfigType = exports.VConfigType || (exports.VConfigType = {}));
// 
// A virtual config file, a file with some potentially updatable data
// 
// Ideas:
// - Provide merging / updating so plugins can alter configs if they want
// 
class VConfig extends VFile {
    constructor(name, type, contents) {
        super(name);
        this.type = type;
        this.contents = contents;
    }
    async serialize(path) {
        let data;
        switch (this.type) {
            case VConfigType.json:
                data = JSON.stringify(this.contents, null, 2);
                break;
            case VConfigType.yaml:
                data = yaml_1.default.stringify(this.contents);
                break;
        }
        return writeFile(path_1.join(path, this.name), data);
    }
    read(path) {
        return lodash_get_1.default(this.contents, path);
    }
    write(path, value) {
        return lodash_set_1.default(this.contents, path, value);
    }
}
exports.VConfig = VConfig;
// 
// A virtual package.json
// - Attempts to merge with an existing package.json (wip)
// 
// Ideas:
// - Some way of dynamically declaring (dev|prod|optional) dependancies
// 
class VPackageJson extends VConfig {
    constructor(config, contents = {}) {
        super('package.json', VConfigType.json, contents);
        this.config = config;
    }
    renderContents(existing) {
        let output = {};
        for (let property in this.contents) {
            output[property] =
                existing[property] === undefined &&
                    this.contents[property] !== undefined
                    ? this.contents[property]
                    : existing[property];
        }
        if (this.config.name && !output.name) {
            output.name = this.config.name;
        }
        if (this.config.repository && !output.repository) {
            output.repository = this.config.repository;
        }
        if (this.config.author && !output.author) {
            output.author = this.config.author;
        }
        return output;
    }
    async serialize(path) {
        const fullPath = path_1.join(path, this.name);
        // Load the existing package.json, ignoring if it wasn't found
        let existing;
        try {
            existing = JSON.parse(await readFile(fullPath, 'utf8'));
        }
        catch (error) {
            existing = {};
        }
        // Write the new package.json
        let data = JSON.stringify(this.renderContents(existing), null, 2);
        return writeFile(fullPath, data);
    }
}
exports.VPackageJson = VPackageJson;
//# sourceMappingURL=VNode.js.map