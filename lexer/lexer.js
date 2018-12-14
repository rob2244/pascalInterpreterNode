import * as types from './token-types'
import Token from './token'

const keywords = {
    BEGIN: new Token(types.BEGIN, 'BEGIN'),
    END: new Token(types.END, 'END'),
    VAR: new Token(types.VAR, 'VAR'),
    PROGRAM: new Token(types.PROGRAM, 'PROGRAM'),
    DIV: new Token(types.INTEGER_DIV, 'DIV'),
    REAL: new Token(types.REAL, 'REAL'),
    INTEGER: new Token(types.INTEGER, 'INTEGER'),
    PROCEDURE: new Token(types.PROCEDURE, 'PROCEDURE')
}

export default class Lexer {
    constructor(text) {
        this.text = text.replace(/\s+/g, ' ').trim()
        this.pos = 0
    }

    get currentChar() {
        if (this.pos > this.text.length - 1)
            return undefined

        return this.text.charAt(this.pos)
    }

    getNextToken() {
        while (this.currentChar) {
            if (this.isWhiteSpace()) {
                this.skipWhitespace()
            }

            if (this.isComment(this.currentChar)) {
                this.skipComments()
                continue
            }


            if (!isNaN(this.currentChar))
                return this.number()

            if (this.isLetter(this.currentChar))
                return this.id()

            if (this.currentChar === '+') {
                this.advance()
                return new Token(types.PLUS, '+')
            }

            if (this.currentChar === '-') {
                this.advance()
                return new Token(types.MINUS, '-')
            }


            if (this.currentChar === '*') {
                this.advance()
                return new Token(types.MUL, '*')
            }

            if (this.currentChar === '/') {
                this.advance()
                return new Token(types.FLOAT_DIV, '/')
            }


            if (this.currentChar === ':' && this.peek() === '=') {
                this.advance()
                this.advance()
                return new Token(types.ASSIGN, ':=')
            }


            if (this.currentChar === ':') {
                this.advance()
                return new Token(types.COLON, ':')
            }


            if (this.currentChar === ';') {
                this.advance()
                return new Token(types.SEMI, ';')
            }


            if (this.currentChar === '.') {
                this.advance()
                return new Token(types.DOT, '.')
            }

            if (this.currentChar === ',') {
                this.advance()
                return new Token(types.COMMA, ',')
            }

            if (this.currentChar === '(') {
                this.advance()
                return new Token(types.LPAREN, '(')
            }

            if (this.currentChar === ')') {
                this.advance()
                return new Token(types.RPAREN, ')')
            }

            throw Error(`Unrecognized Character ${this.currentChar}`)
        }

        return new Token(types.EOF, 'EOF')
    }

    isWhiteSpace() {
        return this.currentChar === ' ' ||
            this.currentChar === '\r\n' ||
            this.currentChar === '\n' ||
            this.currentChar === '\r'
    }

    skipWhitespace() {
        while (this.currentChar === ' ' || this.currentChar === '\r\n' ||
            this.currentChar === '\n' || this.currentChar === '\r')
            this.advance()
    }

    isComment(char) {
        return char === '{'
    }

    skipComments() {
        while (this.currentChar !== '}')
            this.advance()

        this.advance()
    }

    id() {
        let result = ''

        while (this.currentChar &&
            this.isAlphaNumeric(this.currentChar) ||
            this.currentChar === '_') {
            result += this.currentChar
            this.advance()
        }
        const key = result.toUpperCase()

        if (keywords.hasOwnProperty(key))
            return keywords[key]

        return new Token(types.ID, result)
    }

    number() {
        let result = ''

        while (!isNaN(this.currentChar)) {
            result += this.currentChar
            this.advance()
        }

        if (this.currentChar === '.') {
            result += '.'
            this.advance()

            while (!isNaN(this.currentChar)) {
                result += this.currentChar
                this.advance()
            }

            const num = parseFloat(result)
            return new Token(types.REAL_CONST, num)
        }

        const num = parseInt(result)
        return new Token(types.INTEGER_CONST, num)
    }

    isLetter(char) {
        return char.toLowerCase() !== char.toUpperCase()
    }

    isAlphaNumeric(char) {
        return (this.isLetter(char) || !isNaN(char)) && char !== ' '
    }

    advance() {
        this.pos++
    }

    peek() {
        const next = this.pos + 1

        if (next > this.text.length - 1)
            return undefined

        return this.text.charAt(next)
    }

}