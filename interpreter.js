var parser = require("./parser")

class DaisyVar {
    name
    value

    constructor(name, value) {
        this.name = name
        this.value = value
    }
}

class DaisyFn {
    name
    value
    args

    constructor(name, value, args) {
        this.name = name
        this.value = value
        this.args = args
    }
}

class Environment { // REDESIGNING TO MAPS NOW
    id =  Math.floor(Math.random() * 100) // getting a random id for potential debugging
    variables = new Map() // vars should be 2-length arrays with the format [id, value]
    functions = new Map() // functions should be Declaration objects with type "fun"
    
    toString() {
        let out = `${this.id}\n`
        if (this.variables.size > 0) {
            for (const [key, value] of this.variables) 
                out += `${key} = ${value}`
        }
        
        if (this.functions.size > 0) {
            for (const [key, value] of this.functions) 
                out += `${key}(${value.args}) = ${value.value}`
        }

        return out
    }
}

class Interpreter {
    decls = []
    global = new Environment()

    constructor(decls) {
        this.decls = decls
    }

    interpret(t) {
        switch (t.type) {
            case "fn":
                console.log("Function found!: " + t.operator)
                let fn = new DaisyFn(t.operator, t.child, t.args)
                this.global.functions.set(fn.name, fn)
                break
            case "assn":
                //need to add detection on reassignment

                let variable = new DaisyVar(t.operand[0].operator, this.interpret(t.operand[1]))
                this.global.variables.set(variable.name, variable)
                console.log("Assignment found! Variable:" + t.operand[0].operator)
                break
            case "stmt":
                this.interpret(t.child)
                break
            case "print":
                console.log(this.interpret(t.operand[0].operand))
            case "id":
                // search environment/scope for variables matching t.operator
                break
            case "num":
                return parseFloat(t.operator)
            case "term":
                return this.interpret(t.operand[0])
            case "expr":
                console.log("Expression found in interpreter!")
                console.log(t.operand[0].operand)
                this.interpret(t.operand[0].operand)
                break
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
    Interpreter,
    Environment
}