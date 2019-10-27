import { App } from 'app'
import './styles.scss'

if (module.hot) {
    console.log('HMR updated')
    module.hot.accept()
}

App()
