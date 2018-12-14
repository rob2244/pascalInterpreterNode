import * as types from '../lexer/token-types'

export const GLOBAL_SCOPE = {}


export default class Interpreter {
    constructor(tree) {
        this.tree = tree
    }

    interpret() {
        this.visit(this.tree)
    }


    visit(node) {
        const className = node.constructor.name
        const metName = `visit${className}`

        return this[metName](node)
    }

    visitProgram(program) {
        this.visit(program.block)
    }

    visitBlock(block) {
        for (const decl of block.decls) {
            this.visit(decl)
        }

        this.visit(block.compStmt)
    }

    visitVarDecl() {

    }

    visitProcedureDecl() {

    }

    visitType() {

    }

    visitCompound(compound) {
        for (const item of compound.children) {
            this.visit(item)
        }
    }

    visitAssign(assign) {
        const varName = assign.left.value
        GLOBAL_SCOPE[varName] = this.visit(assign.right)
    }

    visitNoOp() {}

    visitUnaryOp(unaryOp) {
        const tokenType = unaryOp.token.type

        if (tokenType === types.MINUS) {
            return -this.visit(unaryOp.expr)
        }

        if (tokenType === types.PLUS) {
            return +this.visit(unaryOp.expr)
        }
    }

    visitBinOp(binOp) {
        const tokenType = binOp.token.type

        if (tokenType === types.PLUS) {
            return this.visit(binOp.left) + this.visit(binOp.right)
        }

        if (tokenType === types.MINUS) {
            return this.visit(binOp.left) - this.visit(binOp.right)
        }

        if (tokenType === types.MUL) {
            return this.visit(binOp.left) * this.visit(binOp.right)
        }

        if (tokenType === types.INTEGER_DIV) {
            return Math.round(this.visit(binOp.left)) / Math.round(this.visit(binOp.right))
        }

        if (tokenType === types.FLOAT_DIV) {
            return this.visit(binOp.left) / this.visit(binOp.right)
        }
    }

    visitNum(num) {
        return num.value
    }

    visitVar(v) {
        const value = GLOBAL_SCOPE[v.value]

        if (!value)
            throw new Error(`${v.value} not found in global scope`)

        return value
    }
}