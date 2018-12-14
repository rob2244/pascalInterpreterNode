import BuiltInTypeSymbol from './symbol/built-in-type'

export default class ScopedSymbolTable {
    constructor(name, level, enclosingScope) {
        this.symbols = {}
        this.name = name
        this.level = level
        this.enclosingScope = enclosingScope
    }

    static BuiltIn() {
        const table = new ScopedSymbolTable('builtin', 0, undefined)
        table.define(new BuiltInTypeSymbol('INTEGER'))
        table.define(new BuiltInTypeSymbol('REAL'))

        return table
    }

    define(symbol) {
        this.symbols[symbol.name] = symbol
    }

    lookup(name, searchParent) {
        const symbol = this.symbols[name]
        if (symbol)
            return symbol

        if (this.enclosingScope && searchParent)
            return this.enclosingScope.lookup(name)
    }

    toString() {
        let result = ''
        for (const key in this.symbols) {
            if (this.symbols.hasOwnProperty(key)) {
                const e = this.symbols[key]
                result += e.toString() + '\r\n'
            }
        }

        return result
    }
}