let lexer = require("./lexer")
let parser = require("./parser")
let interpreter = require("./interpreter")
let fs = require("fs")

let text = fs.readFileSync("./test.txt", "utf-8") 
text += ";"

arr = lexer.lex(text)

console.log(arr)

let P = new parser.Parser(arr)
let I = new interpreter.Interpreter(P.parse())
I.printTree()
//console.log(I.stmts)
I.run()

// TODO: add environments + comments (get current test.txt to work and not print "undefined")

// NOTE: if i want to add => function definitions, i need to check the scope for an id, for example:
// balls(x) => x <-- that should check the scope for any balls variables before making it a function definition
// also, that should be an implied return