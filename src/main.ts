import { foo } from 'app'

if (module.hot) {
    console.log('HMR updated')
    module.hot.accept()
}

foo()
