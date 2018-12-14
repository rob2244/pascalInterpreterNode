export default class BinOp {
    constructor(left, token, right) {
        this.left = left
        this.token = token
        this.op = token.value
        this.right = right
    }
}