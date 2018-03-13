# FileAnalyzer
A universal binary data parser that can freely expand the type.
一个通用的二进制数据解析器, 可以自由扩展类型.

The currently supported parsing type is JavaClass
目前已支持的解析类型为 JavaClass.

Subsequent preparations for adding types: PE files, IP datagrams, etc.
后续准备添加的类型: PE文件, IP数据报等

# Test Code
```javascript
let fa = new FileAnalyzer('test.class');
let res = fa.analyze(AnalyzerJava);
console.log(res);
```

output:
```
{ Magic: <Buffer ca fe ba be>,
  MinorVer: 0,
  MajorVer: 51,
  ConstantPoolCount: 33,
  ConstantPool:
   [ {},
     { tag: 10, classIndex: 7, nameAndTypeIndex: 18 },
     { tag: 9, classIndex: 19, nameAndTypeIndex: 20 },
     { tag: 10, classIndex: 21, nameAndTypeIndex: 22 },
     { tag: 7, nameIndex: 23 },
     { tag: 10, classIndex: 4, nameAndTypeIndex: 24 },
     { tag: 7, nameIndex: 25 },
     { tag: 7, nameIndex: 26 },
     { tag: 1, len: 6, string: '<init>' },
     { tag: 1, len: 3, string: '()V' },
     { tag: 1, len: 4, string: 'Code' },
     { tag: 1, len: 15, string: 'LineNumberTable' },
     { tag: 1, len: 4, string: 'main' },
     { tag: 1, len: 22, string: '([Ljava/lang/String;)V' },
     { tag: 1, len: 1, string: 'j' },
     { tag: 1,
       len: 38,
       string: '(Ljava/lang/String;)Ljava/lang/String;' },
     { tag: 1, len: 10, string: 'SourceFile' },
     { tag: 1, len: 9, string: 'TEST.java' },
     { tag: 12, nameIndex: 8, descriptorIndex: 9 },
     { tag: 7, nameIndex: 27 },
     { tag: 12, nameIndex: 28, descriptorIndex: 29 },
     { tag: 7, nameIndex: 30 },
     { tag: 12, nameIndex: 31, descriptorIndex: 32 },
     { tag: 1, len: 16, string: 'java/lang/String' },
     { tag: 12, nameIndex: 8, descriptorIndex: 32 },
     { tag: 1, len: 4, string: 'TEST' },
     { tag: 1, len: 16, string: 'java/lang/Object' },
     { tag: 1, len: 16, string: 'java/lang/System' },
     { tag: 1, len: 3, string: 'out' },
     { tag: 1, len: 21, string: 'Ljava/io/PrintStream;' },
     { tag: 1, len: 19, string: 'java/io/PrintStream' },
     { tag: 1, len: 7, string: 'println' },
     { tag: 1, len: 5, string: '([C)V' } ],
  AccessFlags:
   { ACC_PUBLIC: true,
     ACC_PRIVATE: false,
     ACC_PROTECTED: false,
     ACC_STATIC: false,
     ACC_FINAL: false,
     ACC_SUPER: true,
     ACC_INTERFACE: false,
     ACC_ABSTRACT: false,
     ACC_SYNTHETIC: false,
     ACC_ANNOTATION: false,
     ACC_ENUM: false },
  ThisClass: { index: 6, name: 'TEST' },
  SuperClass: { index: 7, name: 'java/lang/Object' },
  InterfacesCount: 0,
  Interfaces: [],
  FieldsCount: 0,
  Fields: [],
  MethodsCount: 3,
  Methods:
   [ { accessFlags: [Object],
       nameIndex: 8,
       name: '<init>',
       descriptorIndex: 9,
       descriptor: '()V',
       attributesCount: 1,
       attributes: [Array] },
     { accessFlags: [Object],
       nameIndex: 12,
       name: 'main',
       descriptorIndex: 13,
       descriptor: '([Ljava/lang/String;)V',
       attributesCount: 1,
       attributes: [Array] },
     { accessFlags: [Object],
       nameIndex: 14,
       name: 'j',
       descriptorIndex: 15,
       descriptor: '(Ljava/lang/String;)Ljava/lang/String;',
       attributesCount: 1,
       attributes: [Array] } ],
  AttributesCount: 1,
  Attributes:
   [ { attributeNameIndex: [Object],
       attributeLength: 2,
       attributeBuffer: <Buffer 00 11>,
       sourceFileIndex: [Object] } ] }
```