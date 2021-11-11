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
    env

    constructor(name, value, args) {
        this.name = name
        this.value = value
        this.args = args 
        if (this.value.type == 'block') {
            this.env = this.value.envOptional
        }
        // console.log(this.env)
        // Envs store declarations but functions store statements. Maybe I need to store envs inside blocks?
    }
}

class Environment { // REDESIGNING TO MAPS NOW
    id =  Math.floor(Math.random() * 2147483647).toString(16) // getting a random id for potential debugging
    variables = new Map() // vars should be 2-length arrays with the format [id, value]
    functions = new Map() // functions should be Declaration objects with type "fun"
    decls = []

    constructor(decls) {
        this.decls = decls
    }
    
    toString() {
        let out = `${this.id}\n`
        for (const [key, value] of this.variables)
            out += `${key} = ${value.value}`
    
        for (const [key, value] of this.functions)
            out += `${key}(${value.args}) = ${value.value}`
                

        return out
    }
}

class Interpreter {
    env

    constructor(env) {
        this.env = env
    }

    interpret(t) {
        switch (t.type) {
            case "fn":
                console.log("Function found!: " + t.operator)
                let fn = new DaisyFn(t.operator, t.child, t.args)
                this.env.functions.set(fn.name, fn)
                break
            case "call":
                console.log("call found!")
                console.log(t)

                if (this.env.functions.has(t.operator)) {
                    let calledFn = this.env.functions.get(t.operator)
                    console.log(calledFn)
                    
                    if (t.operand.length != calledFn.args.length)
                        throw new Error(`Call arg cound does not match expected number of variables: ${t.operand.length}/${calledFn.args.length}`)


                    // Adding the variables from the call to the values of the function...
                    for (let i = 0; i < calledFn.args.length; i++) {
                        console.log(`Argument #${i+1} getting added to environment.`)
                        calledFn.env.variables.set(calledFn.args[i], this.interpret(t.operand[i]))
                    }

                    // TODO: interpret the inside of the function stupid
                    console.log(calledFn.env.variables)

                    return this.env.functions.get(t.operator)
                }
                
                throw new Error("Function not found: " + t.operator)
            case "assn":
                // need to add detection on reassignment
                // GOTTA ADD SCOPE!
                let variable = new DaisyVar(t.operand[0].operator, this.interpret(t.operand[1]))
                
                this.env.variables.set(variable.name, variable)

                // console.log("Assignment found! Variable: " + t.operand[0].operator)
                break
            case "stmt":
                this.interpret(t.child)
                break
            case "print":
                console.log(this.interpret(t.operand[0].operand))
                break
            case "id":
                // search environment/scope for variables matching t.operator
                // GOTTA ADD SCOPE!
                // console.log("ID: " + t.operator)

                if (this.env.variables.has(t.operator))
                    return this.env.variables.get(t.operator).value
                
                throw new Error("Variable not found: " + t.operator)
            case "num":
                return parseFloat(t.operator)
            case "term":
                return this.interpret(t.operand[0])
            case "expr":
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
        for (let i = 0; i < this.env.decls.length; i++) {
            this.interpret(this.env.decls[i])
        }
    }

    runVerbose() {
        for (let i = 0; i < this.env.decls.length; i++) {
            console.log(this.interpret(this.env.decls[i]))
        }
    }

    printTree() {
        console.log("--------Tree--------")
        for (let i = 0; i < this.env.decls.length; i++) {
            console.log(this.env.decls[i].toString())
        }
    }
}

module.exports = {
    Interpreter,
    Environment
}