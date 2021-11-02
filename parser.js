/*
statement := exprStmt | forStmt | ifStmt | printStmt | returnStmt | block
exprStmt := expr (";" | "\n")
forStmt := "for" "(" (varDecl | exprStmt | ";") expr? ";" expr? ")" statement
ifStmt := "if" "(" expr ")" statement
printStmt := "print" expr ";"
returnStmt := "return" expr? ";"
block := "{" declaration* "}"
semi := ";" | "\n"
*/

let interpreter = require("./interpreter")


class Term {
    type = ""
    operator = ""
    operand = []

    constructor(type, operator) {
        this.type = type
        this.operator = operator
    }
    
    toString() {
        let out = "["

        switch (this.type) {
            case "op":
                out += this.operator + ": ("

                for (let i = 0; i < this.operand.length; i++) {
                    out += this.operand[i]

                    if (i < this.operand.length - 1) {
                        out += " | "
                    }
                }

                out += ")"

                break
            case "num":
            case "id":
                out += this.type + ": " + this.operator
                break
            case "call":
                out += this.type + ": "
                out += this.operator + " " //the name of the function to be called
                out += "("
                
                for (let i = 0; i < this.operand.length; i++) {
                    out += this.operand[i]

                    if (i < this.operand.length - 1) {
                        out += ", "
                    }
                }
                
                out += ")"
                        break
            case "semi":
                out += "ToRemove: " + this.operator
                break
            case "()":
                out += this.operator + ": ("

                for (let i = 0; i < this.operand.length; i++) {
                    out += this.operand[i]

                    if (i < this.operand.length - 1) {
                        out += " | "
                    }
                }

                out += ")"
                
                break
            default:
                break
        }
        
        out += "]"
        return out
    }
}

class Assignment {
    type = ""
    operand = []

    constructor(type) {
        this.type = type
    }

    toString() {
        if (this.type == "assn") {
            let out = "assignment: " + this.operand[0].operator + " = " + this.operand[1].toString()
            return out
        }
        return this.operand[0].toString()
    }
}

class Expression {
    operand = 0

    constructor(value) {
        this.operand = value
    }

    toString() {
        return this.operand.toString()
    }
}

class Statement {
    type = ""
    operand = []
    envOptional

    constructor(type) {
        this.type = type
        if (type == "block") {
            this.envOptional = new interpreter.Environment()
        }
    }

    toString() {
        let out = "{"

        switch (this.type) {
            case "print":
            case "return":
            case "expr":
                out += this.type + ": ("

                for (let i = 0; i < this.operand.length; i++) {
                    out += this.operand[i]

                    if (i < this.operand.length - 1) {
                        out += " | "
                    }
                }

                out += ")"
                break
            case "block":
                out += this.type + ": {\n"
                for (let i = 0; i < this.operand.length; i++) {
                    out += "    " + this.operand[i].toString()
                    out += "\n"
                }
                out += "}"

                break
            default:
                out += "placeholder"
                break
        }

        out += "}"

        return out
    }
}

class Declaration {
    type = ""
    operator = ""
    args = []
    child

    constructor(type) {
        this.type = type
    }

    toString() {
        let out = ""

        switch (this.type) {
            case "fn":
                out += this.type + " " + this.operator + " : ("

                for (let i = 0; i < this.args.length; i++) {
                    out += this.args[i]

                    if (i < this.args.length - 1) {
                        out += " , "
                    }
                }

                out += ") "
                out += this.child.toString()
                out += ";"
                break
            case "stmt":
                out += this.type + " " + this.child.toString()

                break
            default:
                out += "placeholder"
                break
        }

        return out
    }
}

class Parser {
    toks = []
    current = 0
    tree = []

    constructor(arr) {
        this.toks = arr
    }

    removeSemi(arr) { //Dedicated to removing unnecessary semicolons and newlines.
        let newTree = []
        //console.log("REMOVING SEMIS")
        for (let i = 0; i < arr.length; i++) {
            try {
                if (arr[i].type == "stmt") {
                    try {
                        if (arr[i].child.operand[0].operand.operand[0].type == "semi") {}
                        else {
                            newTree.push(arr[i])
                        }
                    } catch (e) {
                        newTree.push(arr[i])
                    }
                } else {
                    newTree.push(arr[i])
                }
            } catch (e) {
                console.error(`READING THE WRONG STUFF i: ${i} arr.length: ${arr.length}\n${e}`)
            }
        }

        return newTree
    }

    parseSemi() {
        if ([";", "\n"].includes(this.toks[this.current][0])) {
            this.current++
        } else {
            throw new Error("; or newline expected. Recieved " + this.toks[this.current][1] + " instead")
        }
    }

    matchSymbol(sym) {
        if (this.toks[this.current][0] == sym) {
            this.current++
        } else {
            throw new Error(sym + " expected. Recieved " + this.toks[this.current][1] + " instead")
        }
    }

    parsePrimary() { //primary := num | ""(" term ")"
        if (this.toks[this.current][0] == "num") {
            return new Term("num", this.toks[this.current++][1])
        } else if (this.toks[this.current][0] == "id") {
            let name = this.toks[this.current][1]
            this.current++

            if (this.toks[this.current][0] == "(") {
                let out = new Term("call", name)
                this.current++
                while (this.toks[this.current][0] != ")") {
                    out.operand.push(this.parseTerm())

                    if (this.toks[this.current][0] != ")") this.matchSymbol(",")

                    if (this.current >= this.toks.length) throw new Error("Code went past length of token array. Maybe you forgot a )?")
                }

                this.current++

                return out
            }

            return new Term("id", name)
        } else if (this.toks[this.current][0] == "(") { // "(" term ")"
            let T = new Term("()", "()")
            this.current++
            
            let arr = []
            while (this.toks[this.current][0] != ")") {
                arr.push(this.toks[this.current++])
                if (this.current >= this.toks.length) throw new Error("Code went past length of token array. Maybe you forgot a )?")
            }

            let temp = new Parser(arr)
            T.operand.push(temp.parseTerm())
            this.current++

            return T
        } else if (["\n", ";"].includes(this.toks[this.current][0])) {
            //console.log("SEMI FOUND")
            return new Term("semi", this.toks[this.current++][0])
        } else {
            console.log("bomboclaat: " + [this.toks[this.current][0]])
            this.current++
        }
    }
    
    parseUnary() { //unary := "-" unary | primary
        if (this.toks[this.current][0] == "-") {
            let T = new Term("op", "neg")
            this.current++
            T.operand.push(this.parseUnary())
            return T
        } else {
            return this.parsePrimary()
        }
    }
    
    parseFactor() { //factor := unary ( ("/" | "*") unary)*
        let T = this.parseUnary()
        
        if (this.current < this.toks.length - 1) {
            while (["*", "/", "%"].includes(this.toks[this.current][0]) && this.current < this.toks.length - 1) {
                let op = this.toks[this.current++][0]
                let right = this.parseUnary()
                let temp = T
                T = new Term("op", op)
                T.operand.push(temp)
                T.operand.push(right)
                if (this.current >= this.toks.length - 1) break;
            }
        }

        return T
    }
    
    parseTerm() { //term := factor ( ("-" | "+") factor)*
        let T = this.parseFactor()
        
        if (this.current < this.toks.length - 1) {
            while ((this.toks[this.current][0] == "+" || this.toks[this.current][0] == "-") && this.current < this.toks.length - 1) {
                let op = this.toks[this.current++][0]
                let right = this.parseFactor()
                let temp = T
                T = new Term("op", op)
                T.operand.push(temp)
                T.operand.push(right)

                if (this.current >= this.toks.length - 1) break;
            }
        }

        return T
    }

    parseAssignment() { //assignment := identifier "=" assignment | term
        let E = this.parseTerm()
        let A = new Assignment("term")

        //console.log("IN PARSEASSIGN THIS.CURRENT = " + this.current + "/" +  this.toks.length)
        if (this.current < this.toks.length && this.toks[this.current][0] == "=") {
            if (E.type != "id") {
                throw new Error("Identifier expected before assignment. Recieved " + E.type + " instead (" + E.operator + ")")
            }

            this.current++
            let right = this.parseAssignment()
            let temp = E

            E = new Assignment("assn")
            E.operand.push(temp)
            E.operand.push(right)

            return E
        }
        
        A.operand.push(E)
        return A
    }

    parseExpression() { //expr := assignment
        return new Expression(this.parseAssignment())
    }

    parseStmt() { //statement := exprStmt | forStmt | ifStmt | printStmt | returnStmt | block
        let S = new Statement("expr")

        if (["print", "return"].includes(this.toks[this.current][0])) { // printStmt
            S = new Statement(this.toks[this.current++][0])
            this.matchSymbol("(")
            S.operand[0] = this.parseExpression()
            this.matchSymbol(")")
            this.parseSemi()
        } else if (this.toks[this.current][0] == "{") {
            let arr = [] //holds statements placed in the block
            this.current++

            while (this.toks[this.current][0] != "}" && this.current < this.toks.length) {
                arr.push(this.parseStmt())
            }

            this.current++

            S = new Statement("block")

            let newTree = []

            for (let i = 0; i < arr.length; i++) {
                if (arr[i].type == "expr" && arr[i].operand[0].operand.operand[0].type == "semi") {
                    //console.log("SEMI FOUND")
                } else {
                    newTree.push(arr[i])
                }
            }

            S.operand = newTree
            this.parseSemi()
        } else { // exprStmt
            S.operand.push(this.parseExpression())

            if (!(S.type == "expr" && S.operand[0].operand.operand[0].type == "semi")) {
                this.parseSemi() //if it isn't a semicolon, grab another semicolon hoe
            }
        }
        return S
    }

    parseDecl() { //declaration := funDecl | varDecl | statement
        let D = new Declaration("")

        if (this.toks[this.current][0] == "fn") { //funDecl
            this.current++
            if (this.toks[this.current][0] == "id") {
                D.operator = this.toks[this.current][1]
                this.current++
            } else throw new Error("Identifier expected before function declaration. Recieved " + this.toks[this.current][0] + " instead (" + this.toks[this.current][1] + ")")

            D.type = "fn" // setting declaration type to function declaration

            this.matchSymbol("(")
            
            //console.log("CHECKING FOR ARGS")
            while (this.toks[this.current][0] == "id") { // adding the identifiers to the function definition as parameters
                //console.log("ARG FOUND: " + this.toks[this.current][0])
                D.args.push(this.toks[this.current++][1])
                
                if (this.toks[this.current][0] == ",") {
                    this.current++
                } else break;
            }

            this.matchSymbol(")")

            D.child = this.parseStmt()
        } else {
            D.type = "stmt"
            D.child = this.parseStmt()
        }
        console.log(D)

        return D
    }
    
    parse() {
        while (this.current < this.toks.length) {
            this.tree.push(this.parseDecl())
        }

        return this.removeSemi(this.tree)
    }
}

module.exports = {
    Term,
    Parser
}