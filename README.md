# Daisy (WIP)
Recursive descent interpreted toy programming language.

## Installation
To install, simply clone this repository and run `node .`
By default, the "test.dsy" file is automatically run.

### Examples
```
# comments are #
# functions are like rust
fn add(a, b) {
    return(a +b)
}

# vars are like python
c = add(2.3, 4.5)
print(c)
```

```
# functions can be passed as args!
# no booleans or for loops yet so:
# true: !0
# false: 0
while 1 {
    print("test")
}
```
