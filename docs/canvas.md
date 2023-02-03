# Using the Canvas

The `Canvas` is the main thing of this library, so it's a good thing to know how it works.

To get started, you first need to have a canvas element inside the documents body, e. g. like this:

```html
<html>
  <head>
    <!-- any head-related tags; skipped -->
  </head>
  <body>
    <canvas id="cv" />
  </body>
</html>
```

Important to mention is, that we gave the canvas something like an id or a class, so that we can differentiate between canvas', if you may need another one later on. Also, that id will come in handy next.

Next, we have to import the `Canvas` class into our script and instantiate it, but how and with what arguments?

The class first takes the parent element as an argument. This can either be the actual `HTMLElement` or, and here comes the id into play, you can input a string which ressembles a CSS Selector. The second argument is optional, so we will skip it for now.

Now, when you look at your website... nothing has changed... is what you may think, because the canvas' background color defaults to `#ffffff` (white), so it is indifferential for now. Changing the background color involves the second argument, which is an object of type `Partial<CanvasOpts>`.

So, our final code inside our script should look something like this:

```ts
import { Canvas } from "simpler-canvas";

const cv = new Canvas("canvas#cv", { background: "#aaaaaa" });
```
