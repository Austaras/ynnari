export async function App() {
    await Promise.resolve()
    console.log(123)
}

class B {
    public b = 1
}

console.log(new B())
