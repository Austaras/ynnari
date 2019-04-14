import { h } from 'hyperapp'

console.log(1)

type state = typeof state
type actions = typeof actions

export const state = {
    count: 0
}

export const actions = {
    down: (value: number) => (state: state) => ({ count: state.count - value }),
    up: (value: number) => (state: state) => ({ count: state.count + value })
}

export const view = (state: state, actions: actions) =>
    <div>
        <h1>{state.count}</h1>
        <button onclick={() => actions.down(1)}>-</button>
        <button onclick={() => actions.up(1)}>+</button>
    </div>
