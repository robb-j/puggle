# Versioned plugins

Plugins could be responsible for their versions, then puggle can handle the rest.

```ts
class PrettierV1 extends Plugin {
  version = '0.1.0'
}

class PrettierV2 extends Plugin {
  version = '0.2.0'
}

export default new VersionedPlugin({
  '0.1.0': PrettierV1,
  '0.2.0': PrettierV2
})
```

Is there much that can be done with this?
Even if you could get a virtual fs diff, what would you do with it?

It could be for keeping track of the files that have been inserted by puggle,
then remove ones that are no longer needed?

> - Look up the version from `puggle.json`
> - Look up the new version
>   - Could use the package's latest
>   - Could use the highest semver compatible (no breaking changes)
> - Generate the virtual fs changes for both versions
> - Diff the virtual fs to see what was deleted

This could also be useful for a `--dry-run` flag.
