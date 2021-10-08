var parser = require("./parser")

class Environment {
    
}

class Interpreter {
    decls = []

    constructor(decls) {
        this.decls = decls
    }

    interpret(t) {
        switch (t.type) {
            case "stmt":
                this.interpret(t.child)
                break
            case "print":
                console.log(this.interpret(t.operand[0].operand))
            case "num":
                return parseFloat(t.operator)
            case "term":
                return this.interpret(t.operand[0])
            case "op":
                switch(t.operator) {
                    case "*":
                        return this.interpret(t.operand[0]) * this.interpret(t.operand[1])
                    case "/":
                        return this.interpret(t.operand[0]) / this.interpret(t.operand[1])
                    case "%":
                        return this.interpret(t.operand[0]) % this.interpret(t.operand[1])
                    case "+":
                        return this.interpret(t.operand[0]) + this.interpret(t.operand[1])
                    case "-":
                        return this.interpret(t.operand[0]) - this.interpret(t.operand[1])
                    case "neg":
                        return -(this.interpret(t.operand[0]))
                    default:
                        console.log("INVALID OPERATOR: " + t.operator)
                        break
                }
                break
            case "()":
                let temp = new Interpreter(t.operand)
                return temp.idk()
            default:
                break
        }
    }

    run() {
        for (let i = 0; i < this.decls.length; i++) {
            this.interpret(this.decls[i])
        }
    }

    runVerbose() {
        for (let i = 0; i < this.decls.length; i++) {
            console.log(this.interpret(this.decls[i]))
        }
    }

    printTree() {
        console.log("--------Tree--------")
        for (let i = 0; i < this.decls.length; i++) {
            console.log(this.decls[i].toString())
        }
    }
}

module.exports = {
    Interpreter
}