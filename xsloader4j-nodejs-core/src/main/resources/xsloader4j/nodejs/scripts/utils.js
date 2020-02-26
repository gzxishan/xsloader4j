
export const root = global;

export function extend(target) {
    for (let i = 1; i < arguments.length; i++) {
        let obj = arguments[i];
        if (!obj) {
            continue;
        }
        for (let x in obj) {
            let value = obj[x];
            if (value === undefined) {
                continue;
            }
            target[x] = obj[x];
        }
    }
    return target;
}


String.prototype.replaceAll = function (str, replace) {
    if (typeof str != "string") {
        return this;
    } else {
        let as = [];
        let len = this.length - str.length;
        for (let i = 0; i < this.length;) {
            if (i < len && this.substring(i, i + str.length) == str) {
                as.push(replace);
                i += str.length;
            } else {
                as.push(this.charAt(i));
                i++;
            }
        }
        return as.join("");
    }
};

export function tagExec(tag, str, isMulti) {
    let q = isMulti ? "?" : ""; //当isMulti为true时，转换为非贪婪匹配模式

    let reg = new RegExp(`(<\s*${tag}\\s*)([^>]*)>([\\w\\W]*${q})</\s*${tag}\s*>`);
    let regResult = reg.exec(str);
    if (regResult) {
        let content = regResult[3];
        let attrsStr = regResult[2];
        let attrs = {};
        let currentIndex = regResult.index + regResult[1].length;
        while (attrsStr) {
            let regResult2 = /([a-zA-Z0-9\|\$:@#!\*\&\^%_\.-]+)(\s*=\s*['"])([^'"]+)(['"])/.exec(attrsStr)
            if (regResult2) {
                currentIndex += regResult2.index;
                let k = regResult2[1]
                attrs[k] = {
                    k: k,
                    s1: regResult2[2],
                    content: regResult2[3],
                    s2: regResult2[4],
                    fullContent: regResult2[0],
                    index: currentIndex //在整个str中的偏移量
                };
                attrsStr = attrsStr.substring(regResult2.index + regResult2[0].length);
                currentIndex += regResult2[0].length;
            } else {
                break;
            }
        }
        let cindex = regResult.index + regResult[1].length + 1;
        return {
            content, //标签里的内容
            lang: attrs.lang ? attrs.lang.content : null, //lang属性
            tag, //标签名字
            index: regResult.index, //标签开始位置
            length: regResult[0].length, //整个内容的长度（包括标签）
            attrs, //所有标签上的属性
            cindex, //标签里的内容的开始位置
            cend: cindex + content.length //结束标签的开始位置
        };
    }
};