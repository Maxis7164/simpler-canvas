# Getting Started

To get started with Simpler Canvas, you first have to decide between two options to use it:

## 1. CDN Link

You can use the following HTML tag inside your index.html file to fetch Simpler Canvas. It will be available under `scv` inside the `window` object.

```html
<script src="[CDN LINK]"></script>
```

Now, you can test if everything worked out as intended by using the following code:

```html
<body>
  <canvas id="cv" />
  <script>
    const cv = new scv.Canvas("#cv", { background: "#2299bb" });
  </script>
</body>
```

If there's a blue-tealish box, it has worked!

## 2. NPM

You can install Simpler Canvas as an NPM dependency. To do that, enter the following command inside the root folder of your project:

```bash
npm install simpler-canvas
```

To use Simpler Canvas, you can import it into a module script.

Testing if everything worked out could look like this:

```html
<head>
  <script src="index.js"></script>
  <!-- *Stripped* -->
</head>
<body>
  <div id="cv-parent"></div>
</body>
```

```js
import { Canvas } from "simpler-canvas";

const cv = new Canvas("div#cv-parent", { background: "#2299bb" });
```

If there's a blue-tealish box, it has worked!

## TypeScript

Simpler Canvas was written using TypeScript, so naturally there is TypeScript support embedded. If you're struggling with any types or don't recognize them, you can check the `References`. Every type defined in Simpler Canvas can be found inside the references.
