import NSet from './NSet';
import { Regex, RESymbol, REConcat, RERepeat, REStar, REPlus, REOr } from './Regex';

const specialChars = new NSet<string>("{}[]()?+*|^$\\");
const numChars = new NSet<string>("1234567890");

export default function compile(str: string, captures: Regex[] = []) {
    let orGroups = [[]];
    let currOut = orGroups[0];
    let escape = false;
    for (let i = 0; i < str.length; i++) {
        let char: string = str.charAt(i);

        if (escape) {
            if (numChars.has(char))  // if number, get capture group
                currOut.push(captures[parseInt(char) - 1]);
            else  // otherwise, push symbol
                currOut.push(new RESymbol(char));
            continue;
        }
        if (!specialChars.has(char))
            currOut.push(new RESymbol(char));

        if (char == '[') {
            let inside: Regex[] = [];
            let negate = false;
            if (str.charAt(i + 1) == '^') {
                negate = true;
                i++;
            }
            for (; str.charAt(i) != ']'; i++) {
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
            let depth = 1;  // current depth in parenthesization
            let end = i + 1;
            while (depth != 0) {  // depth is 0 when we leave the parentheses
                if (str.charAt(end) == '(')
                    depth++;
                if (str.charAt(end) == ')')
                    depth--;
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
    for (let group of orGroups) {
        out.push(new REConcat(group));
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
