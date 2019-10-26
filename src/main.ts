if (module.hot) {
    console.log('HMR updated')
    module.hot.accept()
}

const a = {
    x: 1,
    y: 2
}

const { x, ...rest } = a
console.log(rest)
