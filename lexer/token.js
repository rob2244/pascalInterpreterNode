export default class Token {
    constructor(type, value) {
        this.type = type
        this.value = value
    }

    toString() {
        return `Type: ${this.type} Value: ${this.value}`
    }
}