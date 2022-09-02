# @modern-js/inspector-webpack-plugin

## 1.0.3

### Patch Changes

- Use tsup to bundle package, including all dependencies.

## 1.0.2

### Patch Changes

- Expose plugin options type.

## 1.0.1

### Patch Changes

- Replace koa server with native http server
- Support incremental port binding

## 1.0.0

### Major Changes

- All modules and intermediate compilation results passed by the loaders.
- The time consuming of all loaders and the number of files they compile.
- Module dependency graph structure visualization.(Think of performance, the function will be closed when the number of modules is greater than 100).
- View the final config of webpack.
- View the webpack output chunk.
