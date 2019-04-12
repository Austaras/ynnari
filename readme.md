My boilerplate for frontend development

This is intended for SPAs, but may also work for other projects. It often happen to be  production-ready, but not guaranteed to be

Using Typescript, TSLint, SCSS, Webpack and yarn

TODO:
- use stable version of html-webpack-plugin
- use eslint instead of tslint, blocked by [issue](https://github.com/Realytics/fork-ts-checker-webpack-plugin/issues/203)
- use incoming webpack 5
- consider usage of babel
- consider usage of thread-loader & cache-loader
- consider PWA support
- consider separation of dev and prod mode of webpack config
- consider usage of  [plugin](https://github.com/DanielSchaffer/webpack-babel-multi-target-plugin)
- consider optimization for http/2
- add test support
- CSS sourcemap not work in Firefox due to [bug](https://github.com/mozilla/source-map/issues/275)

what currently cannot be done:
- dead code elimination in dynamic import
