const FileAnalyzer = require('./FileAnalyzer');
const TYPES = FileAnalyzer.TYPES;
const TAGS = {
    CONSTANT_Utf8: 1,
    // CONSTANT_Unicode: 2,
    CONSTANT_Integer: 3,
    CONSTANT_Float: 4,
    CONSTANT_Long: 5,
    CONSTANT_Double: 6,
    CONSTANT_Class: 7,
    CONSTANT_String: 8,
    CONSTANT_FieldRef: 9,
    CONSTANT_MethodRef: 10,
    CONSTANT_InterfaceMethodRef: 11,
    CONSTANT_NameAndType: 12,
    CONSTANT_MethodHandle: 15,
    CONSTANT_MethodType: 16,
    CONSTANT_InvokeDynamic: 18
};
const ATTRIBUTES = {
    ConstantValue:  "ConstantValue",
    Code: "Code",
    StackMapTable: "StackMapTable",
    Exceptions: "Exceptions",
    InnerClasses: "InnerClasses",
    EnclosingMethod: "EnclosingMethod",
    Synthetic: "Synthetic",
    Signature: "Signature",
    SourceFile: "SourceFile",
    SourceDebugExtension: "SourceDebugExtension",
    LineNumberTable: "LineNumberTable",
    LocalVariableTable: "LocalVariableTable",
    LocalVariableTypeTable: "LocalVariableTypeTable",
    Deprecated: "Deprecated",
    RuntimeVisibleAnnotations: "RuntimeVisibleAnnotations",
    RuntimeInvisibleAnnotations: "RuntimeInvisibleAnnotations",
    RuntimeVisibleParameterAnnotations: "RuntimeVisibleParameterAnnotations",
    RuntimeInvisibleParameterAnnotations: "RuntimeInvisibleParameterAnnotations",
    AnnotationDefault: "AnnotationDefault",
    BootstrapMethods: "BootstrapMethods"
};
const VerificationItem = {
    Top: 0,
    Integer: 1,
    Float: 2,
    Double: 3,
    Long: 4,
    Null: 5,
    UninitializedThis: 6,
    Object: 7,
    Uninitialized: 8
};
const Descriptor = {
    Byte: 'B',
    Char: 'C',
    Double: 'D',
    Float: 'F',
    Int: 'I',
    Long: 'J',
    Short: 'S',
    Boolean: 'Z',
    Reference: 'L',
    Array: '[',
    String: 's',
    ENum: 'e',
    Class: 'c',
    Annotation: '@'
};

TYPES.ConstantPool = fileAnalyzer => {
    let count = fileAnalyzer.result.ConstantPoolCount;
    let arr = [{}];

    for (let i = 1; i < count; i++) {
        let tag = TYPES.Byte(fileAnalyzer);

        switch (tag) {
            case TAGS.CONSTANT_Utf8:
                let len = TYPES.UShort(fileAnalyzer);
                let string = TYPES.String(fileAnalyzer, { len: len });
                arr[i] = { tag, len, string };
                break;
            case TAGS.CONSTANT_Integer:
                arr[i] = { tag, num: TYPES.Int(fileAnalyzer) };
                break;
            case TAGS.CONSTANT_Float:
                arr[i] = { tag, num: TYPES.Float(fileAnalyzer) };
                break;
            case TAGS.CONSTANT_Long:
                arr[i] = { tag, num: TYPES.Long(fileAnalyzer) };
                arr[++i] = {};
                break;
            case TAGS.CONSTANT_Double:
                arr[i] = { tag, num: TYPES.Double(fileAnalyzer) };
                arr[++i] = {};
                break;
            case TAGS.CONSTANT_Class:
                arr[i] = { tag, nameIndex: TYPES.UShort(fileAnalyzer) };
                break;
            case TAGS.CONSTANT_String:
                arr[i] = { tag, stringIndex: TYPES.UShort(fileAnalyzer) };
                break;
            case TAGS.CONSTANT_FieldRef:
            case TAGS.CONSTANT_MethodRef:
            case TAGS.CONSTANT_InterfaceMethodRef:
                arr[i] = { tag, classIndex: TYPES.UShort(fileAnalyzer), nameAndTypeIndex: TYPES.UShort(fileAnalyzer) };
                break;
            case TAGS.CONSTANT_NameAndType:
                arr[i] = { tag, nameIndex: TYPES.UShort(fileAnalyzer), descriptorIndex: TYPES.UShort(fileAnalyzer) };
                break;
            case TAGS.CONSTANT_MethodHandle:
                arr[i] = { tag, referenceKind: TYPES.UByte(fileAnalyzer), referenceIndex: TYPES.UShort(fileAnalyzer) };
                break;
            case TAGS.CONSTANT_MethodType:
                arr[i] = { tag, descriptorIndex: TYPES.UShort(fileAnalyzer) };
                break;
            case TAGS.CONSTANT_InvokeDynamic:
                arr[i] = { tag, bootstrapMethodAttrIndex: TYPES.UShort(fileAnalyzer), nameAndTypeIndex: TYPES.UShort(fileAnalyzer) };
                break;
            default:
                throw new Error('Unknown tag: ' + tag);
        }
    }

    return arr;
};

TYPES.AccessFlagsClass = fileAnalyzer => {
    return FileAnalyzer.FormatFlags(TYPES.Short(fileAnalyzer), {
            ACC_PUBLIC: 0x0001,
            ACC_PRIVATE: 0x0002,
            ACC_PROTECTED: 0x0004,
            ACC_STATIC: 0x0008,
            ACC_FINAL: 0x0010,
            ACC_SUPER: 0x0020,
            ACC_INTERFACE: 0x0200,
            ACC_ABSTRACT: 0x0400,
            ACC_SYNTHETIC: 0x1000,
            ACC_ANNOTATION: 0x2000,
            ACC_ENUM: 0x4000
        }
    );
};

TYPES.AccessFlagsField = fileAnalyzer => {
    return FileAnalyzer.FormatFlags(TYPES.Short(fileAnalyzer), {
            ACC_PUBLIC: 0x0001,
            ACC_PRIVATE: 0x0002,
            ACC_PROTECTED: 0x0004,
            ACC_STATIC: 0x0008,
            ACC_FINAL: 0x0010,
            ACC_VOLATILE: 0x0040,
            ACC_TRANSIENT: 0x0080,
            ACC_SYNTHETIC: 0x1000,
            ACC_ENUM: 0x4000
        }
    );
};

TYPES.AccessFlagsMethod = fileAnalyzer => {
    return FileAnalyzer.FormatFlags(TYPES.Short(fileAnalyzer), {
            ACC_PUBLIC: 0x0001,
            ACC_FINAL: 0x0010,
            ACC_SUPER: 0x0020,
            ACC_INTERFACE: 0x0200,
            ACC_ABSTRACT: 0x0400,
            ACC_SYNTHETIC: 0x1000,
            ACC_ANNOTATION: 0x2000,
            ACC_ENUM: 0x4000
        }
    );
};

TYPES.ClassPtr = (fileAnalyzer, opt) => {
    let index = TYPES.UShort(fileAnalyzer);
    let ConstantPool = fileAnalyzer.result.ConstantPool || opt.ConstantPool;
    if (index === 0)
        return { index: index };
    return {
        index: index,
        name: ConstantPool[ConstantPool[index].nameIndex].string
    };
};

TYPES.Utf8Ptr = (fileAnalyzer, opt) => {
    let index = TYPES.UShort(fileAnalyzer);
    let ConstantPool = fileAnalyzer.result.ConstantPool || opt.ConstantPool;
    if (index === 0)
        return { index: index };
    return {
        index: index,
        value: ConstantPool[index].string
    };
};

TYPES.NameAndTypePtr = (fileAnalyzer, opt) => {
    let index = TYPES.UShort(fileAnalyzer);
    let ConstantPool = fileAnalyzer.result.ConstantPool || opt.ConstantPool;
    if (index === 0)
        return { index: index };
    return {
        index: index,
        name: ConstantPool[ConstantPool[index].nameIndex].string,
        descriptor: ConstantPool[ConstantPool[index].descriptorIndex].string
    };
};

TYPES.ConstantValuePtr = (fileAnalyzer, opt) => {
    let index = TYPES.UShort(fileAnalyzer);
    let ConstantPool = fileAnalyzer.result.ConstantPool || opt.ConstantPool;
    let obj = ConstantPool[index];
    if (obj.hasOwnProperty('num'))
        return { index, num: obj.num };
    return { index: index, value: ConstantPool[obj.stringIndex].string };
};

TYPES.InnerClassInfo = (fileAnalyzer, opt) => {
    return {
        innerClassInfoIndex: TYPES.ClassPtr(fileAnalyzer, opt),
        outerClassInfoIndex: TYPES.ClassPtr(fileAnalyzer, opt),
        innerNameIndex: TYPES.Utf8Ptr(fileAnalyzer, opt),
        innerClassAccessFlags: TYPES.AccessFlagsClass(fileAnalyzer)
    };
};

TYPES.ExceptionHandler = (fileAnalyzer, opt) => {
    return {
        startPC: TYPES.UShort(fileAnalyzer),
        endPC: TYPES.UShort(fileAnalyzer),
        handlerPC: TYPES.UShort(fileAnalyzer),
        catchType: TYPES.ClassPtr(fileAnalyzer, opt)
    };
};

TYPES.LineNumber = fileAnalyzer => {
    return {
        startPC: TYPES.UShort(fileAnalyzer),
        lineNumber: TYPES.UShort(fileAnalyzer)
    };
};

TYPES.LocalVariable = (fileAnalyzer, opt) => {
    return {
        startPC: TYPES.UShort(fileAnalyzer),
        length: TYPES.UShort(fileAnalyzer),
        nameIndex: TYPES.Utf8Ptr(fileAnalyzer, opt),
        [opt.mode !== 2 ? 'descriptorIndex' : 'signatureIndex']: TYPES.Utf8Ptr(fileAnalyzer, opt),
        index: TYPES.UShort(fileAnalyzer)
    };
};

TYPES.VerificationTypeInfo = (fileAnalyzer, opt) => {
    let ret = {};
    ret.tag = TYPES.UByte(fileAnalyzer);

    switch (ret.tag) {
        case VerificationItem.Top:
        case VerificationItem.Integer:
        case VerificationItem.Float:
        case VerificationItem.Double:
        case VerificationItem.Long:
        case VerificationItem.Null:
        case VerificationItem.UninitializedThis:
            break;
        case VerificationItem.Object:
            ret.classIndex = TYPES.ClassPtr(fileAnalyzer, opt);
            break;
        case VerificationItem.Uninitialized:
            ret.offset = TYPES.UShort(fileAnalyzer);
            break;
        default:
            throw new Error('Unknown tag: ' + ret.tag);
    }

    return ret;
};

TYPES.StackMapFrame = (fileAnalyzer, opt) => {
    let ret = {};
    ret.frameType = TYPES.UByte(fileAnalyzer);

    if (opt.vars.offset !== 0)
        opt.vars.offset += 1;

    if (ret.frameType <= 63) { // SAME
        opt.vars.offset += ret.frameType;
    } else if (ret.frameType <= 127) { // SAME_LOCALS_1_STACK_ITEM
        opt.vars.offset += ret.frameType - 64;
        ret.verificationTypeInfo = TYPES.VerificationTypeInfo(fileAnalyzer, { ConstantPool: opt.ConstantPool });
    } else if (ret.frameType <= 246) { // Reserved
        // .. None ..
    } else if (ret.frameType <= 247) { // SAME_LOCALS_1_STACK_ITEM_EXTENDED
        opt.vars.offset += TYPES.UShort(fileAnalyzer);
        ret.verificationTypeInfo = TYPES.VerificationTypeInfo(fileAnalyzer, { ConstantPool: opt.ConstantPool });
    } else if (ret.frameType <= 250) { // CHOP
        opt.vars.offset += TYPES.UShort(fileAnalyzer);
        ret.k = 251 - ret.frameType;
    } else if (ret.frameType <= 251) { // SAME_FRAME_EXTENDED
        opt.vars.offset += TYPES.UShort(fileAnalyzer);
    } else if (ret.frameType <= 254) { // APPEND
        ret.k = ret.frameType - 251;
    } else { // FULL
        opt.vars.offset += TYPES.UShort(fileAnalyzer);
        Object.assign(ret, fileAnalyzer.analyze({
            localsCount: TYPES.UShort,
            'locals[len:localsCount]': { type: TYPES.VerificationTypeInfo, ConstantPool: opt.ConstantPool }
        }));
        Object.assign(ret, fileAnalyzer.analyze({
            stacksCount: TYPES.UShort,
            'stacks[len:stacksCount]': { type: TYPES.VerificationTypeInfo, ConstantPool: opt.ConstantPool }
        }));
    }
    ret.offset = opt.vars.offset;

    return ret;
};

TYPES.ElementValuePair = (fileAnalyzer, opt) => {
    let ret = {};
    if (!opt['noNameIndex'])
        ret.elementNameIndex = TYPES.Utf8Ptr(fileAnalyzer, opt);

    let ConstantPool = fileAnalyzer.result.ConstantPool || opt.ConstantPool;

    function parseData(fileAnalyzer, opt) {
        let ret = {};
        ret.tag = String.fromCharCode(TYPES.UByte(fileAnalyzer));

        switch (ret.tag) {
            case Descriptor.ENum:
                ret.typeNameIndex = TYPES.Utf8Ptr(fileAnalyzer, opt);
                ret.constNameIndex = TYPES.Utf8Ptr(fileAnalyzer, opt);
                break;
            case Descriptor.Class:
                ret.classInfoIndex = TYPES.UShort(fileAnalyzer);
                break;
            case Descriptor.Annotation:
                ret.annotationValue = TYPES.Annotation(fileAnalyzer, opt);
                break;
            case Descriptor.Array:
                Object.assign(ret, fileAnalyzer.analyze({
                    valuesCount: TYPES.UShort,
                    'values[len:valuesCount]': { type: parseData, ConstantPool }
                }));
                break;
            case Descriptor.String:
                ret.constValueIndex = TYPES.Utf8Ptr(fileAnalyzer, opt);
                break;
            default:
                ret.constValueIndex = TYPES.UShort(fileAnalyzer);
                break;
        }

        return ret;
    }

    Object.assign(ret, parseData(fileAnalyzer, opt));

    return ret;
};

TYPES.Annotation = (fileAnalyzer, opt) => {
    let ConstantPool = fileAnalyzer.result.ConstantPool || opt.ConstantPool;
    return fileAnalyzer.analyze({
        typeIndex: { type: TYPES.Utf8Ptr, ConstantPool },
        elementValuePairsCount: TYPES.UShort,
        'elementValuePairs[len:elementValuePairsCount]': { type: TYPES.ElementValuePair, ConstantPool }
    }, 1);
};

TYPES.ParameterAnnotations = (fileAnalyzer, opt) => {
    let ConstantPool = fileAnalyzer.result.ConstantPool || opt.ConstantPool;
    return fileAnalyzer.analyze({
        annotationsCount: TYPES.UShort,
        'annotations[len:annotationsCount]': { type: TYPES.Annotation, ConstantPool }
    }, 1);
};

TYPES.AttributeInfo = (fileAnalyzer, opt) => {
    let ret = {};
    ret.attributeNameIndex = TYPES.Utf8Ptr(fileAnalyzer, opt);
    let attributeName = ret.attributeNameIndex.value;
    ret.attributeLength = TYPES.UInt(fileAnalyzer);
    ret.attributeBuffer = fileAnalyzer.readBuffer(ret.attributeLength);

    let bufferAnalyzer = new FileAnalyzer(ret.attributeBuffer);
    bufferAnalyzer.isBigEndian = true;
    let ConstantPool = fileAnalyzer.result.ConstantPool || opt.ConstantPool;

    switch (attributeName) {
        case ATTRIBUTES.ConstantValue:
            ret.constantValueIndex = TYPES.ConstantValuePtr(bufferAnalyzer, { ConstantPool });
            break;
        case ATTRIBUTES.Code:
            Object.assign(ret, bufferAnalyzer.analyze({
                maxStack: TYPES.UShort,
                maxLocals: TYPES.UShort,
                codeLength: TYPES.UInt,
                codeBuffer: { type: TYPES.Buffer, len: 'codeLength' }, // need extend
                exceptionTableLength: TYPES.UShort,
                'exceptionTable[len:exceptionTableLength]': { type: TYPES.ExceptionHandler, ConstantPool },
                attributesCount: TYPES.UShort,
                'attributes[len:attributesCount]': { type: TYPES.AttributeInfo, ConstantPool }
            }));
            break;
        case ATTRIBUTES.StackMapTable:
            let vars = { offset: 0 };
            Object.assign(ret, bufferAnalyzer.analyze({
                numberOfEntries: TYPES.UShort,
                'entries[len:numberOfEntries]': { type: TYPES.StackMapFrame, ConstantPool, vars }
            }));
            break;
        case ATTRIBUTES.Exceptions:
            Object.assign(ret, bufferAnalyzer.analyze({
                exceptionsCount: TYPES.UShort,
                'exceptions[len:exceptionsCount]': { type: TYPES.ClassPtr, ConstantPool }
            }));
            break;
        case ATTRIBUTES.InnerClasses:
            Object.assign(ret, bufferAnalyzer.analyze({
                classesCount: TYPES.UShort,
                'classes[len:classesCount]': { type: TYPES.InnerClassInfo, ConstantPool }
            }));
            break;
        case ATTRIBUTES.EnclosingMethod:
            ret.classIndex = TYPES.ClassPtr(bufferAnalyzer, { ConstantPool });
            ret.methodIndex = TYPES.NameAndTypePtr(bufferAnalyzer, { ConstantPool });
            break;
        case ATTRIBUTES.Signature:
            ret.signatureIndex = TYPES.Utf8Ptr(bufferAnalyzer, { ConstantPool });
            break;
        case ATTRIBUTES.SourceFile:
            ret.sourceFileIndex = TYPES.Utf8Ptr(bufferAnalyzer, { ConstantPool });
            break;
        case ATTRIBUTES.SourceDebugExtension:
            ret.debugExtension = TYPES.String(bufferAnalyzer, { len: ret.attributeLength });
            break;
        case ATTRIBUTES.LineNumberTable:
            Object.assign(ret, bufferAnalyzer.analyze({
                lineNumberTableLength: TYPES.UShort,
                'lineNumberTable[len:lineNumberTableLength]': TYPES.LineNumber
            }));
            break;
        case ATTRIBUTES.LocalVariableTable:
            Object.assign(ret, bufferAnalyzer.analyze({
                localVariableTableLength: TYPES.UShort,
                'localVariableTable[len:localVariableTableLength]': { type: TYPES.LocalVariable, ConstantPool }
            }));
            break;
        case ATTRIBUTES.LocalVariableTypeTable:
            Object.assign(ret, bufferAnalyzer.analyze({
                localVariableTypeTableLength: TYPES.UShort,
                'localVariableTypeTable[len:localVariableTypeTableLength]': { type: TYPES.LocalVariable, ConstantPool, mode: 2 }
            }));
            break;
        case ATTRIBUTES.RuntimeInvisibleAnnotations:
        case ATTRIBUTES.RuntimeVisibleAnnotations:
            Object.assign(ret, bufferAnalyzer.analyze({
                annotationsCount: TYPES.UShort,
                'annotations[len:annotationsCount]': { type: TYPES.Annotation, ConstantPool }
            }));
            break;
        case ATTRIBUTES.RuntimeInvisibleParameterAnnotations:
        case ATTRIBUTES.RuntimeVisibleParameterAnnotations:
            Object.assign(ret, bufferAnalyzer.analyze({
                parametersCount: TYPES.UShort,
                'parameters[len:parametersCount]': { type: TYPES.ParameterAnnotations, ConstantPool }
            }));
            break;
        case ATTRIBUTES.AnnotationDefault:
            ret.defaultValue = TYPES.ElementValuePair(bufferAnalyzer, { ConstantPool, noNameIndex: 1 });
            break;
        case ATTRIBUTES.BootstrapMethods:
            break;
        case ATTRIBUTES.Deprecated:
        case ATTRIBUTES.Synthetic:
            // .. None ..
            break;
        default:
            console.warn('Unknown attributeName: ' + attributeName);
    }

    return ret;
};

TYPES.FieldInfo = fileAnalyzer => {
    return fileAnalyzer.analyze({
        accessFlags: TYPES.AccessFlagsField,
        nameIndex: TYPES.Utf8Ptr,
        descriptorIndex: TYPES.Utf8Ptr,
        attributesCount: TYPES.UShort,
        'attributes[len:attributesCount]': TYPES.AttributeInfo
    }, 1);
};

TYPES.Methods = fileAnalyzer => {
    let count = fileAnalyzer.result['MethodsCount'];
    let arr = [];

    let Short = () => TYPES.Short(fileAnalyzer, { unsigned: true, isBigEndian: true });

    for (let i = 0; i < count; i++)
    {
        let accessFlags = FileAnalyzer.FormatFlags(Short(), {
            ACC_PUBLIC: 0x0001,
            ACC_PRIVATE: 0x0002,
            ACC_PROTECTED: 0x0004,
            ACC_STATIC: 0x0008,
            ACC_FINAL: 0x0010,
            ACC_SYNCHRONIZED: 0x0020,
            ACC_BRIDGE: 0x0040,
            ACC_VARARGS: 0x0080,
            ACC_NATIVE: 0x0100,
            ACC_ABSTRACT: 0x0400,
            ACC_STRICTFP: 0x0800,
            ACC_SYNTHETIC: 0x1000
        });
        let nameIndex = Short(),
            descriptorIndex = Short(),
            attributesCount = Short();
        let attributes = [];
        for (let j = 0; j < attributesCount; j++) {
            attributes[j] = TYPES.AttributeInfo(fileAnalyzer);
        }
        arr[i] = { accessFlags, nameIndex, name: fileAnalyzer.result.ConstantPool[nameIndex].string,
            descriptorIndex, descriptor: fileAnalyzer.result.ConstantPool[descriptorIndex].string, attributesCount, attributes };
    }

    return arr;
};

TYPES.Attributes = fileAnalyzer => {
    let count = fileAnalyzer.result['AttributesCount'];
    let arr = [];

    for (let i = 0; i < count; i++)
        arr[i] = TYPES.AttributeInfo(fileAnalyzer);

    return arr;
};

module.exports = {
    '[config:bigEndian]': true,
    Magic: { type: TYPES.Buffer, len: 4 },
    MinorVer: TYPES.UShort,
    MajorVer: TYPES.UShort,
    ConstantPoolCount: TYPES.UShort,
    ConstantPool: TYPES.ConstantPool,
    AccessFlags: TYPES.AccessFlagsClass,
    ThisClass: TYPES.ClassPtr,
    SuperClass: TYPES.ClassPtr,
    InterfacesCount: TYPES.UShort,
    'Interfaces[len:InterfacesCount]': TYPES.ClassPtr,
    FieldsCount: TYPES.UShort,
    'Fields[len:FieldsCount]': TYPES.FieldInfo,
    MethodsCount: TYPES.UShort,
    Methods: TYPES.Methods,
    AttributesCount: TYPES.UShort,
    Attributes: TYPES.Attributes
};