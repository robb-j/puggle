#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const VNode_1 = require("./VNode");
const file = __importStar(require("./file"));
const prompts_1 = __importDefault(require("prompts"));
function lastDirectory(path) {
    let parts = path.split('/');
    return parts[parts.length - 1] || '/';
}
const message = `
This utility walks you through the creation of a puggle (${process.env.npm_package_version}) project.

Usage:
  puggle [path]

It will initialize a new project in the current directory.

Press ^C at any time to quit.
`;
(async () => {
    try {
        //
        // Say hello to the nice user
        //
        console.log(message.trim());
        const promptOpts = {
            onCancel: () => process.exit(1)
        };
        let path = process.argv[2] || '.';
        //
        // Confirm they really want to use the current directory
        // Give the user the option to change it
        //
        if (path === '.') {
            let check = await prompts_1.default({
                type: 'confirm',
                name: 'confirmed',
                message: 'Initialize in the current directory?',
                initial: true
            }, promptOpts);
            if (!check.confirmed) {
                let { newPath } = await prompts_1.default({
                    type: 'text',
                    name: 'newPath',
                    message: 'Project path:'
                }, promptOpts);
                path = newPath;
            }
        }
        const initialName = lastDirectory(path === '.' ? process.cwd() : path);
        //
        // Ask for the project's name, repo & author
        // With some robb-j defaults (for now)
        //
        let { name, repository, author } = await prompts_1.default([
            {
                type: 'text',
                name: 'name',
                message: 'package name',
                initial: initialName
            },
            {
                type: 'text',
                name: 'repository',
                message: 'git repository',
                initial: `robb-j/${initialName}`
            },
            {
                type: 'text',
                name: 'author',
                message: 'author',
                initial: 'Rob Anderson (https://r0b.io)'
            }
        ], promptOpts);
        const packageConf = { name, repository, author };
        //
        // Create our virtual file system, the project to be created
        //
        const tree = new VNode_1.VRoot([
            new VNode_1.VDir('src', [new VNode_1.VFile('index.js', file.indexJs('Geoff'))]),
            new VNode_1.VFile('.dockerignore', file.dockerignore()),
            new VNode_1.VFile('.editorconfig', file.editorconfig()),
            new VNode_1.VFile('.eslintrc.yml', file.eslintYml()),
            new VNode_1.VFile('.gitignore', file.gitignore()),
            new VNode_1.VFile('.prettierrc', file.prettierrcYml()),
            new VNode_1.VFile('Dockerfile', file.dockerfile()),
            new VNode_1.VPackageJson(packageConf, file.packageJson()),
            new VNode_1.VFile('README.md', file.readme()),
            new VNode_1.VFile('REGISTRY', file.registry())
        ]);
        //
        // Make the virtual file system into a real one
        //
        await tree.serialize(path_1.join(process.cwd(), path));
    }
    catch (error) {
        //
        // Catch and log any errors then exit the program
        //
        console.log(error);
        process.exit(1);
    }
})();
//# sourceMappingURL=cli.js.map