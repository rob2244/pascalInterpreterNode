export default class Scope {
    constructor(name, level, enclosingScope) {
        this.variables = {}
        this.name = name
        this.level = level
        this.enclosingScope = enclosingScope
    }

    static global() {
        return new Scope('GLOBAL', 0)
    }

    add(name, value) {
        this.variables[name] = value
    }

    lookup(name, searchParent) {
        const v = this.variables[name]
        if (v !== undefined) return v

        if (this.enclosingScope && searchParent)
            return this.enclosingScope.lookup(name, true)
    }

    toString() {
        let result = ''
        for (const key in this.variables) {
            if (this.variables.hasOwnProperty(key)) {
                const e = this.variables[key]
                result += e.toString() + '\r\n'
            }
        }

        return result
    }
}
