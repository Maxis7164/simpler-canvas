# Simpler Canvas

Simpler Canvas is an HTML Canvas wrapper that allows you to use the build-in &lt;canvas> element more easily. It also serves as a browser whiteboard and has (almost) all nessesary tools needed to use it for such usecases.

[matrix-inverse](https://github.com/metabolize/matrix-inverse) is used for calculating matrix inverses when needed. It is not included via NodeJS but rather bundled with the source code. The included copy was modified to use ESModule exports instead of CommonJS.

## Getting Started

1. Download the dist folder
2. include the folder in your project files

```ts
import { Canvas } from "[PATH_TO_FILE]/index";

const cv = new Canvas();
```

If more documentation is needed, check out the `docs` folder.
