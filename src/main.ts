import { app } from 'hyperapp'

import { actions, state, view } from './app/app'

console.log(123)

if (module.hot) {
    console.log('HMR updated')
    module.hot.accept()
}

app(state, actions, view, document.body)

class A {
    public foo = 'foo'
    get f() {
        return 1
    }
    public async test() {
        await 2
        console.log(2)
    }
}

const a = new A()
const { foo } = a
a.test()
console.log(foo)
console.log(1 ** 8)

const x = {
    x: 1
}

const y = { ...x }
console.log(Object.entries(y))
console.log(y)
