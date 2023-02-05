# Versions

Here's a version string of Simpler Canvas:

`smp:canvas/app@0.5.0-a`

How to interpret it?

To answer that question, let's take the string apart.

`smp`:`canvas`/`app`@`0.5.0`-`a`

## Author

The `smp` at the beginning of the string stands for the autor of the application. In this case, it is _smp_, which is short for _Simpler_.

## Application Name

The second part represents the name of the application. Here, it's _Canvas_ or _Simpler Canvas_.

## Part Name

Following is the name of the part the version string belongs to.

A data object e. g. can have a different version than the main application, because the app not just updates, if data handling gets changed. For such uses, a part name is provided.

In our example, it would be _app_, so the version string is the actual application's version.

## Version

After that comes the version. It is the unique identifyer here. If we would want to, we could even further split the string by splitting the version at the dots.

`0`.`5`.`0`

Here's what the numbers mean (in order):

1. Major version - gets increased if e. g. a feature update got released
2. Minor version - gets updated after minor changes
3. Patch version - gets updated after a bug got patched

## State

The final bit is not always provided. That's because it indicates the part version's state. Here's a list of states:

### `-a` or `-alpha`

Indicates that the part is still in alpha.

### `-b` or `-beta`

Indicates that the part is in beta.

### _\*nothing\*_

If nothing can be found, it means that the part is in final state. It means that a version is finished and will, other than patches, receive no changes to that version.
