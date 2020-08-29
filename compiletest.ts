import NSet from './NSet';
import { Regex, RESymbol, REConcat, RERepeat, REStar, REPlus, REOr } from './Regex';

const specialChars = new NSet("{}[]()?+*|^$\\");

class StackThingy {
    arr = [];
    or = false;

    push(item) {
        if (this.or) {
            let x = this.arr.pop();
            this.arr.push(new REOr([x, item]));
        } else {
            this.arr.push(item);
        }
    }

    pop() {
        return this.arr.pop();
    }
}

export default function compile(str: string, captures = []) {
    let orGroups = [[]];
    let currOut = orGroups[0];
    for (let i = 0; i < str.length; i++) {
        let char = str.charAt(i);

        if (!specialChars.has(char))
            currOut.push(new RESymbol(char));

        if (char == '[') {
            let inside = [];
            let negate = false;
            for (; str.charAt(i) != ']'; i++) {
                if (str.charAt(i) == '^')
                    negate = true;
                else
                    inside.push(new RESymbol(str.charAt(i)));
            }
            if (negate) {
                // TODO
            }
            else {
                currOut.push(new REOr(inside));
            }
        }

        if (char == '{') {
            let start = i;
            for (; str.charAt(i) != '}'; i++)
                ;  // get end of {}
            let x = str.substring(start, i).split(',');

            let repeatMin = parseInt(x[0]);
            let repeatMax = parseInt(x[0]);
            if (x.length == 2)
                repeatMax = parseInt(x[1]);
            let inside = currOut.pop();
            currOut.push(new RERepeat(inside, repeatMin, repeatMax))
        }

        if (char == '?') {
            let inside = currOut.pop();
            currOut.push(new RERepeat(inside, 0, 1));
        }

        if (char == '+') {
            let inside = currOut.pop();
            currOut.push(new REConcat([inside, new REStar(inside)]));
        }

        if (char == '*') {
            currOut.push(new REStar(currOut.pop()));
        }

        if (char == '|') {
            orGroups.push([]);
            currOut = orGroups[orGroups.length - 1];
        }

        if (char == '(') {
            let level = 1;
            let end = i + 1;
            while (level != 0) {
                if (str.charAt(end) == '(')
                    level++;
                if (str.charAt(end) == ')')
                    level--
                end++;
            }
            end--;
            let sub = compile(str.substring(i + 1, end), captures)
            currOut.push(sub);
            captures.push(sub);
            i = end;
        }
    }
    let out = [];
    let z = 0;
    for (let group of orGroups) {
        out.push(new REConcat(group));
        z++;
    }
    return new REOr(out);
}

let nfa = compile('a|(x[abcde]z)').getNFA();
console.log(nfa.checkString('xdz'));
console.log(nfa.checkString('xyz'));
console.log(nfa.checkString('a'));
console.log(nfa.checkString('x'));
console.log(nfa.checkString('xez'));
console.log(nfa.checkString('xz'));
