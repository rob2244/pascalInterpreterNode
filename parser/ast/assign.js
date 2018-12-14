export default class Assign {
    constructor(left, token, right) {
        this.left = left
        this.op = token.value
        this.right = right
    }
}