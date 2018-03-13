const fs = require("fs");

function FileAnalyzer(filePath, pos)
{
    this.pos = pos || 0;
    this.buffer = typeof filePath === 'string' ? fs.readFileSync(filePath) : filePath;
    this.result = {};

    this.isBigEndian = false;
}

FileAnalyzer.prototype.readBuffer = function (len) {
    return this.buffer.slice(this.pos, this.pos += len);
};

FileAnalyzer.prototype.analyze = function (analyzer) {
    if (typeof analyzer !== 'object')
        throw new Error('Incorrect analyzer.');

    let isTopCaller = arguments.length === 1;
    let result = {};
    if (isTopCaller)
        this.result = result;

    for (let i in analyzer) {
        if (!analyzer.hasOwnProperty(i))
            continue;

        let opt = analyzer[i];
        if (typeof opt === 'function')
            opt = { type: opt };

        Object.assign(opt, { _TopResult: this.result, _NowResult: result });

        let attrName = i;
        let mr = attrName.match(/(.*)\[(.*?)]$/);
        if (mr && mr.length >= 2) {
            attrName = mr[1];
            let command = parseCommand(mr[2]);
            if (command.name === 'len') {
                let count = Number(command.arg);
                if (isNaN(count))
                    count = Number(result[command.arg]);
                let arr = [];
                for (let i = 0; i < count; i++) {
                    arr[i] = opt.type(this, opt);
                }
                result[attrName] = arr;
            } else if (command.name === 'parent') {
                result[attrName] = this.analyze(opt, 1);
            } else if (command.name === 'config') {
                if (command.arg === 'bigEndian') {
                    this.isBigEndian = opt;
                } else {
                    throw new Error('Incorrect command arg.');
                }
            } else {
                throw new Error('Incorrect command.');
            }
        } else {
            result[attrName] = opt.type(this, opt);
        }
    }

    return result;
};

function parseCommand(commandStr) {
    let name = '', arg = '';
    if (!isNaN(commandStr)) {
        name = 'len';
        arg = Number(commandStr);
    } else {
        let index = commandStr.indexOf(':');
        if (index === -1) {
            name = commandStr;
        } else {
            name = commandStr.substr(0, index);
            arg = commandStr.substr(index + 1);
        }
    }

    return { name, arg };
}

/* util */

FileAnalyzer.FormatFlags = function FormatFlags(flagNum, flagMap) {
    let ret = {};
    for (let name in flagMap) {
        if (flagMap.hasOwnProperty(name))
            ret[name] = Boolean(flagNum & flagMap[name]);
    }
    return ret;
};

/* type*/

FileAnalyzer.TYPES = {};
FileAnalyzer.TYPES.Buffer = (fileAnalyzer, opt) => {
    let len = opt.hasOwnProperty('len') ? opt['len'] : 1;
    if (isNaN(len))
        len = opt._NowResult[len];
    return fileAnalyzer.readBuffer(len);
};
FileAnalyzer.TYPES.String = (fileAnalyzer, opt) => FileAnalyzer.TYPES.Buffer(fileAnalyzer, opt).toString();

FileAnalyzer.TYPES.Byte = fileAnalyzer => {
    let ret = fileAnalyzer.buffer.readInt8(fileAnalyzer.pos);
    fileAnalyzer.pos += 1;
    return ret;
};
FileAnalyzer.TYPES.UByte = fileAnalyzer => {
    let ret = fileAnalyzer.buffer.readUInt8(fileAnalyzer.pos);
    fileAnalyzer.pos += 1;
    return ret;
};

FileAnalyzer.TYPES.Short = fileAnalyzer => {
    let fun = `readInt16${ fileAnalyzer.isBigEndian ? 'BE' : 'LE' }`;
    let ret = fileAnalyzer.buffer[fun](fileAnalyzer.pos);
    fileAnalyzer.pos += 2;
    return ret;
};
FileAnalyzer.TYPES.UShort = fileAnalyzer => {
    let fun = `readUInt16${ fileAnalyzer.isBigEndian ? 'BE' : 'LE' }`;
    let ret = fileAnalyzer.buffer[fun](fileAnalyzer.pos);
    fileAnalyzer.pos += 2;
    return ret;
};

FileAnalyzer.TYPES.Int = fileAnalyzer => {
    let fun = `readInt32${ fileAnalyzer.isBigEndian ? 'BE' : 'LE' }`;
    let ret = fileAnalyzer.buffer[fun](fileAnalyzer.pos);
    fileAnalyzer.pos += 4;
    return ret;
};
FileAnalyzer.TYPES.UInt = fileAnalyzer => {
    let fun = `readUInt32${ fileAnalyzer.isBigEndian ? 'BE' : 'LE' }`;
    let ret = fileAnalyzer.buffer[fun](fileAnalyzer.pos);
    fileAnalyzer.pos += 4;
    return ret;
};

FileAnalyzer.TYPES.Long = fileAnalyzer => {
    let n1 = FileAnalyzer.TYPES.Int(fileAnalyzer);
    let n2 = FileAnalyzer.TYPES.Int(fileAnalyzer);
    if (fileAnalyzer.isBigEndian)
        [n1, n2] = [n2, n1];
    return n2 * 0xffffffff + n1;
};

FileAnalyzer.TYPES.Float = fileAnalyzer => {
    let fun = `readFloat${ fileAnalyzer.isBigEndian ? 'BE' : 'LE' }`;
    let ret = fileAnalyzer.buffer[fun](fileAnalyzer.pos);
    fileAnalyzer.pos += 4;
    return ret;
};

FileAnalyzer.TYPES.Double = fileAnalyzer => {
    let fun = `readDouble${ fileAnalyzer.isBigEndian ? 'BE' : 'LE' }`;
    let ret = fileAnalyzer.buffer[fun](fileAnalyzer.pos);
    fileAnalyzer.pos += 8;
    return ret;
};

// Multistage
module.exports = FileAnalyzer;