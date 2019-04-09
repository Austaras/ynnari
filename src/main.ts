import app from './app/app'

console.log(app)

declare const module: any

if (module.hot) {
    module.hot.accept()
}
