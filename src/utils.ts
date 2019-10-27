export function deepCopy<T>(o: T): T {
    if (Object.prototype.toString.call(o) === '[object Object]') {
        return Object.fromEntries(Object.entries(o).map(val => [val[0], deepCopy(val[1])]))
    }
    if (Array.isArray(o)) {
        return o.map((i: any) => deepCopy(i)) as any
    }
    return o
}
