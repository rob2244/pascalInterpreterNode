import * as types from '../lexer/token-types'
import Scope from './scope'

export const HEAP = {}

export default class Interpreter {
    constructor(tree) {
        this.tree = tree
        this.currentScope = Scope.global()
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

    visitVarDecl(varDecl) {
        this.currentScope.add(varDecl.varNode.value, 0)
    }

    visitProcedureDecl(procDecl) {
        HEAP[procDecl.procName] = procDecl
    }

    visitType() {}

    visitCompound(compound) {
        for (const item of compound.children) {
            this.visit(item)
        }
    }

    visitConditional({ ifStmnt, elseStmnt }) {
        if (this.visit(ifStmnt.booleanExpr)) {
            this.visit(ifStmnt.body)
        } else {
            if (elseStmnt) this.visit(elseStmnt.body)
        }
    }

    visitAssign(assign) {
        // TODO check parent scopes to see if exists
        const varName = assign.left.value
        this.currentScope.add(varName, this.visit(assign.right))
    }

    visitProcCall(procCall) {
        this.currentScope = new Scope(
            procCall.name.value,
            this.currentScope.level + 1,
            this.currentScope
        )
        const proc = HEAP[procCall.name.value]

        for (let i = 0; i < proc.params.length; i++) {
            const p = proc.params[i]
            const a = procCall.args[i]

            if (!a)
                throw new Error(
                    `Not enough arguments to call function ${proc.procName}`
                )

            this.currentScope.add(p.varNode.value, a.value)
        }

        this.visit(proc.block)
        this.currentScope = this.currentScope.enclosingScope
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
            return (
                Math.round(this.visit(binOp.left)) /
                Math.round(this.visit(binOp.right))
            )
        }

        if (tokenType === types.FLOAT_DIV) {
            return this.visit(binOp.left) / this.visit(binOp.right)
        }
    }

    visitNum(num) {
        return num.value
    }

    visitVar(v) {
        const value = this.currentScope.lookup(v.value, true)

        if (value === undefined)
            throw new Error(`${v.value} not found in global scope`)

        return value
    }
}
