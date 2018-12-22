import ScopedSymbolTable from './scoped-symbol-table'
import VarSymbol from './symbol/var'
import ProcedureSymbol from './symbol/procedure'

export default class SemanticAnalyzer {
    constructor(tree) {
        this.tree = tree
        this.currentScope = ScopedSymbolTable.BuiltIn()
    }

    build() {
        this.visit(this.tree)
        return this.currentScope
    }

    visit(node) {
        const className = node.constructor.name
        const metName = `visit${className}`

        return this[metName](node)
    }

    visitProgram(program) {
        const global = new ScopedSymbolTable(
            'global',
            this.currentScope + 1,
            this.currentScope
        )

        this.currentScope = global
        this.visit(program.block)

        this.currentScope = this.currentScope.enclosingScope
    }

    visitBlock(block) {
        for (const decl of block.decls) {
            this.visit(decl)
        }

        this.visit(block.compStmt)
    }

    visitVarDecl(varDecl) {
        const name = varDecl.varNode.value
        if (this.currentScope.lookup(name, false))
            throw new Error(`Symbol ${name} has already been defined`)

        const type = this.currentScope.lookup(varDecl.type.value, true)
        this.currentScope.define(new VarSymbol(name, type))
    }

    visitProcedureDecl(procDecl) {
        const { procName, params, block } = procDecl

        const procSymbol = new ProcedureSymbol(procName, [])
        this.currentScope.define(procSymbol)

        const procScope = new ScopedSymbolTable(
            procName,
            this.currentScope.level + 1,
            this.currentScope
        )
        this.currentScope = procScope

        for (const param of params) {
            const type = this.currentScope.lookup(param.typeNode.value, true)
            const varSymbol = new VarSymbol(param.varNode.value, type)
            this.currentScope.define(varSymbol)
            procSymbol.params.push(varSymbol)
        }

        this.visit(block)
        this.currentScope = this.currentScope.enclosingScope
    }

    visitType() {}

    visitCompound(compound) {
        for (const item of compound.children) {
            this.visit(item)
        }
    }

    visitAssign(assign) {
        const name = assign.left.value
        const symbol = this.currentScope.lookup(name, true)

        if (!symbol) throw new Error(`Symbol ${name} has not been declared`)

        this.visit(assign.left)
        this.visit(assign.right)
    }

    visitNoOp() {}

    visitUnaryOp(unaryOp) {
        this.visit(unaryOp.expr)
    }

    visitBinOp(binOp) {
        this.visit(binOp.left)
        this.visit(binOp.right)
    }

    visitNum() {}

    visitVar(v) {
        const symbol = this.currentScope.lookup(v.value, true)

        if (!symbol) throw new Error(`Symbol ${v.value} has not been declared`)
    }
}
