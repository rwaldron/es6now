/*=es6now=*/(function(fn, deps, name) { if (typeof exports !== 'undefined') fn.call(typeof global === 'object' ? global : this, require, exports); else if (typeof define === 'function' && define.amd) define(['require', 'exports'].concat(deps), fn); else if (typeof window !== 'undefined' && name) fn.call(window, null, window[name] = {}); else fn.call(window || this, null, {}); })(function(require, exports) { 'use strict'; function __load(p) { var e = require(p); return typeof e === 'object' ? e : { 'default': e }; } 

var __this = this; this.es6now = {};

(function() {

/*

Provides basic support for methods added in EcmaScript 5 for EcmaScript 4 browsers.
The intent is not to create 100% spec-compatible replacements, but to allow the use
of basic ES5 functionality with predictable results.  There are features in ES5 that
require an ES5 engine (freezing an object, for instance).  If you plan to write for 
legacy engines, then don't rely on those features.

*/

var global = this,
    OP = Object.prototype,
    HOP = OP.hasOwnProperty,
    slice = Array.prototype.slice,
    TRIM_S = /^s+/,
    TRIM_E = /s+$/,
    FALSE = function() { return false; },
    TRUE = function() { return true; },
    identity = function(o) { return o; },
    defGet = OP.__defineGetter__,
    defSet = OP.__defineSetter__,
    keys = Object.keys || es4Keys,
    ENUM_BUG = !function() { var o = { constructor: 1 }; for (var i in o) return i = true; }(),
    ENUM_BUG_KEYS = [ "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor" ],
    ERR_REDUCE = "Reduce of empty array with no initial value";

// Returns the internal class of an object
function getClass(o) {

    if (o === null || o === undefined) return "Object";
    return OP.toString.call(o).slice("[object ".length, -1);
}

// Returns an array of keys defined on the object
function es4Keys(o) {

    var a = [], i;
    
    for (i in o)
        if (HOP.call(o, i))
            a.push(i);
    
    if (ENUM_BUG) 
        for (i = 0; i < ENUM_BUG_KEYS.length; ++i)
            if (HOP.call(o, ENUM_BUG_KEYS[i]))
                a.push(ENUM_BUG_KEYS[i]);
    
    return a;
}

// Sets a collection of keys, if the property is not already set
function addKeys(o, p) {

    for (var i = 0, a = keys(p), k; i < a.length; ++i) {
    
        k = a[i];
        
        if (o[k] === undefined) 
            o[k] = p[k];
    }
    
    return o;
}


// In IE8, defineProperty and getOwnPropertyDescriptor only work on DOM objects
// and are therefore useless - so bury them.
try { (Object.defineProperty || FALSE)({}, "-", { value: 0 }); }
catch (x) { Object.defineProperty = undefined; };

try { (Object.getOwnPropertyDescriptor || FALSE)({}, "-"); }
catch (x) { Object.getOwnPropertyDescriptor = undefined; }

// In IE < 9 [].slice does not work properly when the start or end arguments are undefined.
try { [0].slice(0, undefined)[0][0]; }
catch (x) {

    Array.prototype.slice = function(s, e) {
    
        s = s || 0;
        return (e === undefined ? slice.call(this, s) : slice.call(this, s, e));
    };
}

// ES5 Object functions
addKeys(Object, {

    create: function(o, p) {
    
        var n;
        
        if (o === null) {
        
            n = { "__proto__": o };
        
        } else {
        
            var f = function() {};
            f.prototype = o;
            n = new f;
        }
        
        if (p !== undefined)
            Object.defineProperties(n, p);
        
        return n;
    },
    
    keys: keys,
    
    getOwnPropertyDescriptor: function(o, p) {
    
        if (!HOP.call(o, p))
            return undefined;
        
        return { 
            value: o[p], 
            writable: true, 
            configurable: true, 
            enumerable: OP.propertyIsEnumerable.call(o, p)
        };
    },
    
    defineProperty: function(o, n, p) {
    
        var msg = "Accessor properties are not supported.";
        
        if ("get" in p) {
        
            if (defGet) defGet(n, p.get);
            else throw new Error(msg);
        }
        
        if ("set" in p) {
        
            if (defSet) defSet(n, p.set);
            else throw new Error(msg);
        }
        
        if ("value" in p)
            o[n] = p.value;
        
        return o;
    },
    
    defineProperties: function(o, d) {
    
        Object.keys(d).forEach(function(k) { Object.defineProperty(o, k, d[k]); });
        return o;
    },
    
    getPrototypeOf: function(o) {
    
        return "__proto__" in o ? o.__proto__ : o.constructor.prototype;
    },
    
    /*
    
    NOTE: getOwnPropertyNames is buggy since there is no way to get non-enumerable 
    ES3 properties.
    
    */
    
    getOwnProperyNames: keys,
    
    freeze: identity,
    seal: identity,
    preventExtensions: identity,
    isFrozen: FALSE,
    isSealed: FALSE,
    isExtensible: TRUE
    
});


// Add ES5 String extras
addKeys(String.prototype, {

    trim: function() { return this.replace(TRIM_S, "").replace(TRIM_E, ""); }
});


// Add ES5 Array extras
addKeys(Array, {

    isArray: function(obj) { return getClass(obj) === "Array"; }
});


addKeys(Array.prototype, {

    indexOf: function(v, i) {
    
        var len = this.length >>> 0;
        
        i = i || 0;
        if (i < 0) i = Math.max(len + i, 0);
        
        for (; i < len; ++i)
            if (this[i] === v)
                return i;
        
        return -1;
    },
    
    lastIndexOf: function(v, i) {
    
        var len = this.length >>> 0;
        
        i = Math.min(i || 0, len - 1);
        if (i < 0) i = len + i;
        
        for (; i >= 0; --i)
            if (this[i] === v)
                return i;
        
        return -1;
    },
    
    every: function(fn, self) {
    
        var r = true;
        
        for (var i = 0, len = this.length >>> 0; i < len; ++i)
            if (i in this && !(r = fn.call(self, this[i], i, this)))
                break;
        
        return !!r;
    },
    
    some: function(fn, self) {
    
        var r = false;
        
        for (var i = 0, len = this.length >>> 0; i < len; ++i)
            if (i in this && (r = fn.call(self, this[i], i, this)))
                break;
        
        return !!r;
    },
    
    forEach: function(fn, self) {
    
        for (var i = 0, len = this.length >>> 0; i < len; ++i)
            if (i in this)
                fn.call(self, this[i], i, this);
    },
    
    map: function(fn, self) {
    
        var a = [];
        
        for (var i = 0, len = this.length >>> 0; i < len; ++i)
            if (i in this)
                a[i] = fn.call(self, this[i], i, this);
        
        return a;
    },
    
    filter: function(fn, self) {
    
        var a = [];
        
        for (var i = 0, len = this.length >>> 0; i < len; ++i)
            if (i in this && fn.call(self, this[i], i, this))
                a.push(this[i]);
        
        return a;
    },
    
    reduce: function(fn) {
    
        var len = this.length >>> 0,
            i = 0, 
            some = false,
            ini = (arguments.length > 1),
            val = (ini ? arguments[1] : this[i++]);
        
        for (; i < len; ++i) {
        
            if (i in this) {
            
                some = true;
                val = fn(val, this[i], i, this);
            }
        }
        
        if (!some && !ini)
            throw new TypeError(ERR_REDUCE);
        
        return val;
    },
    
    reduceRight: function(fn) {
    
        var len = this.length >>> 0,
            i = len - 1,
            some = false,
            ini = (arguments.length > 1),
            val = (ini || i < 0  ? arguments[1] : this[i--]);
        
        for (; i >= 0; --i) {
        
            if (i in this) {
            
                some = true;
                val = fn(val, this[i], i, this);
            }
        }
        
        if (!some && !ini)
            throw new TypeError(ERR_REDUCE);
        
        return val;
    }
});

// Add ES5 Function extras
addKeys(Function.prototype, {

    bind: function(self) {
    
        var f = this,
            args = slice.call(arguments, 1),
            noargs = (args.length === 0);
        
        bound.prototype = f.prototype;
        return bound;
        
        function bound() {
        
            return f.apply(
                this instanceof bound ? this : self, 
                noargs ? arguments : args.concat(slice.call(arguments, 0)));
        }
    }
});

// Add ES5 Date extras
addKeys(Date, {

    now: function() { return (new Date()).getTime(); }
});

// Add ES5 Date extras
addKeys(Date.prototype, {

    toISOString: function() {
    
        function pad(s) {
        
            if ((s = "" + s).length === 1) s = "0" + s;
            return s;
        }
        
        return this.getUTCFullYear() + "-" +
            pad(this.getUTCMonth() + 1, 2) + "-" +
            pad(this.getUTCDate(), 2) + "T" +
            pad(this.getUTCHours(), 2) + ":" +
            pad(this.getUTCMinutes(), 2) + ":" +
            pad(this.getUTCSeconds(), 2) + "Z";
    },
    
    toJSON: function() {
    
        return this.toISOString();
    }
});

// Add ISO support to Date.parse
if (Date.parse(new Date(0).toISOString()) !== 0) !function() {

    /*
    
    In ES5 the Date constructor will also parse ISO dates, but overwritting 
    the Date function itself is too far.  Note that new Date(isoDateString)
    is not backward-compatible.  Use the following instead:
    
    new Date(Date.parse(dateString));
    
    1: +/- year
    2: month
    3: day
    4: hour
    5: minute
    6: second
    7: fraction
    8: +/- tz hour
    9: tz minute
    
    */
    
    var isoRE = /^(?:((?:[+-]d{2})?d{4})(?:-(d{2})(?:-(d{2}))?)?)?(?:T(d{2}):(d{2})(?::(d{2})(?:.d{3})?)?)?(?:Z|([-+]d{2}):(d{2}))?$/,
        dateParse = Date.parse;

    Date.parse = function(s) {
    
        var t, m, hasDate, i, offset;
        
        if (!isNaN(t = dateParse(s)))
            return t;
        
        if (s && (m = isoRE.exec(s))) {
        
            hasDate = m[1] !== undefined;
            
            // Convert matches to numbers (month and day default to 1)
            for (i = 1; i <= 9; ++i)
                m[i] = Number(m[i] || (i <= 3 ? 1 : 0));
            
            // Calculate ms directly if no date is provided
            if (!hasDate)
                return ((m[4] * 60 + m[5]) * 60 + m[6]) * 1000 + m[7];
            
            // Convert month to zero-indexed
            m[2] -= 1;
            
            // Get TZ offset
            offset = (m[8] * 60 + m[9]) * 60 * 1000;
            
            // Remove full match from array
            m.shift();
            
            t = Date.UTC.apply(this, m) + offset;
        }
        
        return t;
    };
            
}();


}).call(this);

(function() {

var HOP = Object.prototype.hasOwnProperty,
    STATIC = /^__static_/;

// Returns true if the object has the specified property
function hasOwn(obj, name) {

    return HOP.call(obj, name);
}

// Returns true if the object has the specified property in
// its prototype chain
function has(obj, name) {

    for (; obj; obj = Object.getPrototypeOf(obj))
        if (HOP.call(obj, name))
            return true;
    
    return false;
}

// Iterates over the descriptors for each own property of an object
function forEachDesc(obj, fn) {

    var names = Object.getOwnPropertyNames(obj), i;
    
    for (i = 0; i < names.length; ++i)
        fn(names[i], Object.getOwnPropertyDescriptor(obj, names[i]));
    
    if (Object.getOwnPropertySymbols) {
    
        names = Object.getOwnPropertySymbols(obj);
        
        for (i = 0; i < names.length; ++i)
            fn(names[i], Object.getOwnPropertyDescriptor(obj, names[i]));
    }
    
    return obj;
}

// Performs copy-based inheritance
function inherit(to, from) {

    for (; from; from = Object.getPrototypeOf(from)) {
    
        forEachDesc(from, (function(name, desc) {
        
            if (!has(to, name))
                Object.defineProperty(to, name, desc);
        }));
    }
    
    return to;
}

function defineMethods(to, from) {

    forEachDesc(from, (function(name, desc) {
    
        if (typeof name !== "string" || !STATIC.test(name))
            Object.defineProperty(to, name, desc);
    }));
}

function defineStatic(to, from) {

    forEachDesc(from, (function(name, desc) {
    
        if (typeof name === "string" &&
            STATIC.test(name) && 
            typeof desc.value === "object" && 
            desc.value) {
            
            defineMethods(to, desc.value);
        }
    }));
}

function Class(base, def) {

    var parent;
    
    if (def === void 0) {
    
        // If no base class is specified, then Object.prototype
        // is the parent prototype
        def = base;
        base = null;
        parent = Object.prototype;
    
    } else if (base === null) {
    
        // If the base is null, then then then the parent prototype is null
        parent = null;
        
    } else if (typeof base === "function") {
    
        parent = base.prototype;
        
        // Prototype must be null or an object
        if (parent !== null && Object(parent) !== parent)
            parent = void 0;
    }
    
    if (parent === void 0)
        throw new TypeError();
    
    // Generate the method collection, closing over "__super"
    var proto = Object.create(parent),
        props = def(parent),
        constructor = props.constructor;
    
    if (!constructor)
        throw new Error("No constructor specified.");
    
    // Make constructor non-enumerable
    // if none is provided
    Object.defineProperty(props, "constructor", {
    
        enumerable: false,
        writable: true,
        configurable: true,
        value: constructor
    });
    
    // Set prototype methods
    defineMethods(proto, props);
    
    // Set constructor's prototype
    constructor.prototype = proto;
    
    // Set class "static" methods
    defineStatic(constructor, props);
    
    // "Inherit" from base constructor
    if (base) inherit(constructor, base);
    
    return constructor;
}

this.es6now.Class = Class;


}).call(this);

(function() {

var global = this, 
    arraySlice = Array.prototype.slice,
    toString = Object.prototype.toString;

// === Symbols ===

var symbolCounter = 0;

function fakeSymbol() {

    return "__$" + Math.floor(Math.random() * 1e9) + "$" + (++symbolCounter) + "$__";
}

// NOTE:  As of Node 0.11.12, V8's Symbol implementation is a little wonky.
// There is no Object.getOwnPropertySymbols, so reflection doesn't seem to
// work like it should.  Furthermore, Node blows up when trying to inspect
// Symbol objects.  We expect to replace this override when V8's symbols
// catch up with the ES6 specification.

this.Symbol = fakeSymbol;

Symbol.iterator = Symbol("iterator");

this.es6now.iterator = function(obj) {

    if (global.Symbol && Symbol.iterator && obj[Symbol.iterator] !== void 0)
        return obj[Symbol.iterator]();
    
    if (Array.isArray(obj))
        return obj.values();
    
    return obj;
};

this.es6now.computed = function(obj) {

    var name, desc, i;
    
    for (i = 1; i < arguments.length; ++i) {
    
        name = "__$" + (i - 1);
        desc = Object.getOwnPropertyDescriptor(obj, name);
        
        if (!desc)
            continue;
        
        Object.defineProperty(obj, arguments[i], desc);
        delete obj[name];
    }
    
    return obj;
};

this.es6now.rest = function(args, pos) {

    return arraySlice.call(args, pos);
};

function eachKey(obj, fn) {

    var keys = Object.getOwnPropertyNames(obj),
        i;
    
    for (i = 0; i < keys.length; ++i)
        fn(keys[i]);
    
    if (!Object.getOwnPropertySymbols)
        return;
    
    keys = Object.getOwnPropertySymbols(obj);
    
    for (i = 0; i < keys.length; ++i)
        fn(keys[i]);
}

function addMethods(obj, methods) {

    eachKey(methods, (function(key) {
    
        if (key in obj)
            return;
        
        Object.defineProperty(obj, key, {
        
            value: methods[key],
            configurable: true,
            enumerable: false,
            writable: true
        });
    }));
}


// === Object ===

addMethods(Object, {

    is: function(left, right) {
    
        if (left === right)
            return left !== 0 || 1 / left === 1 / right;
        
        return left !== left && right !== right;
    },
    
    assign: function(target, source) {
    
        Object.keys(source).forEach((function(key) { return target[key] = source[key]; }));
        return target;
    }
    
});

// === Number ===

addMethods(Number, {

    EPSILON: ((function($) {
    
        var next, result;
        
        for (next = 1; 1 + next !== 1; next = next / 2)
            result = next;
        
        return result;
        
    }))(),
    
    MAX_SAFE_INTEGER: 9007199254740992,
    
    MIN_SAFE_INTEGER: -9007199254740991,
    
    isInteger: function(val) {
    
        typeof val === "number" && val | 0 === val;
    }
    
    // TODO: isSafeInteger
    
});

// === String === 

addMethods(String, {

    raw: function(callsite) { var args = es6now.rest(arguments, 1);
    
        var raw = callsite.raw,
            len = raw.length >>> 0;
        
        if (len === 0)
            return "";
            
        var s = "", i = 0;
        
        while (true) {
        
            s += raw[i];
        
            if (i + 1 === len)
                return s;
        
            s += args[i++];
        }
    }
    
    // TODO:  fromCodePoint
    
});

addMethods(String.prototype, {
    
    repeat: function(count) {
    
        if (this == null)
            throw TypeError();
        
        var n = count ? Number(count) : 0;
        
        if (isNaN(n))
            n = 0;
        
        // Account for out-of-bounds indices
        if (n < 0 || n == Infinity)
            throw RangeError();
        
        if (n == 0)
            return "";
            
        var result = "";
        
        while (n--)
            result += this;
        
        return result;
    },
    
    startsWith: function(search) {
    
        var string = String(this);
        
        if (this == null || toString.call(search) == "[object RegExp]")
            throw TypeError();
            
        var stringLength = this.length,
            searchString = String(search),
            searchLength = searchString.length,
            position = arguments.length > 1 ? arguments[1] : undefined,
            pos = position ? Number(position) : 0;
            
        if (isNaN(pos))
            pos = 0;
        
        var start = Math.min(Math.max(pos, 0), stringLength);
        
        return this.indexOf(searchString, pos) == start;
    },
    
    endsWith: function(search) {
    
        if (this == null || toString.call(search) == '[object RegExp]')
            throw TypeError();
        
        var stringLength = this.length,
            searchString = String(search),
            searchLength = searchString.length,
            pos = stringLength;
        
        if (arguments.length > 1) {
        
            var position = arguments[1];
        
            if (position !== undefined) {
        
                pos = position ? Number(position) : 0;
                
                if (isNaN(pos))
                    pos = 0;
            }
        }
        
        var end = Math.min(Math.max(pos, 0), stringLength),
            start = end - searchLength;
        
        if (start < 0)
            return false;
            
        return this.lastIndexOf(searchString, start) == start;
    },
    
    contains: function(search) {
    
        if (this == null)
            throw TypeError();
            
        var stringLength = this.length,
            searchString = String(search),
            searchLength = searchString.length,
            position = arguments.length > 1 ? arguments[1] : undefined,
            pos = position ? Number(position) : 0;
        
        if (isNaN(pos))
            pos = 0;
            
        var start = Math.min(Math.max(pos, 0), stringLength);
        
        return this.indexOf(string, searchString, pos) != -1;
    }
    
    // TODO: codePointAt
    
});

// === Array ===

var ArrayIterator = es6now.Class(function(__super) { return es6now.computed({

    constructor: function ArrayIterator(array, kind) {
    
        this.array = array;
        this.current = 0;
        this.kind = kind;
    },
    
    next: function() {
    
        var length = this.array.length >>> 0,
            index = this.current;
        
        if (index >= length) {
        
            this.current = Infinity;
            return { value: void 0, done: true };
        }
        
        this.current += 1;
        
        switch (this.kind) {
        
            case "values":
                return { value: this.array[index], done: false };
            
            case "entries":
                return { value: [ index, this.array[index] ], done: false };
            
            default:
                return { value: index, done: false };
        }
    },
    
    __$0: function() { return this }

}, Symbol.iterator) });

addMethods(Array.prototype, es6now.computed({

    values: function() { return new ArrayIterator(this, "values") },
    entries: function() { return new ArrayIterator(this, "entries") },
    keys: function() { return new ArrayIterator(this, "keys") },
    __$0: function() { return this.values() }
}, Symbol.iterator));


}).call(this);

(function() { var __this = this;

var enqueueMicrotask = ((function($) {

    var window = __this.window,
        process = __this.process,
        msgChannel = null,
        list = [];
    
    if (typeof setImmediate === "function") {
    
        return window ?
            window.setImmediate.bind(window) :
            setImmediate;
    
    } else if (process && typeof process.nextTick === "function") {
    
        return process.nextTick;
        
    } else if (window && window.MessageChannel) {
        
        msgChannel = new window.MessageChannel();
        msgChannel.port1.onmessage = (function($) { if (list.length) list.shift()(); });
    
        return (function(fn) {
        
            list.push(fn);
            msgChannel.port2.postMessage(0);
        });
    }
    
    return (function(fn) { return setTimeout(fn, 0); });

}))();

// The following property names are used to simulate the internal data
// slots that are defined for Promise objects.

var $status = "Promise#status",
    $value = "Promise#value",
    $onResolve = "Promise#onResolve",
    $onReject = "Promise#onReject";

// The following property name is used to simulate the built-in symbol @@isPromise
var $$isPromise = "@@isPromise";

function isPromise(x) { 

    return !!x && $$isPromise in Object(x);
}

function promiseDefer(ctor) {

    var d = {};

    d.promise = new ctor((function(resolve, reject) {
        d.resolve = resolve;
        d.reject = reject;
    }));

    return d;
}

function promiseChain(promise, onResolve, onReject) {

    if (typeof onResolve !== "function") onResolve = (function(x) { return x; });
    if (typeof onReject !== "function") onReject = (function(e) { throw e });

    var deferred = promiseDefer(promise.constructor);
    
    if (typeof promise[$status] !== "string")
        throw new TypeError("Promise method called on a non-promise");

    switch (promise[$status]) {

        case "pending":
            promise[$onResolve].push([deferred, onResolve]);
            promise[$onReject].push([deferred, onReject]);
            break;

        case "resolved":
            promiseReact(deferred, onResolve, promise[$value]);
            break;
    
        case "rejected":
            promiseReact(deferred, onReject, promise[$value]);
            break;
    }

    return deferred.promise;
}

function promiseResolve(promise, x) {
    
    promiseDone(promise, "resolved", x, promise[$onResolve]);
}

function promiseReject(promise, x) {
    
    promiseDone(promise, "rejected", x, promise[$onReject]);
}

function promiseDone(promise, status, value, reactions) {

    if (promise[$status] !== "pending") 
        return;
        
    promise[$status] = status;
    promise[$value] = value;
    promise[$onResolve] = promise[$onReject] = void 0;
    
    for (var i = 0; i < reactions.length; ++i) 
        promiseReact(reactions[i][0], reactions[i][1], value);
}

function promiseUnwrap(deferred, x) {

    if (x === deferred.promise)
        throw new TypeError("Promise cannot wrap itself");
    
    if (isPromise(x))
        promiseChain(x, deferred.resolve, deferred.reject);
    else
        deferred.resolve(x);
}

function promiseReact(deferred, handler, x) {

    enqueueMicrotask((function($) {
    
        try { promiseUnwrap(deferred, handler(x)) } 
        catch(e) { try { deferred.reject(e) } catch (e) { } }
    }));
}

var Promise = es6now.Class(function(__super) { return {

    constructor: function Promise(init) { var __this = this;
    
        if (typeof init !== "function")
            throw new TypeError("Promise constructor called without initializer");
        
        this[$value] = void 0;
        this[$status] = "pending";
        this[$onResolve] = [];
        this[$onReject] = [];
    
        var resolve = (function(x) { return promiseResolve(__this, x); }),
            reject = (function(r) { return promiseReject(__this, r); });
        
        try { init(resolve, reject) } catch (x) { reject(x) }
    },
    
    chain: function(onResolve, onReject) {
    
        return promiseChain(this, onResolve, onReject);
    },
    
    then: function(onResolve, onReject) {

        if (typeof onResolve !== "function") onResolve = (function(x) { return x; });
        
        return promiseChain(this, (function(x) {
    
            if (x && typeof x === "object") {
            
                var maybeThen = x.then;
                
                if (typeof maybeThen === "function")
                    return maybeThen.call(x, onResolve, onReject);
            }
                        
            return onResolve(x);
        
        }), onReject);
        
    },
    
    catch: function(onReject) {
    
        return this.then(void 0, onReject);
    },
    
    __static_0: { isPromise: function(x) {
        
        return isPromise(x);
    } },
    
    __static_1: { defer: function() {
    
        return promiseDefer(this);
    } },
    
    __static_2: { accept: function(x) {
    
        var d = promiseDefer(this);
        d.resolve(x);
        return d.promise;
    } },
    
    __static_3: { resolve: function(x) { 
    
        if (isPromise(x))
            return x;
            
        var d = promiseDefer(this);
        d.resolve(x);
        return d.promise;
    } },
    
    __static_4: { reject: function(x) { 
    
        var d = promiseDefer(this);
        d.reject(x);
        return d.promise;
    } },

    __static_5: { all: function(values) {

        // TODO: We should be getting an iterator from values
        
        var deferred = promiseDefer(this),
            count = values.length,
            resolutions = [];
            
        try {
        
            if (!Array.isArray(values))
                throw new Error("Invalid argument");
        
            var count = values.length;
        
            if (count === 0) {
        
                deferred.resolve(resolutions);
            
            } else {
        
                for (var i = 0; i < values.length; ++i)
                    this.resolve(values[i]).then(onResolve(i), deferred.reject);
            }
            
        } catch(x) { deferred.reject(x) }
        
        return deferred.promise;
        
        function onResolve(i) {
    
            return (function(x) {
        
                resolutions[i] = x;
            
                if (--count === 0)
                    deferred.resolve(resolutions);
            });
        }
    } },
    
    __static_6: { race: function(values) {
    
        // TODO: We should be getting an iterator from values
        
        var deferred = promiseDefer(this);
        
        try {
        
            if (!Array.isArray(values))
                throw new Error("Invalid argument");
            
            for (var i = 0; i < values.length; ++i)
                this.resolve(values[i]).then(deferred.resolve, deferred.reject);
        
        } catch(x) { deferred.reject(x) }
        
        return deferred.promise;
    } }
    
} });

Promise.prototype[$$isPromise] = true;

this.Promise = Promise;


}).call(this);

(function() {

this.es6now.async = function(iterable) {
    
    var iter = es6now.iterator(iterable),
        resolver,
        promise;
    
    promise = new Promise((function(resolve, reject) { return resolver = { resolve: resolve, reject: reject }; }));
    resume(void 0, false);
    return promise;
    
    function resume(value, error) {
    
        if (error && !("throw" in iter))
            return resolver.reject(value);
        
        try {
        
            // Invoke the iterator/generator
            var result = error ? iter.throw(value) : iter.next(value),
                value = result.value,
                done = result.done;
            
            if (Promise.isPromise(value)) {

                if (done) value.chain(resolver.resolve, resolver.reject);
                else      value.chain((function(x) { return resume(x, false); }), (function(x) { return resume(x, true); }));
            
            } else if (done) {
                
                resolver.resolve(value);
                
            } else {
            
                resume(value, false);
            }
            
        } catch (x) { resolver.reject(x) }
        
    }
};


}).call(this);



}, [], "");