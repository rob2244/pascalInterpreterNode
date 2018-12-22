# <center>**Pascal Grammar**</center>

- program: PROGRAM variable SEMI block DOT
- block: declarations compoundStatement
- declarations: VAR (variableDeclaration SEMI)+
  | (PROCEDURE ID SEMI block SEMI)\*
  | empty
- variableDeclaration: ID (COMMA ID)\* COLON typeSpec
- typeSpec: INTEGER
- compoundStatement: BEGIN statementList END
- statementList: statement | statement SEMI statementList
- statement: compoundStatement
  | actionStatement
  | ifStatement
  | empty
- actionStatement: variable (procStatement | assignStatement)
- procStatement: LPAREN arguments RPAREN SEMI
- arguments: expr(COMMA expr)\* | empty
- assignStatement: assign expr
- empty:
- returnStatement: RETURN (expr | empty) SEMI
- conditionalStatement: ifStatement (SEMI | elseStatement)
- ifStatement: IF LPAREN? expr RPAREN? THEN compoundStatement
- elseStatement: ELSE compoundStatement SEMI
- expr: term ((PLUS | MINUS) term)\*
- term: factor((MUL | INTEGER_DIV | FLOAT_DIV) factor)\*
- factor: PLUS factor
  | MINUS factor
  | INTEGER_CONST
  | REAL_CONST
  | LPAREN expr RPAREN
  | variable
- variable: ID
