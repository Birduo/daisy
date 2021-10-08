function lex(str) {
    let out = []
    let ch = 'x'
    let type = ""
    let sum = ""

    for (let i = 0; i < str.length; i++) {
        ch = str[i];
        if (ch.match(/\d/)) {
            if (type == "id") {}
            else if (sum != "" && type != "num") {
                out.push([type, sum])
                sum = ""
            }

            if (type != "id") type = "num"
            sum += ch
        } else if (ch == ".") {
            if (type == "num") {
                if (sum.includes(".")) {
                    throw new Error("Attempt to add multiple . to number. Num: " + sum)
                }

                sum += ch
            } else {
                out.push([type, sum])
                sum = ""
                type = ""
                out.push((ch, ch))
            }
        } else if (ch.match(/[a-zA-Z_]/g)) {
            if (sum != "" && type != "id") {
                out.push([type, sum])
                sum = ""
            }

            type = "id"
            sum += ch            
        } else if (ch.match(/[-+*\/\%();\n{}=,<>]/g)) {
            let pushed = false
            if (sum == "=") { // testing for =>
                if (ch.match(/[>=]/g)) {
                    sum += ch
                }

                out.push([sum, sum])
                type = ""
                sum = ""
                pushed = true
            }

            if (sum != "") {
                out.push([type, sum])
                type = ""
                sum = ""
            }

            if (!pushed) {
                sum = ch
                type = ch
            }
        } else {
            if (sum != "") {
                out.push([type, sum])
            }

            type = ""
            sum = ""
        }
    }

    if (sum != "") {
        out.push([type, sum])
    }

    for (let i = 0; i < out.length; i++) {
        let keywords = [
            "return",
            "print",
            "fun"
        ]

        if (keywords.includes(out[i][1])) {
            out[i][0] = out[i][1]
        }
    }

    return out
}

function printToks(arr) {
    let out = ""
    console.log("{")
    for (let x = 0; x < arr.length; x++) {
        out = "    (" + arr[x][0]
        out += ": " + arr[x][1] + ")"
        console.log(out)
    }
    console.log("}")
}

function printArr(arr) {
    for (let x = 0; x < arr.length; x++) {
        console.log(arr[x])
    }    
}

module.exports = {
    lex,
    printToks,
    printArr
}