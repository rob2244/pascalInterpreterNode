import ScopedSymbolTable from '../semanticAnalyzer/scoped-symbol-table'
import VarSymbol from '../semanticAnalyzer/symbol/var'
import ProcedureSymbol from '../semanticAnalyzer/symbol/procedure'

export default class SrcToSrcCompiler {
    constructor(tree) {
        this.tree = tree
        this.src = ''
        this.currentScope = ScopedSymbolTable.BuiltIn()
    }

    compile() {
        const result = this.visit(this.tree)
        return result
    }


    visit(node) {
        const className = node.constructor.name
        const metName = `visit${className}`

        return this[metName](node)
    }

    visitProgram(program) {
        let result = `program ${program.name}${this.currentScope.scope} \n`

        const global = new ScopedSymbolTable('global', 1, this.currentScope.level)
        this.currentScope = global


        result += this.visit(program.block)

        this.currentScope = this.currentScope.enclosingScope
        return result
    }

    visitBlock(block) {
        let result = ''

        for (const decl of block.decls) {
            result += this.visit(decl)
        }

        result += 'begin \n'
        result += this.visit(block.compStmt)
        result += `end; {END OF ${this.currentScope.name}} \n`

        return result
    }

    visitVarDecl(varDecl) {
        const name = varDecl.varNode.value
        if (this.currentScope.lookup(name, false))
            throw new Error(`Symbol ${name} has already been defined`)


        const type = this.currentScope.lookup(varDecl.type.value, true)
        this.currentScope.define(new VarSymbol(name, type))


        return `var ${name}${this.currentScope.level} : ${this.visit(varDecl.type)}\n`
    }

    visitProcedureDecl(procDecl) {
        const {
            procName,
            params,
            block
        } = procDecl

        let result = `procedure ${procName}${this.currentScope.level}`

        const procSymbol = new ProcedureSymbol(procName, [])
        this.currentScope.define(procSymbol)

        const procScope = new ScopedSymbolTable(procName, this.currentScope.level + 1, this.currentScope)
        this.currentScope = procScope

        if (params.length > 0) {
            result += '('

            for (const param of params) {
                const type = this.currentScope.lookup(param.typeNode.value, true)
                const varSymbol = new VarSymbol(param.varNode.value, type)
                this.currentScope.define(varSymbol)
                procSymbol.params.push(varSymbol)

                result += `${this.visit(param)}, `
            }

            result = result.trim().slice(0, -1)
            result += '); \n'
        }



        result += this.visit(block)
        this.currentScope = this.currentScope.enclosingScope

        return result
    }

    visitParam(param) {
        return `${param.varNode.value}${this.currentScope.level} : ${this.visit(param.typeNode)}`
    }

    visitType(type) {
        return type.value
    }

    visitCompound(compound) {
        let result = ''
        for (const item of compound.children) {
            result += this.visit(item)
        }

        return result
    }

    visitAssign(assign) {
        const name = assign.left.value
        const symbol = this.currentScope.lookup(name, true)

        if (!symbol)
            throw new Error(`Symbol ${name} has not been declared`)


        let result = this.visit(assign.left)
        result += ' := '
        result += this.visit(assign.right)

        return result
    }

    visitNoOp() {
        return '\n'
    }

    visitUnaryOp(unaryOp) {
        let result = unaryOp.token.value
        result += this.visit(unaryOp.expr)
        return result
    }

    visitBinOp(binOp) {
        let result = this.visit(binOp.left)
        result += ` ${binOp.op} `
        result += this.visit(binOp.right)
        return result
    }

    visitNum(num) {
        return num.value
    }

    visitVar(v) {
        const symbol = this.currentScope.lookup(v.value, true)

        return `<${v.value}${this.currentScope.level}:${symbol.type.name}>`
    }
}