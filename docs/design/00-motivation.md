# Motivation

## What is puggle for?

I make small packages which all have common configuration, usually based on my two template repos:
[robb-j/node-base](https://github.com/robb-j/node-base/)
or [robb-j/ts-node-base](https://github.com/robb-j/ts-node-base/).
I'm also constantly changing or updating the meta tools the projects use, like `prettier`, `eslint` or `jest`.
The tools are updated in the template repo but I have to manually apply these changes to each project I work on.

I want a way of updating this "meta layer" of a project automatically.
This is important when I come back to an older project with a new change or feature,
I don't want to have to remember how that project was configured or spend time updating it to the latest standard.

## What's the plan?

I want to create a virtual filesystem which could be used to bootstrap a project and enable automatic project upgrades.
So I don't have to keep updating the some config files over and over again.

### Principles

- It should be framework and language agnostic, with implementations built ontop of a common base
- It should be compose-able through plugins or generators
- It should allow project upgrades to avoid updating project configs over and over again.
