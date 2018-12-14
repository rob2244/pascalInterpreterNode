import Lexer from './lexer/lexer'
import Parser from './parser/parser'
import Interpreter, {
	GLOBAL_SCOPE
} from './interpreter/interpreter'
import SrcToSrcCompiler from './srcToSrcComp/srcToSrcComp'
import SemanticAnalyzer from './semanticAnalyzer/semanticAnalyzer'
import fs from 'fs'
import path from 'path'

/* eslint no-constant-condition: "off", no-console: "off" */

fs.readFile(path.join(__dirname, 'input.pas'), 'utf8', (err, data) => {
	if (err) throw err

	interpret(data)
})

function interpret(text) {
	const lexer = new Lexer(text)
	const parser = new Parser(lexer)
	const tree = parser.parse()

	const comp = new SrcToSrcCompiler(tree)

	const sb = new SemanticAnalyzer(tree)
	const interpreter = new Interpreter(tree)

	interpreter.interpret()
	sb.build()

	console.log(comp.compile())
}