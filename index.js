import Lexer from './lexer/lexer'
import Parser from './parser/parser'
import Interpreter from './interpreter/interpreter'
import SrcToSrcCompiler from './srcToSrcComp/srcToSrcComp'
import SemanticAnalyzer from './semanticAnalyzer/semanticAnalyzer'
import fs from 'fs'
import path from 'path'
import * as types from './lexer/token-types'

/* eslint no-constant-condition: "off", no-console: "off" */

fs.readFile(path.join(__dirname, 'input.pas'), 'utf8', (err, data) => {
    if (err) throw err

    interpret(data)
})

function interpret(text) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    const tree = parser.parse()

    const interpreter = new Interpreter(tree)

    interpreter.interpret()
}

function analyze(text) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    const tree = parser.parse()

    const sb = new SemanticAnalyzer(tree)
    return sb.build()
}

function compile(text) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    const tree = parser.parse()

    const comp = new SrcToSrcCompiler(tree)
    return comp.compile()
}

function printLexer(text) {
    const lexer = new Lexer(text)

    while (true) {
        const token = lexer.getNextToken()
        console.log(token.toString())

        if (token.type == types.EOF) return
    }
}

function parse(text) {
    const lexer = new Lexer(text)
    const parser = new Parser(lexer)
    return parser.parse()
}
