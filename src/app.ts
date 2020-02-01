function Bar(ctor: any) {
    return ctor
}

@Bar
class Foo {
    public t = 1
}

export async function App(): Promise<void> {
    await Promise.resolve()
    console.log(new Foo())
}
