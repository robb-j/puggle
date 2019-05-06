### Using the cli

```bash
npm i -g puggle puggle-generator-robbj-nodejs

# maybe: user namespaced generators??
npm i -g @robb_j/puggle-generator-nodejs
```

CLI usage output

```
usage: puggle [options] [cmd]

options:
  -g --generator <generator>

sub-commands:
  init [path]   - Create a new project
  update [path] - Update an existing project
```

The default command (without a `cmd`) can ask for a path
and determine whether to init / update based on a `puggle.json` presence

A sample `init` run through:

> Looking for all puggle-generator-* packages available on the system

```
path: ____  (if not passed to the CLI)

Pick a generator
* robb-j:node
> robb-j:node-cli
> robb-j:node-npm
> robb-j:ts-node
> robb-j:ts-node-cli
> robb-j:ts-node-npm
> robb-j:vue

project name: ____

package name: ____
package description: ____
package repository: ____
```

A sample `update` run through:

```
path: ____  (if not passed to the CLI)

puggle.json found
3 updates are available:
- 0.1.0 > 1.0.0 – puggle-generator-robbj-node
- 0.1.0 > 1.0.0 – puggle-plugin-docker
- 0.1.0 > 1.0.0 – puggle-plugin-prettier

1 plugin was removed:
- puggle-plugin-mocha (0.4.2)

1 plugin was added:
- puggle-plugin-jest (1.0.0)

Continue: (Y/n)

There are 5 redundant files:
- mocha.opts
- 

```
