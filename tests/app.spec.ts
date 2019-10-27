import { foo } from '../src/app'

describe('app', () => {
    it('should work normaly', () => {
        expect(foo).not.toThrow()
    })
})
