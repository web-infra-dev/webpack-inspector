# Webpack Inspector

## Introduction

Webpack dev tools to make performance analysis, error investigation and loader development more convenient. Provide the following functions:

1. All modules and intermediate compilation results passed by the loaders.

![devtool-0.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4deb18a92b8245caa1eeba9c0843db71~tplv-k3u1fbpfcp-watermark.image?)

![devtool-1.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8f994016e3e4a22be5339c43a0817fc~tplv-k3u1fbpfcp-watermark.image?)

2. The time consuming of all loaders and the number of files they compile.

![devtool-3.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a617af7a430d4100ab177bb2da614b1c~tplv-k3u1fbpfcp-watermark.image?)

3. Module dependency graph structure visualization.(Think of performance, the function will be closed when the number of modules is greater than 100)

![devtool-4.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52c85f669cf843d1901868363cf04843~tplv-k3u1fbpfcp-watermark.image?)

4. View the final config of webpack.

![devtool-5.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/328cfdff36034cd1bbf1e14c40a30772~tplv-k3u1fbpfcp-watermark.image?)

5. View the webpack output chunk.
![devtool-6.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/000a454c179d451fb8156ae8f9bcc434~tplv-k3u1fbpfcp-watermark.image?)
## Usage

### 1. Install

```bash
pnpm install @modern-js/inspector-webpack-plugin -D
```

### 2. Use in webpack

```ts
// webpack.config.ts
import { InspectorWebpackPlugin } from '@modern-js/inspector-webpack-plugin'

// Add plugin
export default {
  plugins: [new InspectorWebpackPlugin()]
}
```

### 3. Custom Options

```ts
export default {
  plugins: [new InspectorWebpackPlugin({
    // Custom the port of devtool page, which is 3333 by default.
    port: 3456,
    // Config the module that need to be ignored, ignore will not work by default.
    ignorePattern: /node_modules/
  })]
}
```

## Credits

The UI interface implementation of inspector is modified from existing project [`vite-plugin-inspect`](https://github.com/antfu/vite-plugin-inspect).At the same time, webpack loader in the inspect got inspired by [`speed-measure-webpack-plugin`](https://github.com/stephencookdev/speed-measure-webpack-plugin).Thanks for them.
