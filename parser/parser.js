import * as types from '../lexer/token-types'
import Program from './ast/program'
import Block from './ast/block'
import VarDecl from './ast/varDecl'
import Var from './ast/var'
import Compound from './ast/compound'
import Type from './ast/type'
import NoOp from './ast/noOp'
import Assign from './ast/assign'
import BinOp from './ast/binOp'
import UnaryOp from './ast/unaryOp'
import Num from './ast/num'
import ProcedureDecl from './ast/procedureDecl'
import Param from './ast/param'
import ProcCall from './ast/procCall'
import If from './ast/if'
import Conditional from './ast/conditional'
import Else from './ast/else'

export default class Parser {
    constructor(lexer) {
        this.lexer = lexer
        this.currentToken = this.lexer.getNextToken()
    }

    parse() {
        return this.program()
    }

    program() {
        this.eat(types.PROGRAM)
        const varDecl = this.variable()

        this.eat(types.SEMI)
        const block = this.block()

        this.eat(types.DOT)
        return new Program(varDecl.value, block)
    }

    block() {
        return new Block(this.declarations(), this.compoundStatement())
    }

    declarations() {
        const varDecls = []

        if (this.currentToken.type === types.VAR) {
            this.eat(types.VAR)

            while (this.currentToken.type === types.ID) {
                varDecls.push(...this.variableDeclaration())
                this.eat(types.SEMI)
            }
        }

        if (this.currentToken.type === types.PROCEDURE) {
            this.eat(types.PROCEDURE)
            const procName = this.currentToken.value
            this.eat(types.ID)

            let params = []

            if (this.currentToken.type === types.LPAREN) {
                this.eat(types.LPAREN)
                params = this.formalParameterList()
                this.eat(types.RPAREN)
            }
            this.eat(types.SEMI)

            const block = this.block()
            this.eat(types.SEMI)
            varDecls.push(new ProcedureDecl(procName, block, params))
        }

        return varDecls
    }

    formalParameterList() {
        const paramList = [...this.formalParameters()]

        if (this.currentToken.type === types.SEMI) {
            this.eat(types.SEMI)
            paramList.push(...this.formalParameters())
        }

        return paramList
    }

    formalParameters() {
        const varNodes = [new Var(this.currentToken)]
        this.eat(types.ID)

        while (this.currentToken.type === types.COMMA) {
            this.eat(types.COMMA)
            varNodes.push(new Var(this.currentToken))
            this.eat(types.ID)
        }

        this.eat(types.COLON)
        const type = this.typeSpec()

        return varNodes.map(v => new Param(v, type))
    }

    variableDeclaration() {
        const vars = [this.variable()]

        while (this.currentToken.type === types.COMMA) {
            this.eat(types.COMMA)
            vars.push(this.variable())
        }

        this.eat(types.COLON)
        const type = this.typeSpec()

        return vars.map(v => new VarDecl(v, type))
    }

    typeSpec() {
        const type = new Type(this.currentToken)

        if (this.currentToken.type == types.REAL) this.eat(types.REAL)

        if (this.currentToken.type == types.INTEGER) this.eat(types.INTEGER)

        return type
    }

    compoundStatement() {
        this.eat(types.BEGIN)
        const stmnts = this.statementList()
        this.eat(types.END)

        return new Compound(stmnts)
    }

    statementList() {
        const statements = []

        statements.push(this.statement())

        while (this.currentToken.type === types.SEMI) {
            this.eat(types.SEMI)
            statements.push(this.statement())
        }

        if (this.currentToken.type === types.ID) {
            throw new Error('Invalid Token Type')
        }

        return statements
    }

    statement() {
        if (this.currentToken.type === types.BEGIN) {
            return this.compoundStatement()
        }

        if (this.currentToken.type === types.ID) {
            return this.actionStatement()
        }

        if (this.currentToken.type === types.IF)
            return this.conditionalStatement()

        return this.empty()
    }

    conditionalStatement() {
        const ifStmnt = this.ifStatement()
        let elseStmnt

        if (this.currentToken.type === types.ELSE) {
            elseStmnt = this.elseStatement()
        } else {
            this.eat(types.SEMI)
        }

        return new Conditional(ifStmnt, undefined, elseStmnt)
    }

    ifStatement() {
        this.eat(types.IF)

        if (this.currentToken.type === types.LPAREN) this.eat(types.LPAREN)
        const boolExpression = this.expr()
        if (this.currentToken.type === types.RPAREN) this.eat(types.RPAREN)

        this.eat(types.THEN)
        const compStatement = this.compoundStatement()

        return new If(boolExpression, compStatement)
    }

    elseStatement() {
        this.eat(types.ELSE)
        const body = this.compoundStatement()
        this.eat(types.SEMI)

        return new Else(body)
    }

    actionStatement() {
        const variable = this.variable()

        if (this.currentToken.type === types.ASSIGN)
            return this.assignmentStatement(variable)

        if (this.currentToken.type === types.LPAREN)
            return this.procCallStatement(variable)
    }

    assignmentStatement(variable) {
        const token = this.currentToken
        this.eat(types.ASSIGN)

        return new Assign(variable, token, this.expr())
    }

    procCallStatement(variable) {
        this.eat(types.LPAREN)
        const args = this.arguments()
        this.eat(types.RPAREN)

        return new ProcCall(variable, args)
    }

    arguments() {
        const args = []
        if (this.currentToken.type === types.RPAREN) {
            args.push(this.NoOp())
            return args
        }

        args.push(this.expr())

        while (this.currentToken.type === types.COMMA) {
            this.eat(types.COMMA)
            args.push(this.expr())
        }

        return args
    }

    expr() {
        let node = this.term()

        while ([types.PLUS, types.MINUS].includes(this.currentToken.type)) {
            const token = this.currentToken

            if (this.currentToken.type === types.PLUS) {
                this.eat(types.PLUS)
            }

            if (this.currentToken.type === types.MINUS) {
                this.eat(types.MINUS)
            }

            node = new BinOp(node, token, this.term())
        }

        return node
    }

    term() {
        let node = this.factor()
        while (
            [types.MUL, types.INTEGER_DIV, types.FLOAT_DIV].includes(
                this.currentToken.type
            )
        ) {
            const token = this.currentToken

            if (token.type === types.MUL) {
                this.eat(types.MUL)
            }

            if (token.type === types.INTEGER_DIV) {
                this.eat(types.INTEGER_DIV)
            }

            if (token.type === types.FLOAT_DIV) {
                this.eat(types.FLOAT_DIV)
            }

            node = new BinOp(node, token, this.factor())
        }

        return node
    }

    factor() {
        const token = this.currentToken

        if (token.type === types.PLUS) {
            this.eat(types.PLUS)
            return new UnaryOp(token, this.factor())
        }

        if (token.type === types.MINUS) {
            this.eat(types.MINUS)
            return new UnaryOp(token, this.factor())
        }

        if (token.type === types.INTEGER_CONST) {
            this.eat(types.INTEGER_CONST)
            return new Num(token)
        }

        if (token.type === types.REAL_CONST) {
            this.eat(types.REAL_CONST)
            return new Num(token)
        }

        if (token.type === types.LPAREN) {
            this.eat(types.LPAREN)
            const node = this.expr()
            this.eat(types.RPAREN)

            return node
        }

        return this.variable()
    }

    variable() {
        const token = this.currentToken
        this.eat(types.ID)

        return new Var(token)
    }

    empty() {
        return new NoOp()
    }

    eat(tokenType) {
        if (this.currentToken.type !== tokenType)
            throw new Error(
                `Expected ${tokenType} but got ${this.currentToken.type}`
            )

        this.currentToken = this.lexer.getNextToken()
    }
}
