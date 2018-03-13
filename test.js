const FileAnalyzer = require('./FileAnalyzer');
const AnalyzerJava = require('./AnalyzerJava');

let fa = new FileAnalyzer('test.class');
let res = fa.analyze(AnalyzerJava);
console.log(res);