import * as _$2 from './core.js';

function Nil() {}
Nil.prototype[Symbol.toStringTag] = "Nil";
function isNil(x) {
  return x == null;
}
function isSome(x) {
  return x != null;
}
function nil() {
  return null;
}
Object.defineProperty(Nil, Symbol.hasInstance, {
  value: isNil
});

const unbind = Function.call.bind(Function.bind, Function.call);
const slice = unbind(Array.prototype.slice);
const indexOf = unbind(Array.prototype.indexOf);
function type(self) {
  return self == null ? Nil : self.constructor;
}
function isFunction(f) {
  return typeof f === "function";
}
function isSymbol(self) {
  return typeof self === "symbol";
}
function isString(self) {
  return typeof self === "string";
}
function noop$1() {}
function identity(x) {
  return x;
}
function constantly(x) {
  return function () {
    return x;
  };
}
function complement(f) {
  return function () {
    return !f.apply(this, arguments);
  };
}
function invokes(self, method, ...args) {
  return self[method].apply(self, args);
}
function overload() {
  const fs = arguments,
    fallback = fs[fs.length - 1];
  return function () {
    const f = fs[arguments.length] || (arguments.length >= fs.length ? fallback : null);
    return f.apply(this, arguments);
  };
}
function comp() {
  const fs = arguments,
    start = fs.length - 2,
    f = fs[fs.length - 1];
  return function () {
    let memo = f.apply(this, arguments);
    for (let i = start; i > -1; i--) {
      const f = fs[i];
      memo = f.call(this, memo);
    }
    return memo;
  };
}
function pipeN(f, ...fs) {
  return function () {
    let memo = f.apply(this, arguments);
    for (const f of fs) {
      memo = f.call(this, memo);
    }
    return memo;
  };
}
const pipe = overload(constantly(identity), identity, pipeN);
function chain(value, ...fs) {
  const f = pipe(...fs);
  return f(value);
}
function handle() {
  const handlers = slice(arguments, 0, arguments.length - 1),
    fallback = arguments[arguments.length - 1];
  return function () {
    for (let handler of handlers) {
      const check = handler[0];
      if (check.apply(this, arguments)) {
        const fn = handler[1];
        return fn.apply(this, arguments);
      }
    }
    return fallback.apply(this, arguments);
  };
}
function assume(pred, obj, f) {
  return handle([pred, f], partial(f, obj));
}
function subj(f, len) {
  //subjective
  const length = len || f.length;
  return function (...ys) {
    return ys.length >= length ? f.apply(null, ys) : function (...xs) {
      return f.apply(null, xs.concat(ys));
    };
  };
}
function obj(f, len) {
  //objective
  const length = len || f.length;
  return function (...xs) {
    return xs.length >= length ? f.apply(null, xs) : function (...ys) {
      return f.apply(null, xs.concat(ys));
    };
  };
}
function curry1(f) {
  return curry2(f, f.length);
}
function curry2(f, minimum) {
  return function (...args) {
    const xs = args.length ? args : [undefined]; //each invocation assumes advancement
    if (xs.length >= minimum) {
      return f.apply(this, xs);
    } else {
      return curry2(function (...ys) {
        return f.apply(this, [...xs, ...ys]);
      }, minimum - xs.length);
    }
  };
}
const curry = overload(null, curry1, curry2);
function plugging(placeholder) {
  return function plug(f, ...xs) {
    //provides values and/or placeholders and return a fn which defers realization until all placeholders are supplied
    const n = xs.length;
    return xs.indexOf(placeholder) < 0 ? f.apply(null, xs) : function (...ys) {
      const zs = [];
      for (let i = 0; i < n; i++) {
        let x = xs[i];
        zs.push(x === placeholder && ys.length ? ys.shift() : x);
      }
      return plug.apply(null, [f, ...zs, ...ys]);
    };
  };
}
const placeholder = {};
const plug = plugging(placeholder);
function partial(f, ...xs) {
  return function (...ys) {
    return f.apply(this, [...xs, ...ys]);
  };
}
function partly(f) {
  return partial(plug, f);
}
function deferring(f) {
  return function (...args) {
    return partial(f, ...args);
  };
}
function factory(f, ...args) {
  return deferring(partial(f, ...args));
}
function multi(dispatch) {
  return function (...args) {
    const f = dispatch.apply(this, args);
    if (!f) {
      throw Error("Failed dispatch");
    }
    return f.apply(this, args);
  };
}
function tee(f) {
  return function (value) {
    f(value);
    return value;
  };
}
function see(...labels) {
  return tee(partial(console.log, ...labels));
}
function doto(obj, ...effects) {
  const len = effects.length;
  for (let i = 0; i < len; i++) {
    const effect = effects[i];
    effect(obj);
  }
  return obj;
}
function does(...effects) {
  const len = effects.length;
  return function doing(...args) {
    for (let i = 0; i < len; i++) {
      const effect = effects[i];
      effect(...args);
    }
  };
}
function unspread(f) {
  return function (...args) {
    return f(args);
  };
}
function once(f) {
  const pending = {};
  let result = pending;
  return function (...args) {
    if (result === pending) {
      result = f(...args);
    }
    return result;
  };
}
function execute(f, ...args) {
  return f.apply(this, args);
}
function applying(...args) {
  return function (f) {
    return f.apply(this, args);
  };
}
function constructs(Type) {
  return function (...args) {
    return new (Function.prototype.bind.apply(Type, [null].concat(args)))();
  };
}
function branch3(pred, yes, no) {
  return function (...args) {
    return pred(...args) ? yes(...args) : no(...args);
  };
}
function branchN(pred, f, ...fs) {
  return function (...args) {
    return pred(...args) ? f(...args) : branch(...fs)(...args);
  };
}
const branch = overload(null, null, null, branch3, branchN);
function guard1(pred) {
  return guard2(pred, identity);
}
function guard2(pred, f) {
  return branch3(pred, f, noop$1);
}
function guard3(value, pred, f) {
  var _value;
  return _value = value, guard2(pred, f)(_value);
}
const guard = overload(null, guard1, guard2, guard3);
function memoize1(f) {
  return memoize2(f, function (...args) {
    return JSON.stringify(args);
  });
}
function memoize2(f, hash) {
  const cache = {};
  return function () {
    const key = hash.apply(this, arguments);
    if (cache.hasOwnProperty(key)) {
      return cache[key];
    } else {
      const result = f.apply(this, arguments);
      cache[key] = result;
      return result;
    }
  };
}
const memoize = overload(null, memoize1, memoize2);
function isNative(f) {
  return /\{\s*\[native code\]\s*\}/.test('' + f);
}
function toggles4(on, off, want, self) {
  return want(self) ? on(self) : off(self);
}
function toggles5(on, off, _, self, want) {
  return want ? on(self) : off(self);
}
const toggles = overload(null, null, null, null, toggles4, toggles5);
function detach(method) {
  return function (obj, ...args) {
    return obj[method](...args);
  };
}
function attach(f) {
  return function (...args) {
    return f.apply(null, [this, ...args]);
  };
}
function PreconditionError(f, pred, args) {
  this.f = f;
  this.pred = pred;
  this.args = args;
}
PreconditionError.prototype = new Error();
function PostconditionError(f, pred, args, result) {
  this.f = f;
  this.pred = pred;
  this.args = args;
  this.result = result;
}
PostconditionError.prototype = new Error();
function pre(f, pred) {
  return function () {
    if (!pred.apply(this, arguments)) {
      throw new PreconditionError(f, pred, arguments);
    }
    return f.apply(this, arguments);
  };
}
function post(f, pred) {
  return function () {
    const result = f.apply(this, arguments);
    if (!pred(result)) {
      throw new PostconditionError(f, pred, arguments, result);
    }
    return result;
  };
}
function nullary(f) {
  return function () {
    return f();
  };
}
function unary(f) {
  return function (a) {
    return f(a);
  };
}
function binary(f) {
  return function (a, b) {
    return f(a, b);
  };
}
function ternary(f) {
  return function (a, b, c) {
    return f(a, b, c);
  };
}
function quaternary(f) {
  return function (a, b, c, d) {
    return f(a, b, c, d);
  };
}
function nary(f, length) {
  return function () {
    return f(...slice(arguments, 0, length));
  };
}
function arity(f, length) {
  return ([nullary, unary, binary, ternary, quaternary][length] || nary)(f, length);
}
function fold(f, init, xs) {
  let memo = init;
    xs.length - 1;
    let r = {};
  for (const x of xs) {
    if (memo === r) break;
    memo = f(memo, x, function (reduced) {
      return r = reduced;
    });
  }
  return memo;
}
function foldkv(f, init, xs) {
  let memo = init,
    len = xs.length,
    r = {};
  for (let i = 0; i < len; i++) {
    if (memo === r) break;
    memo = f(memo, i, xs[i], function (reduced) {
      return r = reduced;
    });
  }
  return memo;
}
function posn(...xfs) {
  return function (arr) {
    return foldkv(function (memo, idx, xf) {
      const val = arr[idx];
      memo.push(xf ? xf(val) : val);
      return memo;
    }, [], xfs);
  };
}
function signature(...preds) {
  return function (...values) {
    return foldkv(function (memo, idx, pred, reduced) {
      return memo ? !pred || pred(values[idx]) : reduced(memo);
    }, preds.length === values.length, preds);
  };
}
function signatureHead(...preds) {
  return function (...values) {
    return foldkv(function (memo, idx, value, reduced) {
      let pred = preds[idx];
      return memo ? !pred || pred(value) : reduced(memo);
    }, true, values);
  };
}
function and(...preds) {
  return function (...args) {
    return fold(function (memo, pred, reduced) {
      return memo ? pred(...args) : reduced(memo);
    }, true, preds);
  };
}
function or(...preds) {
  return function (...args) {
    return fold(function (memo, pred, reduced) {
      return memo ? reduced(memo) : pred(...args);
    }, false, preds);
  };
}
function both(memo, value) {
  return memo && value;
}
function either(memo, value) {
  return memo || value;
}
function isIdentical(x, y) {
  return x === y; //TODO Object.is?
}

function everyPred(...preds) {
  return function () {
    return fold(function (memo, arg) {
      return fold(function (memo, pred, reduced) {
        let result = memo && pred(arg);
        return result ? result : reduced(result);
      }, memo, preds);
    }, true, slice(arguments));
  };
}
function someFn1(p) {
  function f1(x) {
    return p(x);
  }
  function f2(x, y) {
    return p(x) || p(y);
  }
  function f3(x, y, z) {
    return p(x) || p(y) || p(z);
  }
  function fn(x, y, z, ...args) {
    return f3(x, y, z) || some(p, args);
  }
  return overload(constantly(null), f1, f2, f3, fn);
}
function someFn2(p1, p2) {
  function f1(x) {
    return p1(x) || p2(x);
  }
  function f2(x, y) {
    return p1(x) || p1(y) || p2(x) || p2(y);
  }
  function f3(x, y, z) {
    return p1(x) || p1(y) || p1(z) || p2(x) || p2(y) || p2(z);
  }
  function fn(x, y, z, ...args) {
    return f3(x, y, z) || some(or(p1, p2), args);
  }
  return overload(constantly(null), f1, f2, f3, fn);
}
function someFnN(...ps) {
  function fn(...args) {
    return some(or(...ps), args);
  }
  return overload(constantly(null), fn);
}
const someFn = overload(null, someFn1, someFn2, someFnN);
function folding1(f) {
  return folding2(f, identity);
}
function folding2(f, order) {
  return function (x, ...xs) {
    return fold(f, x, order(xs));
  };
}
const folding = overload(null, folding1, folding2);
const all = overload(null, identity, both, folding1(both));
const any = overload(null, identity, either, folding1(either));
function everyPair(pred, xs) {
  let every = xs.length > 0;
  while (every && xs.length > 1) {
    every = pred(xs[0], xs[1]);
    xs = slice(xs, 1);
  }
  return every;
}

function addMeta(target, key, value) {
  try {
    Object.defineProperty(target, key, {
      //unsupported on some objects like Location
      configurable: true,
      enumerable: false,
      writable: true,
      value: value
    });
  } catch (ex) {
    target[key] = value;
  }
}
const TEMPLATE = Symbol("@protocol-template"),
  INDEX = Symbol("@protocol-index"),
  MISSING = Symbol("@protocol-missing");
function protocol(template) {
  const p = new Protocol({}, {});
  p.extend(template);
  return p;
}
function Protocol(template, index) {
  this[INDEX] = index;
  this[TEMPLATE] = template;
}
function extend$1(template) {
  for (let method in template) {
    this[method] = this.dispatch(method);
  }
  Object.assign(this[TEMPLATE], template);
}
function dispatch(method) {
  const protocol = this;
  return function (self, ...args) {
    const f = satisfies2.call(protocol, method, self);
    if (!f) {
      throw new ProtocolLookupError(protocol, method, self, args);
    }
    return f.apply(null, [self, ...args]);
  };
}
function generate$1() {
  const index = this[INDEX];
  return function (method) {
    const sym = index[method] || Symbol(method);
    index[method] = sym;
    return sym;
  };
}
function keys$c() {
  return Object.keys(this[TEMPLATE]);
}
function specify1(behavior) {
  const protocol = this;
  return function (target) {
    specify2.call(protocol, behavior, target);
  };
}
function specify2(behavior, target) {
  if (this == null) {
    throw new Error("Protocol not specified.");
  }
  if (behavior == null || typeof behavior != "object") {
    throw new Error("Behavior must be an object map.");
  }
  if (target == null) {
    throw new Error("Subject not specified.");
  }
  const keys = this.generate();
  addMeta(target, keys("__marker__"), this);
  for (let method in behavior) {
    if (!this[method]) {
      throw new Error("Foreign behavior specified: " + method);
    }
    addMeta(target, keys(method), behavior[method]);
  }
}
const specify$1 = overload(null, specify1, specify2);
function unspecify1(behavior) {
  const protocol = this;
  return function (target) {
    unspecify2.call(protocol, behavior, target);
  };
}
function unspecify2(behavior, target) {
  const keys = this.generate();
  addMeta(target, keys("__marker__"), undefined);
  for (let method in behavior) {
    addMeta(target, keys(method), undefined);
  }
}
const unspecify$1 = overload(null, unspecify1, unspecify2);
function implement0() {
  return implement1.call(this, {}); //marker interface
}

function implement1(obj) {
  const behavior = obj.behaves ? obj.behaves(this) : obj;
  if (obj.behaves && !behavior) {
    throw new Error("Unable to borrow behavior.");
  }
  return Object.assign(implement2.bind(this, behavior), {
    protocol: this,
    behavior: behavior
  });
}
function implement2(behavior, target) {
  let tgt = target.prototype;
  if (tgt.constructor === Object) {
    tgt = Object;
  }
  specify2.call(this, behavior, tgt);
}
const implement$1 = overload(implement0, implement1, implement2);
function satisfies0() {
  return this.satisfies.bind(this);
}
function satisfies1(obj) {
  const target = obj == null ? new Nil() : obj,
    key = this[INDEX]["__marker__"] || MISSING;
  return target[key] || (target.constructor === Object ? target.constructor[key] : null);
}

//Everything inherits from Object.  The behaviors added to Object target only literals (e.g. `{}`) not everything!
function satisfies2(method, obj) {
  const target = obj == null ? new Nil() : obj,
    key = this[INDEX][method] || MISSING;
  return target[key] || (target.constructor === Object ? target.constructor[key] : null) || this[TEMPLATE][method];
}
const satisfies$1 = overload(satisfies0, satisfies1, satisfies2);
Object.assign(Protocol.prototype, {
  extend: extend$1,
  dispatch,
  generate: generate$1,
  keys: keys$c,
  specify: specify$1,
  unspecify: unspecify$1,
  implement: implement$1,
  satisfies: satisfies$1
});
Protocol.prototype[Symbol.toStringTag] = "Protocol";
class ProtocolLookupError extends Error {
  constructor(protocol, method, subject, args) {
    super(`Protocol lookup for ${method} failed.`);
    this.protocol = protocol;
    this.method = method;
    this.subject = subject;
    this.args = args;
    this.name = this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return "ProtocolLookupError";
  }
  toString() {
    return this.message;
  }
}

const extend = unbind(Protocol.prototype.extend);
const satisfies = unbind(Protocol.prototype.satisfies);
const specify = unbind(Protocol.prototype.specify);
const unspecify = unbind(Protocol.prototype.unspecify);
const implement = unbind(Protocol.prototype.implement);
function reifiable(properties) {
  function Reifiable(properties) {
    Object.assign(this, properties);
  }
  return new Reifiable(properties || {});
}
function behaves(behaviors, env, callback) {
  for (let key in behaviors) {
    if (key in env) {
      const type = env[key],
        behave = behaviors[key];
      callback && callback(type, key, behave); //for logging
      behave(type);
    }
  }
}
function forward1(key) {
  return function forward(f) {
    return function (self, ...args) {
      return f.apply(this, [self[key], ...args]);
    };
  };
}
function forwardN(target, ...protocols) {
  const fwd = forward1(target);
  const behavior = fold(function (memo, protocol) {
    memo.push(implement(protocol, fold(function (memo, key) {
      memo[key] = fwd(protocol[key]);
      return memo;
    }, {}, protocol.keys() || [])));
    return memo;
  }, [], protocols);
  return does(...behavior);
}
const forward = overload(null, forward1, forwardN);

const IAddable = protocol({
  add: null
});

const IAppendable = protocol({
  append: null
});

const IAssociative = protocol({
  assoc: null,
  contains: null
});

const blank$5 = constantly(false);
const IBlankable = protocol({
  blank: blank$5
});

const IBounded = protocol({
  start: null,
  end: null
});

function clone$6(self) {
  return Object.assign(Object.create(self.constructor.prototype), self);
}
const ICloneable = protocol({
  clone: clone$6
});

const IFn = protocol({
  invoke: null
});

const IDeref = protocol({
  deref: null
});

const ISwappable = protocol({
  swap: null
});

const invoke$3 = IFn.invoke;
function invokable(obj) {
  let state = obj;
  function invoke(self, ...args) {
    return IFn.invoke(state, ...args);
  }
  function swap(self, f) {
    state = f(state);
  }
  function deref(self) {
    return state;
  }
  return doto(partial(invoke, null), specify(IFn, {
    invoke
  }), specify(ISwappable, {
    swap
  }), specify(IDeref, {
    deref
  }));
}

const IMapEntry = protocol({
  key: null,
  val: null
});

const IHashable = protocol({
  hash: null
});

function equiv$c(x, y) {
  return x === y;
}
const IEquiv = protocol({
  equiv: equiv$c
});

const cache = Symbol("hashcode");
function hashTag() {
  const tag = Math.random(0);
  return function (self) {
    if (!self[cache]) {
      self[cache] = tag;
    }
  };
}
function hash$7(self) {
  if (self == null) {
    return 0;
  } else if (self.hashCode) {
    return self.hashCode();
  } else if (self[cache]) {
    return self[cache];
  }
  const hash = satisfies(IHashable, "hash", self);
  if (hash) {
    const hashcode = hash(self);
    return Object.isFrozen(self) ? hashcode : self[cache] = hashcode;
  } else {
    hashTag()(self);
    return self[cache];
  }
}
function _IsValueObject(maybeValue) {
  //from ImmutableJS
  return Boolean(maybeValue && typeof maybeValue.equals === 'function' && typeof maybeValue.hashCode === 'function');
}
function isValueObject(self) {
  return satisfies(IHashable, self) && satisfies(IEquiv, self) || _IsValueObject(self);
}

const key$3 = IMapEntry.key;
const val$2 = IMapEntry.val;
function is(self, constructor) {
  return type(self) === constructor;
}
function ako(self, constructor) {
  return self instanceof constructor;
}
function keying(label) {
  if (!isString(label)) {
    throw new Error("Label must be a string");
  }
  return does(hashTag(), label ? function (Type) {
    Type[Symbol.toStringTag] = label;
  } : noop);
}

function Multimethod(dispatch, methods, fallback) {
  this.dispatch = dispatch;
  this.methods = methods;
  this.fallback = fallback;
}
function multimethod(dispatch, fallback) {
  return new Multimethod(dispatch, {}, fallback);
}

function addMethod(self, key, handler) {
  const hashcode = hash$7(key);
  const potentials = self.methods[hashcode] = self.methods[hashcode] || [];
  potentials.push([key, handler]);
  return self;
}

var _mm, _invoke;
function key$2(self) {
  if (satisfies(IMapEntry, "key", self)) {
    return key$3(self);
  } else {
    return self; //coercible fallback
  }
}

//hide the details of using `key` for potential cross-realm compatibility
const mm = multimethod(function (source, Type) {
  return [key$2(type(source)), key$2(Type)];
});
const coerce$2 = (_invoke = invoke$3, _mm = mm, function invoke(_argPlaceholder, _argPlaceholder2) {
  return _invoke(_mm, _argPlaceholder, _argPlaceholder2);
});
const ICoercible = protocol({
  coerce: coerce$2
});
ICoercible.addMethod = function addMethod$1(match, f) {
  if (match == null) {
    return mm;
  } else if (typeof match === "function") {
    return function (Type) {
      addMethod$1(match(Type), f);
    };
  } else {
    const [from, to] = match;
    addMethod(mm, [key$2(from), key$2(to)], f);
  }
};

const ICollection = protocol({
  conj: null,
  unconj: null
});

const ICompactible = protocol({
  compact: null
});

function compare$7(x, y) {
  return x > y ? 1 : x < y ? -1 : 0;
}
const IComparable = protocol({
  compare: compare$7
});

const IMultipliable = protocol({
  mult: null
});

const IReducible = protocol({
  reduce: null
});

const ISeq = protocol({
  first: null,
  rest: null
});

function reduce2$1(f, coll) {
  return reduce3$1(f, ISeq.first(coll), ISeq.rest(coll));
}
function reduce3$1(f, init, coll) {
  return IReducible.reduce(coll, f, init);
}
const reduce$f = overload(null, null, reduce2$1, reduce3$1);
function reducing1(f) {
  return reducing2(f, identity);
}
function reducing2(f, order) {
  return function (x, ...xs) {
    return reduce3$1(f, x, order(xs));
  };
}
const reducing = overload(null, reducing1, reducing2);

const mult$2 = overload(constantly(1), identity, IMultipliable.mult, reducing(IMultipliable.mult));

function inverse$4(self) {
  return IMultipliable.mult(self, -1);
}
const IInversive = protocol({
  inverse: inverse$4
});

const ICounted = protocol({
  count: null
});

const IDisposable = protocol({
  dispose: null
});

const IDivisible = protocol({
  divide: null
});

const IEmptyableCollection = protocol({
  empty: null
});

const IFind = protocol({
  find: null
});

const IFunctor = protocol({
  fmap: null
});

function flatMap$4(self, f) {
  var _f, _IFunctor$fmap, _IFunctor;
  return chain(self, IFlatMappable.flat, (_IFunctor = IFunctor, _IFunctor$fmap = _IFunctor.fmap, _f = f, function fmap(_argPlaceholder) {
    return _IFunctor$fmap.call(_IFunctor, _argPlaceholder, _f);
  }));
}
const IFlatMappable = protocol({
  flat: null,
  flatMap: flatMap$4
});

const IForkable = protocol({
  fork: null
});

const IHierarchy = protocol({
  root: null,
  parent: null,
  parents: null,
  closest: null,
  children: null,
  descendants: null,
  siblings: null,
  nextSibling: null,
  nextSiblings: null,
  prevSibling: null,
  prevSiblings: null
});

const IIdentifiable = protocol({
  identifier: null //machine-friendly name (lowercase, no embedded spaces) offering reasonable uniqueness within a context
});

const IInclusive = protocol({
  includes: null
});

const IIndexed = protocol({
  nth: null,
  idx: null
});

const IInsertable = protocol({
  before: null,
  after: null
});

const IKVReducible = protocol({
  reducekv: null
});

var _config = {
  logger: console
};

function log$1(...args) {
  ILogger.log(_config.logger, ...args);
}
const ILogger = protocol({
  log: log$1
});

function lookup$9(self, key) {
  return self && self[key];
}
const ILookup = protocol({
  lookup: lookup$9
});

const IMap = protocol({
  dissoc: null,
  keys: null,
  vals: null
});

const coerce$1 = ICoercible.coerce;

var _Array, _coerce$1;
function isArray(self) {
  return is(self, Array);
}
const toArray = (_coerce$1 = coerce$1, _Array = Array, function coerce(_argPlaceholder) {
  return _coerce$1(_argPlaceholder, _Array);
});

function reducekv2(f, coll) {
  return IKVReducible.reducekv(coll, f, f());
}
function reducekv3(f, init, coll) {
  return IKVReducible.reducekv(coll, f, init);
}
const reducekv$a = overload(null, null, reducekv2, reducekv3);

function Reduced(value) {
  this.value = value;
}
Reduced.prototype[Symbol.toStringTag] = "Reduced";
Reduced.prototype.valueOf = function () {
  return this.value;
};
function reduced$1(value) {
  return new Reduced(value);
}

function first0() {
  //transducer
  return function (rf) {
    return overload(rf, rf, function (memo, value) {
      return reduced$1(rf(rf(memo, value)));
    });
  };
}
const first$e = overload(first0, ISeq.first);
const rest$e = ISeq.rest;

function get(self, key, notFound) {
  const found = ILookup.lookup(self, key);
  return found == null ? notFound == null ? null : notFound : found;
}
function getIn(self, keys, notFound) {
  const found = reduce$f(get, self, keys);
  return found == null ? notFound == null ? null : notFound : found;
}

function assocN(self, key, value, ...args) {
  const instance = IAssociative.assoc(self, key, value);
  return args.length > 0 ? assocN(instance, ...args) : instance;
}
const assoc$8 = overload(null, null, null, IAssociative.assoc, assocN);
function assocIn(self, keys, value) {
  let key = keys[0];
  switch (keys.length) {
    case 0:
      return self;
    case 1:
      return IAssociative.assoc(self, key, value);
    default:
      return IAssociative.assoc(self, key, assocIn(get(self, key), toArray(rest$e(keys)), value));
  }
}
function update3(self, key, f) {
  return IAssociative.assoc(self, key, f(get(self, key)));
}
function update4(self, key, f, a) {
  return IAssociative.assoc(self, key, f(get(self, key), a));
}
function update5(self, key, f, a, b) {
  return IAssociative.assoc(self, key, f(get(self, key), a, b));
}
function update6(self, key, f, a, b, c) {
  return IAssociative.assoc(self, key, f(get(self, key), a, b, c));
}
function updateN(self, key, f, ...xs) {
  let tgt = get(self, key),
    args = [tgt, ...xs];
  return IAssociative.assoc(self, key, f.apply(this, args));
}
const update = overload(null, null, null, update3, update4, update5, update6, updateN);
function updateIn3(self, keys, f) {
  let k = keys[0],
    ks = toArray(rest$e(keys));
  return ks.length ? IAssociative.assoc(self, k, updateIn3(get(self, k), ks, f)) : update3(self, k, f);
}
function updateIn4(self, keys, f, a) {
  let k = keys[0],
    ks = toArray(rest$e(keys));
  return ks.length ? IAssociative.assoc(self, k, updateIn4(get(self, k), ks, f, a)) : update4(self, k, f, a);
}
function updateIn5(self, keys, f, a, b) {
  let k = keys[0],
    ks = toArray(rest$e(keys));
  return ks.length ? IAssociative.assoc(self, k, updateIn5(get(self, k), ks, f, a, b)) : update5(self, k, f, a, b);
}
function updateIn6(self, key, f, a, b, c) {
  let k = keys[0],
    ks = toArray(rest$e(keys));
  return ks.length ? IAssociative.assoc(self, k, updateIn6(get(self, k), ks, f, a, b, c)) : update6(self, k, f, a, b, c);
}
function updateInN(self, keys, f) {
  return updateIn3(self, keys, function (...xs) {
    return f.apply(null, xs);
  });
}
function contains3(self, key, value) {
  return IAssociative.contains(self, key) && get(self, key) === value;
}
const contains$8 = overload(null, null, IAssociative.contains, contains3);
const updateIn = overload(null, null, null, updateIn3, updateIn4, updateIn5, updateIn6, updateInN);
const rewrite = branch(IAssociative.contains, update, identity);
const prop = overload(null, function (key) {
  return overload(null, function (v) {
    return get(v, key);
  }, function (v) {
    return assoc$8(v, key, v);
  });
}, get, assoc$8);
function patch2(target, source) {
  return reducekv$a(function (memo, key, value) {
    return assoc$8(memo, key, typeof value === "function" ? value(get(memo, key)) : value);
  }, target, source);
}
const patch = overload(null, identity, patch2, reducing(patch2));

function merge$6(target, source) {
  return reducekv$a(assoc$8, target, source);
}
function mergeWith3(f, init, x) {
  return reducekv$a(function (memo, key, value) {
    return assoc$8(memo, key, contains$8(memo, key) ? f(get(memo, key), value) : f(value));
  }, init, x);
}
function mergeWithN(f, init, ...xs) {
  var _f, _mergeWith;
  return reduce$f((_mergeWith = mergeWith3, _f = f, function mergeWith3(_argPlaceholder, _argPlaceholder2) {
    return _mergeWith(_f, _argPlaceholder, _argPlaceholder2);
  }), init, xs);
}
const mergeWith = overload(null, null, null, mergeWith3, mergeWithN);
const IMergable = protocol({
  merge: merge$6
});

const INamable = protocol({
  name: null
});

const INext = protocol({
  next: null
});

const IOtherwise = protocol({
  otherwise: identity
});

const IPath = protocol({
  path: null
});

const IPrependable = protocol({
  prepend: null
});

const IQueryable = _$2.protocol({
  query: null
});

const IResettable = protocol({
  reset: null,
  resettable: null
});

const IReversible = protocol({
  reverse: null
});

const IRevertible = protocol({
  undo: null,
  redo: null,
  flush: null,
  crunch: null,
  undoable: null,
  redoable: null,
  flushable: null,
  crunchable: null,
  revision: null
});

const ISend = protocol({
  send: null
});

const ISeqable = protocol({
  seq: null
});

const ISequential$1 = protocol();

const IOmissible = protocol({
  omit: null
});

const omit$3 = IOmissible.omit;

const conj$9 = overload(function () {
  return [];
}, identity, ICollection.conj, reducing(ICollection.conj));
const unconj$1 = overload(null, identity, ICollection.unconj, reducing(ICollection.unconj));

function excludes2(self, value) {
  return !IInclusive.includes(self, value);
}
function includesN(self, ...args) {
  for (let arg of args) {
    if (!IInclusive.includes(self, arg)) {
      return false;
    }
  }
  return true;
}
function excludesN(self, ...args) {
  for (let arg of args) {
    if (IInclusive.includes(self, arg)) {
      return false;
    }
  }
  return true;
}
const includes$a = overload(null, constantly(true), IInclusive.includes, includesN);
const excludes = overload(null, constantly(false), excludes2, excludesN);
const transpose = branch(IInclusive.includes, omit$3, conj$9);

function unite$1(self, value) {
  return includes$a(self, value) ? self : conj$9(self, value);
}
const ISet = protocol({
  unite: unite$1,
  disj: null
});

const ISplittable = protocol({
  split: null
});

const ITemplate = protocol({
  fill: null
});

function EmptyList() {}
function emptyList() {
  return new EmptyList();
}
EmptyList.prototype[Symbol.toStringTag] = "EmptyList";
EmptyList.prototype.hashCode = function () {
  return -0;
};

const count$c = ICounted.count;

const next$b = INext.next;

function kin(self, other) {
  return is(other, self.constructor);
}
function equiv$b(self, other) {
  return self === other || IEquiv.equiv(self, other);
}
function alike2(self, other) {
  return alike3(self, other, Object.keys(self)); //Object.keys looks to internal properties
}

function alike3(self, other, keys) {
  //same parts? structural equality?
  return reduce$f(function (memo, key) {
    return memo ? equiv$b(self[key], other[key]) : reduced$1(memo);
  }, true, keys);
}
const alike = overload(null, null, alike2, alike3);
function equivalent() {
  function equiv(self, other) {
    return kin(self, other) && alike(self, other);
  }
  return implement(IEquiv, {
    equiv
  });
}
function eqN(...args) {
  return everyPair(equiv$b, args);
}
const eq = overload(constantly(true), constantly(true), equiv$b, eqN);
const notEq = complement(eq);

function reduce$e(self, f, init) {
  return init;
}
function append$6(self, x) {
  return [x];
}
const prepend$5 = append$6;
function equiv$a(xs, ys) {
  return !!satisfies(ISequential$1, xs) === !!satisfies(ISequential$1, ys) && count$c(xs) === count$c(ys) && equiv$b(first$e(xs), first$e(ys)) && equiv$b(next$b(xs), next$b(ys));
}
const iequiv = implement(IEquiv, {
  equiv: equiv$a
});
var behave$G = does(iequiv, keying("EmptyList"), implement(ISequential$1), implement(IPrependable, {
  prepend: prepend$5
}), implement(IAppendable, {
  append: append$6
}), implement(IBlankable, {
  blank: constantly(true)
}), implement(IReversible, {
  reverse: emptyList
}), implement(ICounted, {
  count: constantly(0)
}), implement(IOmissible, {
  omit: identity
}), implement(IEmptyableCollection, {
  empty: identity
}), implement(IInclusive, {
  includes: constantly(false)
}), implement(IKVReducible, {
  reducekv: reduce$e
}), implement(IReducible, {
  reduce: reduce$e
}), implement(ISeq, {
  first: constantly(null),
  rest: emptyList
}), implement(INext, {
  next: constantly(null)
}), implement(ISeqable, {
  seq: constantly(null)
}));

behave$G(EmptyList);

function compare$6(x, y) {
  if (x === y) {
    return 0;
  } else if (x == null) {
    return -1;
  } else if (y == null) {
    return 1;
  } else if (kin(x, y)) {
    return IComparable.compare(x, y);
  } else {
    throw new TypeError("Cannot compare different types.");
  }
}
function lt2(a, b) {
  return compare$6(a, b) < 0;
}
function ltN(...args) {
  return everyPair(lt2, args);
}
const lt = overload(constantly(false), constantly(true), lt2, ltN);
const lte2 = or(lt2, equiv$b);
function lteN(...args) {
  return everyPair(lte2, args);
}
const lte = overload(constantly(false), constantly(true), lte2, lteN);
function gt2(a, b) {
  return compare$6(a, b) > 0;
}
function gtN(...args) {
  return everyPair(gt2, args);
}
const gt = overload(constantly(false), constantly(true), gt2, gtN);
const gte2 = or(equiv$b, gt2);
function gteN(...args) {
  return everyPair(gte2, args);
}
const gte = overload(constantly(false), constantly(true), gte2, gteN);

var _$1, _IAddable$add, _IAddable, _2, _IAddable$add2, _IAddable2;
function directed(start, step) {
  return compare$6(IAddable.add(start, step), start);
}
function steps(Type, pred) {
  return function (start, end, step) {
    if (start == null && end == null) {
      return new Type();
    }
    if (start != null && !pred(start)) {
      throw Error(Type.name + " passed invalid start value.");
    }
    if (end != null && !pred(end)) {
      throw Error(Type.name + " passed invalid end value.");
    }
    if (start == null && end != null) {
      throw Error(Type.name + " cannot get started without a beginning.");
    }
    const direction = directed(start, step);
    if (direction === 0) {
      throw Error(Type.name + " lacks direction.");
    }
    return new Type(start, end, step, direction);
  };
}
function subtract2(self, n) {
  return IAddable.add(self, IInversive.inverse(n));
}
const subtract = overload(constantly(0), identity, subtract2, reducing(subtract2));
const add$3 = overload(constantly(0), identity, IAddable.add, reducing(IAddable.add));
const inc = overload(constantly(+1), (_IAddable = IAddable, _IAddable$add = _IAddable.add, _$1 = +1, function add(_argPlaceholder) {
  return _IAddable$add.call(_IAddable, _argPlaceholder, _$1);
}));
const dec = overload(constantly(-1), (_IAddable2 = IAddable, _IAddable$add2 = _IAddable2.add, _2 = -1, function add(_argPlaceholder2) {
  return _IAddable$add2.call(_IAddable2, _argPlaceholder2, _2);
}));

const number = constructs(Number);
const num = unary(number);
const int = parseInt;
const float = parseFloat;
function isNaN(n) {
  return n !== n;
}
function isNumber(n) {
  return is(n, Number) && !isNaN(n);
}
function isInteger(n) {
  return isNumber(n) && n % 1 === 0;
}
const isInt = isInteger;
function isFloat(n) {
  return isNumber(n) && n % 1 !== 0;
}
function modulus(n, div) {
  return n % div;
}
function min2(x, y) {
  return compare$6(x, y) < 0 ? x : y;
}
function max2(x, y) {
  return compare$6(x, y) > 0 ? x : y;
}
const min = overload(null, identity, min2, reducing(min2));
const max = overload(null, identity, max2, reducing(max2));
function isZero(x) {
  return x === 0;
}
function isPos(x) {
  return x > 0;
}
function isNeg(x) {
  return x < 0;
}
function isOdd(n) {
  return !!(n % 2);
}
const isEven = complement(isOdd);
function clamp(self, min, max) {
  return self < min ? min : self > max ? max : self;
}
function rand0() {
  return Math.random();
}
function rand1(n) {
  return Math.random() * n;
}
function rand2(f = Math.random, n) {
  return f() * n;
}
const rand = overload(rand0, rand1, rand2);
function randInt1(n) {
  return Math.floor(rand(n));
}
function randInt2(f, n) {
  return Math.floor(rand(f, n));
}
const randInt = overload(null, randInt1, randInt2);
function sum(ns) {
  return reduce$f(add$3, 0, ns);
}
function least(ns) {
  return reduce$f(min, Number.POSITIVE_INFINITY, ns);
}
function most(ns) {
  return reduce$f(max, Number.NEGATIVE_INFINITY, ns);
}
function average(ns) {
  return sum(ns) / count$c(ns);
}
function measure(ns) {
  return {
    count: count$c(ns),
    sum: sum(ns),
    least: least(ns),
    most: most(ns),
    average: average(ns)
  };
}

function compare$5(self, other) {
  return self === other ? 0 : self - other;
}
function add$2(self, other) {
  return self + other;
}
function inverse$3(self) {
  return self * -1;
}
function mult$1(self, n) {
  return self * n;
}
function divide$3(self, n) {
  return self / n;
}
const start$2 = identity,
  end$2 = identity,
  hash$6 = identity;
var behave$F = does(keying("Number"), implement(IHashable, {
  hash: hash$6
}), implement(IDivisible, {
  divide: divide$3
}), implement(IMultipliable, {
  mult: mult$1
}), implement(IBounded, {
  start: start$2,
  end: end$2
}), implement(IComparable, {
  compare: compare$5
}), implement(IInversive, {
  inverse: inverse$3
}), implement(IAddable, {
  add: add$2
}));

const behaviors = {};

Object.assign(behaviors, {
  Number: behave$F
});
behave$F(Number);

function LazySeq(perform) {
  this.perform = perform;
}
LazySeq.prototype[Symbol.toStringTag] = "LazySeq";
function lazySeq(perform) {
  if (typeof perform !== "function") {
    throw new Error("Lazy Seq needs a thunk.");
  }
  return new LazySeq(once(perform));
}

function array(...args) {
  return args;
}
function emptyArray() {
  return [];
}

function boolean(...args) {
  return Boolean(...args);
}
const bool = boolean;

function isBoolean(self) {
  return Boolean(self) === self;
}
function not(self) {
  return !self;
}
function isTrue(self) {
  return self === true;
}
function isFalse(self) {
  return self === false;
}

function compare$4(self, other) {
  return self === other ? 0 : self === true ? 1 : -1;
}
function inverse$2(self) {
  return !self;
}
function hash$5(self) {
  return self ? 1 : 0;
}
var behave$E = does(keying("Boolean"), implement(IHashable, {
  hash: hash$5
}), implement(IComparable, {
  compare: compare$4
}), implement(IInversive, {
  inverse: inverse$2
}));

Object.assign(behaviors, {
  Boolean: behave$E
});
behave$E(Boolean);

function List(head, tail) {
  this.head = head;
  this.tail = tail;
}
function cons2(head, tail) {
  return new List(head, tail || emptyList());
}
const _consN = reducing(cons2);
function consN(...args) {
  return _consN.apply(this, args.concat([emptyList()]));
}
const cons = overload(emptyList, cons2, cons2, consN);
List.prototype[Symbol.toStringTag] = "List";
function list(...args) {
  return reduce$f(function (memo, value) {
    return cons(value, memo);
  }, emptyList(), args.reverse());
}

const merge$5 = overload(null, identity, IMergable.merge, reducing(IMergable.merge));

function assoc$7(self, key, value) {
  const obj = {};
  obj[key] = value;
  return obj;
}
function reduce$d(self, f, init) {
  return init;
}
function equiv$9(self, other) {
  return null == other;
}
function otherwise$5(self, other) {
  return other;
}
function conj$8(self, value) {
  return cons(value);
}
function merge$4(self, ...xs) {
  return count$c(xs) ? merge$5.apply(null, Array.from(xs)) : null;
}
function hash$4(self) {
  return 0;
}
var behave$D = does(keying("Nil"), implement(IHashable, {
  hash: hash$4
}), implement(ICloneable, {
  clone: identity
}), implement(ICompactible, {
  compact: identity
}), implement(ICollection, {
  conj: conj$8
}), implement(IBlankable, {
  blank: constantly(true)
}), implement(IMergable, {
  merge: merge$4
}), implement(IMap, {
  keys: nil,
  vals: nil,
  dissoc: nil
}), implement(IEmptyableCollection, {
  empty: identity
}), implement(IOtherwise, {
  otherwise: otherwise$5
}), implement(IEquiv, {
  equiv: equiv$9
}), implement(ILookup, {
  lookup: identity
}), implement(IInclusive, {
  includes: constantly(false)
}), implement(IAssociative, {
  assoc: assoc$7,
  contains: constantly(false)
}), implement(INext, {
  next: identity
}), implement(ISeq, {
  first: identity,
  rest: emptyList
}), implement(ISeqable, {
  seq: identity
}), implement(IIndexed, {
  nth: identity
}), implement(ICounted, {
  count: constantly(0)
}), implement(IKVReducible, {
  reducekv: reduce$d
}), implement(IReducible, {
  reduce: reduce$d
}));

behave$D(Nil);

const deref$b = IDeref.deref;

const fmap$b = overload(constantly(identity), IFunctor.fmap, reducing(IFunctor.fmap));
function thrushN(unit, init, ...fs) {
  return deref$b(reduce$f(IFunctor.fmap, unit(init), fs));
}
function thrush1(f) {
  return overload(null, f, partial(thrushN, f));
}
const thrush = overload(null, thrush1, thrushN);
function pipeline1(unit) {
  return partial(pipelineN, unit);
}
function pipelineN(unit, ...fs) {
  return function (init) {
    return thrush(unit, init, ...fs);
  };
}
const pipeline = overload(null, pipeline1, pipelineN);

function Nothing() {}
Nothing.prototype[Symbol.toStringTag] = "Nothing";
const nothing = new Nothing();

function Just(value) {
  this.value = value;
}
Just.prototype[Symbol.toStringTag] = "Just";
function maybe1(value) {
  return value == null ? nothing : new Just(value);
}
const maybe = thrush(maybe1);
const opt = pipeline(maybe1);

const inverse$1 = IInversive.inverse;

const seq$b = ISeqable.seq;

function Range(start, end, step, direction) {
  this.start = start;
  this.end = end;
  this.step = step;
  this.direction = direction;
}
function emptyRange() {
  return new Range();
}
function range0() {
  return range1(Number.POSITIVE_INFINITY);
}
function range1(end) {
  return range3(0, end, 1);
}
function range2(start, end) {
  return range3(start, end, 1);
}
const range3 = steps(Range, isNumber);
const range = overload(range0, range1, range2, range3);
Range.prototype[Symbol.toStringTag] = "Range";

function emptyString() {
  return "";
}

var _param$2, _upperCase, _replace;
function isBlank(str) {
  return str == null || typeof str === "string" && str.trim().length === 0;
}
function str1(x) {
  return x == null ? "" : x.toString();
}
function str2(x, y) {
  return str1(x) + str1(y);
}
function camelToDashed(str) {
  return str.replace(/[A-Z]/, function (x) {
    return "-" + x.toLowerCase();
  });
}
const startsWith = unbind(String.prototype.startsWith);
const endsWith = unbind(String.prototype.endsWith);
const replace = unbind(String.prototype.replace);
const subs = unbind(String.prototype.substring);
const lowerCase = unbind(String.prototype.toLowerCase);
const upperCase = unbind(String.prototype.toUpperCase);
const titleCase = (_replace = replace, _param$2 = /(^|\s|\.)(\S|\.)/g, _upperCase = upperCase, function replace(_argPlaceholder) {
  return _replace(_argPlaceholder, _param$2, _upperCase);
});
const lpad = unbind(String.prototype.padStart);
const rpad = unbind(String.prototype.padEnd);
const trim = unbind(String.prototype.trim);
const rtrim = unbind(String.prototype.trimRight);
const ltrim = unbind(String.prototype.trimLeft);
const str = overload(emptyString, str1, str2, reducing(str2));
function zeros(value, n) {
  return lpad(str(value), n, "0");
}

function spread(f) {
  return function (args) {
    return f(...toArray(args));
  };
}
function parsedo(re, xf, callback) {
  return opt(re, xf, spread(callback));
}
function realize(g) {
  return isFunction(g) ? g() : g;
}
function realized(f) {
  return function (...args) {
    return apply(f, reduce$f(function (memo, arg) {
      memo.push(realize(arg));
      return memo;
    }, [], args));
  };
}
function juxt(...fs) {
  return function (...args) {
    return reduce$f(function (memo, f) {
      return memo.concat([f.apply(this, args)]);
    }, [], fs);
  };
}
function apply2(f, args) {
  return f.apply(null, toArray(args));
}
function apply3(f, a, args) {
  return f.apply(null, [a, ...toArray(args)]);
}
function apply4(f, a, b, args) {
  return f.apply(null, [a, b, ...toArray(args)]);
}
function apply5(f, a, b, c, args) {
  return f.apply(null, [a, b, c, ...toArray(args)]);
}
function applyN(f, a, b, c, d, args) {
  return f.apply(null, [a, b, c, d, ...toArray(args)]);
}
const apply = overload(null, null, apply2, apply3, apply4, apply5, applyN);
function flip(f) {
  return function (b, a, ...args) {
    return f.apply(this, [a, b, ...args]);
  };
}
function farg(f, ...fs) {
  return function (...args) {
    for (let x = 0; x < args.length; x++) {
      const g = fs[x];
      if (g) {
        args[x] = g(args[x]);
      }
    }
    return f(...args);
  };
}
function fnil(f, ...substitutes) {
  return function (...args) {
    for (let x = 0; x < substitutes.length; x++) {
      if (isNil(args[x])) {
        args[x] = substitutes[x];
      }
    }
    return f(...args);
  };
}

function Concatenated(colls) {
  this.colls = colls;
}
Concatenated.prototype[Symbol.toStringTag] = "Concatenated";

function flat0() {
  //transducer
  return function (rf) {
    return overload(rf, rf, function (memo, value) {
      return reduce$f(memo, rf, value);
    });
  };
}
const flatMap$3 = IFlatMappable.flatMap;
const flat$4 = overload(flat0, IFlatMappable.flat);
const cat = flat$4;

const keys$b = IMap.keys;
const vals$5 = IMap.vals;
function dissocN(obj, ...keys) {
  return reduce$f(IMap.dissoc, obj, keys);
}
const dissoc$5 = overload(null, identity, IMap.dissoc, dissocN);

const nth$6 = IIndexed.nth;
const idx$3 = IIndexed.idx;

const reverse$4 = IReversible.reverse;

function concatenated(xs) {
  const colls = filter2(seq$b, xs);
  return seq$b(colls) ? new Concatenated(colls) : emptyList();
}
const concat = overload(emptyList, seq$b, unspread(concatenated));
function map1(f) {
  //transducer
  return function (rf) {
    return overload(rf, rf, function (memo, value) {
      return rf(memo, f(value));
    });
  };
}
function map2(f, xs) {
  return seq$b(xs) ? lazySeq(function () {
    return cons(f(first$e(xs)), map2(f, rest$e(xs)));
  }) : emptyList();
}
function map3(f, c1, c2) {
  const s1 = seq$b(c1),
    s2 = seq$b(c2);
  return s1 && s2 ? lazySeq(function () {
    return cons(f(first$e(s1), first$e(s2)), map3(f, rest$e(s1), rest$e(s2)));
  }) : emptyList();
}
function mapN(f, ...tail) {
  const seqs = map2(seq$b, tail);
  return notAny(isNil, seqs) ? lazySeq(function () {
    return cons(apply(f, mapa(first$e, seqs)), apply(mapN, f, mapa(rest$e, seqs)));
  }) : emptyList();
}
const map = overload(null, map1, map2, map3, mapN);
const mapa = comp(toArray, map);
function mapArgs(xf, f) {
  return function (...args) {
    var _xf, _maybe;
    return apply(f, args.map((_maybe = maybe, _xf = xf, function maybe(_argPlaceholder) {
      return _maybe(_argPlaceholder, _xf);
    })));
  };
}
function keyed(f, keys) {
  return reduce$f(function (memo, key) {
    return assoc$8(memo, key, f(key));
  }, {}, keys);
}
function transduce3(xform, f, coll) {
  return transduce4(xform, f, f(), coll);
}
function transduce4(xform, f, init, coll) {
  const step = xform(f);
  return step(reduce$f(step, init, coll));
}
const transduce = overload(null, null, null, transduce3, transduce4);
function into2(to, from) {
  return reduce$f(conj$9, to, from);
}
function into3(to, xform, from) {
  return transduce(xform, conj$9, to, from);
}
const into = overload(emptyArray, identity, into2, into3);

//TODO unnecessary if CQS pattern is that commands return self
function doing1(f) {
  return doing2(f, identity);
}
function doing2(f, order) {
  return function (self, ...xs) {
    var _self, _f;
    each((_f = f, _self = self, function f(_argPlaceholder2) {
      return _f(_self, _argPlaceholder2);
    }), order(xs));
  };
}
const doing = overload(null, doing1, doing2); //mutating counterpart to `reducing`

function each(f, xs) {
  let ys = seq$b(xs);
  while (ys) {
    f(first$e(ys));
    ys = next$b(ys);
  }
}
function doseq3(f, xs, ys) {
  each(function (x) {
    each(function (y) {
      f(x, y);
    }, ys);
  }, xs);
}
function doseq4(f, xs, ys, zs) {
  each(function (x) {
    each(function (y) {
      each(function (z) {
        f(x, y, z);
      }, zs);
    }, ys);
  }, xs);
}
function doseqN(f, xs, ...colls) {
  each(function (x) {
    if (seq$b(colls)) {
      apply(doseq, function (...args) {
        apply(f, x, args);
      }, colls);
    } else {
      f(x);
    }
  }, xs || []);
}
const doseq = overload(null, null, each, doseq3, doseq4, doseqN);
function eachkv(f, xs) {
  each(function ([key, value]) {
    return f(key, value);
  }, entries(xs));
}
function eachvk(f, xs) {
  each(function ([key, value]) {
    return f(value, key);
  }, entries(xs));
}
function entries2(xs, keys) {
  return seq$b(keys) ? lazySeq(function () {
    return cons([first$e(keys), get(xs, first$e(keys))], entries2(xs, rest$e(keys)));
  }) : emptyList();
}
function entries1(xs) {
  return entries2(xs, keys$b(xs));
}
const entries = overload(null, entries1, entries2);
function mapkv(f, xs) {
  return map2(function ([key, value]) {
    return f(key, value);
  }, entries(xs));
}
function mapvk(f, xs) {
  //TODO necessary, given `mapkv`?
  return map2(function ([key, value]) {
    return f(value, key);
  }, entries(xs));
}
function seek(...fs) {
  return function (...args) {
    return reduce$f(function (memo, f) {
      return memo == null ? f(...args) : reduced$1(memo);
    }, null, fs);
  };
}
function some$1(f, coll) {
  let xs = seq$b(coll);
  while (xs) {
    const value = f(first$e(xs));
    if (value) {
      return value;
    }
    xs = next$b(xs);
  }
  return null;
}
const notSome = comp(not, some$1);
const notAny = notSome;
function every(pred, coll) {
  let xs = seq$b(coll);
  while (xs) {
    if (!pred(first$e(xs))) {
      return false;
    }
    xs = next$b(xs);
  }
  return true;
}
const notEvery = comp(not, every);
function mapSome2(f, pred) {
  return function (rf) {
    return overload(rf, rf, function (memo, value) {
      return rf(memo, pred(value) ? f(value) : value);
    });
  };
}
function mapSome3(f, pred, coll) {
  return map2(function (value) {
    return pred(value) ? f(value) : value;
  }, coll);
}
const mapSome = overload(null, null, mapSome2, mapSome3);
function mapcat1(f) {
  //transducer
  return comp(map1(f), cat());
}
function mapcat2(f, colls) {
  return concatenated(map2(f, colls));
}
const mapcat = overload(null, mapcat1, mapcat2);
function filter1(pred) {
  //transducer
  return function (rf) {
    return overload(rf, rf, function (memo, value) {
      return pred(value) ? rf(memo, value) : memo;
    });
  };
}
function filter2(pred, xs) {
  return seq$b(xs) ? lazySeq(function () {
    let ys = xs;
    while (seq$b(ys)) {
      const head = first$e(ys),
        tail = rest$e(ys);
      if (pred(head)) {
        return cons(head, lazySeq(function () {
          return filter2(pred, tail);
        }));
      }
      ys = tail;
    }
    return emptyList();
  }) : emptyList();
}
const filter = overload(null, filter1, filter2);
function detect1(pred) {
  //transducer
  return function (rf) {
    return overload(rf, rf, function (memo, value) {
      return pred(value) ? reduced$1(rf(memo, value)) : memo;
    });
  };
}
const detect2 = comp(first$e, filter2);
const detect = overload(null, detect1, detect2);
function detectIndex(pred, xs) {
  const found = detect2(function ([idx, x]) {
    return pred(x);
  }, mapIndexed(function (idx, x) {
    return [idx, x];
  }, xs));
  return found ? found[0] : null;
}
function cycle(coll) {
  return seq$b(coll) ? lazySeq(function () {
    return cons(first$e(coll), concat(rest$e(coll), cycle(coll)));
  }) : emptyList();
}
function treeSeq(branch, children, root) {
  function walk(node) {
    return cons(node, branch(node) ? mapcat2(walk, children(node)) : emptyList());
  }
  return walk(root);
}
function flatten(coll) {
  return filter2(complement(satisfies(ISequential$1)), rest$e(treeSeq(satisfies(ISequential$1), seq$b, coll)));
}
function zip(...colls) {
  return mapcat2(identity, map2(seq$b, ...colls));
}
const filtera = comp(toArray, filter);
const remove1 = comp(filter1, complement); //transducer

function remove2(pred, xs) {
  return filter2(complement(pred), xs);
}
const remove = overload(null, remove1, remove2);
function keep1(f) {
  //transducer
  return comp(map1(f), filter1(isSome));
}
function keep2(f, xs) {
  return filter2(isSome, map2(f, xs));
}
const keep = overload(null, keep1, keep2);
function drop1(n) {
  //transducer
  return function (rf) {
    let dropping = n;
    return overload(rf, rf, function (memo, value) {
      return dropping-- > 0 ? memo : rf(memo, value);
    });
  };
}
function drop2(n, coll) {
  let i = n,
    xs = seq$b(coll);
  while (i > 0 && xs) {
    xs = rest$e(xs);
    i = i - 1;
  }
  return xs;
}
const drop = overload(null, drop1, drop2);
function dropWhile1(pred) {
  //transducer
  return function (rf) {
    let dropping = true;
    return overload(rf, rf, function (memo, value) {
      !dropping || (dropping = pred(value));
      return dropping ? memo : rf(memo, value);
    });
  };
}
function dropWhile2(pred, xs) {
  return seq$b(xs) ? pred(first$e(xs)) ? dropWhile(pred, rest$e(xs)) : xs : emptyList();
}
const dropWhile = overload(null, dropWhile1, dropWhile2);
function dropLast(n, coll) {
  return map3(function (x, _) {
    return x;
  }, coll, drop(n, coll));
}
function take1(n) {
  //transducer
  return function (rf) {
    let taking = n < 0 ? 0 : n;
    return overload(rf, rf, function (memo, value) {
      switch (taking) {
        case 0:
          return reduced$1(memo);
        case 1:
          taking--;
          return reduced$1(rf(memo, value));
        default:
          taking--;
          return rf(memo, value);
      }
    });
  };
}
function take2(n, coll) {
  const xs = seq$b(coll);
  return n > 0 && xs ? lazySeq(function () {
    return cons(first$e(xs), take2(n - 1, rest$e(xs)));
  }) : emptyList();
}
const take = overload(null, take1, take2);
function takeWhile1(pred) {
  //transducer
  return function (rf) {
    return overload(rf, rf, function (memo, value) {
      return pred(value) ? rf(memo, value) : reduced$1(memo);
    });
  };
}
function takeWhile2(pred, xs) {
  return seq$b(xs) ? lazySeq(function () {
    const item = first$e(xs);
    return pred(item) ? cons(item, lazySeq(function () {
      return takeWhile(pred, rest$e(xs));
    })) : emptyList();
  }) : emptyList();
}
const takeWhile = overload(null, takeWhile1, takeWhile2);
function takeNth1(n) {
  //transducer
  return function (rf) {
    let x = -1;
    return overload(rf, rf, function (memo, value) {
      x++;
      return x === 0 || x % n === 0 ? rf(memo, value) : memo;
    });
  };
}
function takeNth2(n, xs) {
  return seq$b(xs) ? lazySeq(function () {
    return cons(first$e(xs), takeNth(n, drop(n, xs)));
  }) : emptyList();
}
const takeNth = overload(null, takeNth1, takeNth2);
function takeLast(n, coll) {
  return n ? drop(count$c(coll) - n, coll) : emptyList();
}
function interleave2(xs, ys) {
  const as = seq$b(xs),
    bs = seq$b(ys);
  return as != null && bs != null ? cons(first$e(as), lazySeq(function () {
    return cons(first$e(bs), interleave2(rest$e(as), rest$e(bs)));
  })) : emptyList();
}
function interleaveN(...colls) {
  return concatenated(interleaved(colls));
}
function interleaved(colls) {
  return seq$b(filter2(isNil, colls)) ? emptyList() : lazySeq(function () {
    return cons(map2(first$e, colls), interleaved(map2(next$b, colls)));
  });
}
const interleave = overload(null, null, interleave2, interleaveN);
function interpose1(sep) {
  return function (rf) {
    return overload(rf, rf, function (memo, value) {
      return rf(seq$b(memo) ? rf(memo, sep) : memo, value);
    });
  };
}
function interpose2(sep, xs) {
  return drop2(1, interleave2(repeat1(sep), xs));
}
const interpose = overload(null, interpose1, interpose2);
function partition2(n, xs) {
  return partition3(n, n, xs);
}
function partition3(n, step, xs) {
  const coll = seq$b(xs);
  if (!coll) return xs;
  const part = take2(n, coll);
  return n === count$c(part) ? cons(part, partition3(n, step, drop(step, coll))) : emptyList();
}
function partition4(n, step, pad, xs) {
  const coll = seq$b(xs);
  if (!coll) return xs;
  const part = take2(n, coll);
  return n === count$c(part) ? cons(part, partition4(n, step, pad, drop(step, coll))) : cons(take2(n, concat(part, pad)));
}
const partition = overload(null, null, partition2, partition3, partition4);
function partitionAll1(n) {
  return partial(partitionAll, n);
}
function partitionAll2(n, xs) {
  return partitionAll3(n, n, xs);
}
function partitionAll3(n, step, xs) {
  const coll = seq$b(xs);
  if (!coll) return xs;
  return cons(take2(n, coll), partitionAll3(n, step, drop2(step, coll)));
}
const partitionAll = overload(null, partitionAll1, partitionAll2, partitionAll3);
function partitionBy(f, xs) {
  const coll = seq$b(xs);
  if (!coll) return xs;
  const head = first$e(coll),
    val = f(head),
    run = cons(head, takeWhile2(function (x) {
      return val === f(x);
    }, next$b(coll)));
  return cons(run, partitionBy(f, seq$b(drop(count$c(run), coll))));
}
function sift(pred, xs) {
  const sifted = groupBy(pred, xs);
  return [sifted["true"] || null, sifted["false"] || null];
}
function lastN1(size = 1) {
  //transducer
  return function (rf) {
    let prior = [];
    return overload(rf, function (memo) {
      let acc = memo;
      for (let x of prior) {
        acc = rf(acc, x);
      }
      return rf(acc);
    }, function (memo, value) {
      prior.push(value);
      while (prior.length > size) {
        prior.shift();
      }
      return memo;
    });
  };
}
function lastN2(n, coll) {
  let xs = coll,
    ys = [];
  while (seq$b(xs)) {
    ys.push(first$e(xs));
    while (ys.length > n) {
      ys.shift();
    }
    xs = next$b(xs);
  }
  return ys;
}
const lastN = overload(null, lastN1, lastN2);
function last0() {
  return lastN1(1);
}
function last1(coll) {
  let xs = coll,
    ys = null;
  while (ys = next$b(xs)) {
    xs = ys;
  }
  return first$e(xs);
}
const last = overload(last0, last1);
function thin2(f, equiv) {
  //transducer
  const nil = {};
  return function (rf) {
    let last = nil;
    return overload(rf, rf, function (memo, value) {
      const result = last !== nil && equiv(f(value), f(last)) ? memo : rf(memo, value);
      last = value;
      return result;
    });
  };
}
function thin3(f, equiv, coll) {
  return seq$b(coll) ? lazySeq(function () {
    let xs = seq$b(coll);
    const last = first$e(xs);
    while (next$b(xs) && equiv$b(f(first$e(next$b(xs))), f(last))) {
      xs = next$b(xs);
    }
    return cons(last, thin3(f, equiv$b, next$b(xs)));
  }) : coll;
}
const thin = overload(null, null, thin2, thin3);
function dedupe0() {
  //transducer
  return thin2(identity, equiv$b);
}
function dedupe1(coll) {
  return thin3(identity, equiv$b, coll);
}
const dedupe = overload(dedupe0, dedupe1);
function repeatedly1(f) {
  return lazySeq(function () {
    return cons(f(), repeatedly1(f));
  });
}
function repeatedly2(n, f) {
  return take2(n, repeatedly1(f));
}
const repeatedly = overload(null, repeatedly1, repeatedly2);
function repeat1(x) {
  return repeatedly1(constantly(x));
}
function repeat2(n, x) {
  return repeatedly2(n, constantly(x));
}
const repeat = overload(null, repeat1, repeat2);
function isEmpty(coll) {
  return !seq$b(coll);
}
function notEmpty(coll) {
  return isEmpty(coll) ? null : coll;
}
function asc2(compare, f) {
  return function (a, b) {
    return compare(f(a), f(b));
  };
}
function asc1(f) {
  return asc2(compare$6, f);
}
const asc = overload(constantly(compare$6), asc1, asc2);
function desc0() {
  return function (a, b) {
    return compare$6(b, a);
  };
}
function desc2(compare, f) {
  return function (a, b) {
    return compare(f(b), f(a));
  };
}
function desc1(f) {
  return desc2(compare$6, f);
}
const desc = overload(desc0, desc1, desc2);
function sort1(coll) {
  return sort2(compare$6, coll);
}
function sort2(compare, coll) {
  return into([], coll).sort(compare);
}
function sortN(...args) {
  const compares = initial(args),
    coll = last(args);
  function compare(x, y) {
    return reduce$f(function (memo, compare) {
      return memo === 0 ? compare(x, y) : reduced$1(memo);
    }, 0, compares);
  }
  return sort2(compare, coll);
}
const sort = overload(null, sort1, sort2, sortN);
function sortBy2(keyFn, coll) {
  return sortBy3(keyFn, compare$6, coll);
}
function sortBy3(keyFn, compare, coll) {
  return sort(function (x, y) {
    return compare$6(keyFn(x), keyFn(y));
  }, coll);
}
const sortBy = overload(null, null, sortBy2, sortBy3);
function withIndex(iter) {
  return function (f, xs) {
    let idx = -1;
    return iter(function (x) {
      return f(++idx, x);
    }, xs);
  };
}
function keepIndexed1(f) {
  //transducer
  return comp(mapIndexed1(f), filter1(isSome));
}
function mapIndexed1(f) {
  //transducer
  return function (rf) {
    let idx = -1;
    return overload(rf, rf, function (memo, value) {
      return rf(memo, f(++idx, value));
    });
  };
}
const butlast = partial(dropLast, 1);
const initial = butlast;
const eachIndexed = withIndex(each);
const mapIndexed = overload(null, mapIndexed1, withIndex(map));
const keepIndexed = overload(null, keepIndexed1, withIndex(keep));
const splitAt = juxt(take, drop);
const splitWith = juxt(takeWhile, dropWhile);
function braid3(f, xs, ys) {
  return mapcat2(function (x) {
    return map2(function (y) {
      return f(x, y);
    }, ys);
  }, xs);
}
function braid4(f, xs, ys, zs) {
  return mapcat2(function (x) {
    return mapcat2(function (y) {
      return map2(function (z) {
        return f(x, y, z);
      }, zs);
    }, ys);
  }, xs);
}
function braidN(f, xs, ...colls) {
  if (seq$b(colls)) {
    return mapcat2(function (x) {
      return apply(braid, function (...args) {
        return apply(f, x, args);
      }, colls);
    }, xs);
  } else {
    return map2(f, xs || []);
  }
}

//Clojure's `for`; however, could not use the name as it's a reserved word in JavaScript.
const braid = overload(null, null, map, braid3, braid4, braidN);
function best1(better) {
  //transducer
  return function (rf) {
    return _.overload(rf, rf, better);
  };
}
function best2(better, xs) {
  const coll = seq$b(xs);
  return coll ? reduce$f(function (a, b) {
    return better(a, b) ? a : b;
  }, first$e(coll), rest$e(coll)) : null;
}
const best = overload(null, best1, best2);
function scan(n, xs) {
  //TODO add transducer
  return lazySeq(function () {
    const ys = take2(n, xs);
    return count$c(ys) === n ? cons(ys, scan2(n, rest$e(xs))) : emptyList();
  });
}
function isDistinct1(coll) {
  let seen = new Set();
  return reduce$f(function (memo, x) {
    if (memo && seen.has(x)) {
      return reduced$1(false);
    }
    seen.add(x);
    return memo;
  }, true, coll);
}
function isDistinctN(...xs) {
  return isDistinct1(xs);
}
const isDistinct = overload(null, constantly(true), function (a, b) {
  return a !== b;
}, isDistinctN);
function dorun1(coll) {
  let xs = seq$b(coll);
  while (xs) {
    xs = next$b(xs);
  }
}
function dorun2(n, coll) {
  let xs = seq$b(coll);
  while (xs && n > 0) {
    n++;
    xs = next$b(xs);
  }
}
const dorun = overload(null, dorun1, dorun2);
function doall1(coll) {
  dorun(coll);
  return coll;
}
function doall2(n, coll) {
  dorun(n, coll);
  return coll;
}
const doall = overload(null, doall1, doall2);
function iterate$1(f, x) {
  return lazySeq(function () {
    return cons(x, iterate$1(f, f(x)));
  });
}
const integers = range(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1);
const positives = range(1, Number.MAX_SAFE_INTEGER, 1);
const negatives = range(-1, Number.MIN_SAFE_INTEGER, -1);
function dotimes(n, f) {
  each(f, range(n));
}
function randNth(coll) {
  return nth$6(coll, randInt(count$c(coll)));
}
function cond(...xs) {
  const conditions = isEven(count$c(xs)) ? xs : Array.from(concat(butlast(xs), [constantly(true), last(xs)]));
  return function (...args) {
    return reduce$f(function (memo, condition) {
      const pred = first$e(condition);
      return pred(...args) ? reduced$1(first$e(rest$e(condition))) : memo;
    }, null, partition2(2, conditions));
  };
}
function join1(xs) {
  return into("", map2(str, xs));
}
function join2(sep, xs) {
  return join1(interpose(sep, xs));
}
const join = overload(null, join1, join2);
function shuffle2(f, coll) {
  let a = Array.from(coll);
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(f() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}
function shuffle1(coll) {
  return shuffle2(Math.random, coll);
}
const shuffle = overload(null, shuffle1, shuffle2);
function generate(iterable) {
  //e.g. counter: generate(iterate(inc, 0)) or partial(generate, iterate(inc, 0))) for a counter factory;
  let iter = iterable[Symbol.iterator]();
  return function () {
    return iter.done ? null : iter.next().value;
  };
}
function splice4(self, start, nix, coll) {
  return concat(take2(start, self), coll, drop2(start + nix, self));
}
function splice3(self, start, coll) {
  return splice4(self, start, 0, coll);
}
const splice = overload(null, null, null, splice3, splice4);
function also(f, xs) {
  return concat(xs, mapcat2(function (x) {
    const result = f(x);
    return satisfies(ISequential$1, result) ? result : [result];
  }, xs));
}
function countBy(f, coll) {
  return reduce$f(function (memo, value) {
    let by = f(value),
      n = memo[by];
    memo[by] = n ? inc(n) : 1;
    return memo;
  }, {}, coll);
}
function groupBy3(init, f, coll) {
  return reduce$f(function (memo, value) {
    return update(memo, f(value), function (group) {
      return conj$9(group || [], value);
    });
  }, init, coll);
}
function groupBy2(f, coll) {
  return groupBy3({}, f, coll);
}
const groupBy = overload(null, null, groupBy2, groupBy3);
function index4(init, key, val, coll) {
  return reduce$f(function (memo, x) {
    return assoc$8(memo, key(x), val(x));
  }, init, coll);
}
function index3(key, val, coll) {
  return index4({}, key, val, coll);
}
function index2(key, coll) {
  return index4({}, key, identity, coll);
}
const index = overload(null, null, index2, index3, index4);
function coalesce(...fs) {
  return function (...args) {
    return detect2(isSome, map2(applying(...args), fs));
  };
}
function lazyIterable1(iter) {
  return lazyIterable2(iter, emptyList());
}
function lazyIterable2(iter, done) {
  const res = iter.next();
  return res.done ? done : lazySeq(function () {
    return cons(res.value, lazyIterable1(iter));
  });
}
const lazyIterable = overload(null, lazyIterable1, lazyIterable2);

function isReduced(self) {
  return is(self, Reduced);
}
function unreduced(self) {
  return isReduced(self) ? self.valueOf() : self;
}

function deref$a(self) {
  return self.valueOf();
}
var behave$C = does(keying("Reduced"), implement(IDeref, {
  deref: deref$a
}));

behave$C(Reduced);

const compact1$2 = partial(filter, identity);
function compact2$1(self, pred) {
  return remove(pred, self);
}
const compact$2 = overload(null, compact1$2, compact2$1);
function fmap$a(self, f) {
  return map(f, self);
}
function conj$7(self, value) {
  return cons(value, self);
}
function seq$a(self) {
  return seq$b(self.perform());
}
function blank$4(self) {
  return seq$a(self) == null;
}
function iterate(self) {
  let state = self;
  return {
    next: function () {
      let result = seq$b(state) ? {
        value: first$e(state),
        done: false
      } : {
        done: true
      };
      state = next$b(state);
      return result;
    }
  };
}
function iterator() {
  return iterate(this);
}
function iterable(Type) {
  Type.prototype[Symbol.iterator] = iterator;
}
function find$4(coll, key) {
  return reducekv$9(coll, function (memo, k, v) {
    return key === k ? reduced$1([k, v]) : memo;
  }, null);
}
function first$d(self) {
  return first$e(self.perform());
}
function rest$d(self) {
  return rest$e(self.perform());
}
function next$a(self) {
  return seq$b(rest$e(self));
}
function nth$5(self, n) {
  let xs = self,
    idx = 0;
  while (xs) {
    let x = first$e(xs);
    if (idx === n) {
      return x;
    }
    idx++;
    xs = next$b(xs);
  }
  return null;
}
function idx$2(self, x) {
  let xs = seq$b(self),
    n = 0;
  while (xs) {
    if (x === first$e(xs)) {
      return n;
    }
    n++;
    xs = next$b(xs);
  }
  return null;
}
function reduce$c(xs, f, init) {
  let memo = init,
    ys = seq$b(xs);
  while (ys && !isReduced(memo)) {
    memo = f(memo, first$e(ys));
    ys = next$b(ys);
  }
  return unreduced(memo);
}
function reducekv$9(xs, f, init) {
  let memo = init,
    ys = seq$b(xs),
    idx = 0;
  while (ys && !isReduced(memo)) {
    memo = f(memo, idx++, first$e(ys));
    ys = next$b(ys);
  }
  return unreduced(memo);
}
function count$b(self) {
  return reduce$c(self, function (memo) {
    return memo + 1;
  }, 0);
}
function append$5(self, other) {
  return concat(self, [other]);
}
function omit$2(self, value) {
  return remove(function (x) {
    return x === value;
  }, self);
}
function includes$9(self, value) {
  return detect(function (x) {
    return x === value;
  }, self);
}
const reverse$3 = comp(reverse$4, toArray);
const reductive = does(implement(IReducible, {
  reduce: reduce$c
}), implement(IKVReducible, {
  reducekv: reducekv$9
}));
var lazyseq = does(iterable, iequiv, reductive, keying("LazySeq"), implement(ISequential$1), implement(IIndexed, {
  nth: nth$5,
  idx: idx$2
}), implement(IReversible, {
  reverse: reverse$3
}), implement(IBlankable, {
  blank: blank$4
}), implement(ICompactible, {
  compact: compact$2
}), implement(IInclusive, {
  includes: includes$9
}), implement(IOmissible, {
  omit: omit$2
}), implement(IFunctor, {
  fmap: fmap$a
}), implement(ICollection, {
  conj: conj$7
}), implement(IAppendable, {
  append: append$5
}), implement(IPrependable, {
  prepend: conj$7
}), implement(ICounted, {
  count: count$b
}), implement(IFind, {
  find: find$4
}), implement(IEmptyableCollection, {
  empty: emptyList
}), implement(ISeq, {
  first: first$d,
  rest: rest$d
}), implement(ISeqable, {
  seq: seq$a
}), implement(INext, {
  next: next$a
}));

lazyseq(LazySeq);

function Multimap(attrs, empty) {
  this.attrs = attrs;
  this.empty = empty;
}
function multimap(attrs, empty) {
  return new Multimap(attrs || {}, empty || function () {
    return [];
  });
}
Multimap.prototype[Symbol.toStringTag] = "Multimap";

const clone$5 = ICloneable.clone;

function coerce(self, Type) {
  return is(Type, Object) ? self.attrs : coerce$1(self.attrs, Type);
}
function contains$7(self, key) {
  return self.attrs.hasOwnProperty(key);
}
function lookup$8(self, key) {
  return get(self.attrs, key);
}
function seq$9(self) {
  return seq$b(self.attrs);
}
function count$a(self) {
  return count$c(self.attrs);
}
function first$c(self) {
  return first$e(seq$9(self));
}
function rest$c(self) {
  return rest$e(seq$9(self));
}
function keys$a(self) {
  return keys$b(self.attrs);
}
function vals$4(self) {
  return vals$5(self.attrs);
}
function assoc$6(self, key, value) {
  return Object.assign(clone$5(self), {
    attrs: assoc$8(self.attrs, key, value)
  });
}
function dissoc$4(self, key) {
  return Object.assign(clone$5(self), {
    attrs: dissoc$5(self.attrs, key)
  });
}
function equiv$8(self, other) {
  return count$c(self) === count$c(other) && reducekv$8(self, function (memo, key, value) {
    return memo ? equiv$b(get(other, key), value) : reduced$1(memo);
  }, true);
}
function empty$3(self) {
  return Object.assign(clone$5(self), {
    attrs: {}
  });
}
function reduce$b(self, f, init) {
  return reduce$f(function (memo, key) {
    return f(memo, [key, lookup$8(self, key)]);
  }, init, keys$b(self));
}
function reducekv$8(self, f, init) {
  return reduce$f(function (memo, key) {
    return f(memo, key, lookup$8(self, key));
  }, init, keys$b(self));
}
function construct(Type) {
  return function record(attrs) {
    return Object.assign(Object.create(Type.prototype), {
      attrs: attrs
    });
  };
}
function emptyable(Type) {
  function empty() {
    return new Type();
  }
  implement(IEmptyableCollection, {
    empty
  }, Type);
}
var behave$B = does(emptyable, implement(IReducible, {
  reduce: reduce$b
}), implement(IKVReducible, {
  reducekv: reducekv$8
}), implement(IEquiv, {
  equiv: equiv$8
}), implement(ICoercible, {
  coerce
}), implement(IEmptyableCollection, {
  empty: empty$3
}), implement(IAssociative, {
  assoc: assoc$6,
  contains: contains$7
}), implement(ILookup, {
  lookup: lookup$8
}), implement(IMap, {
  dissoc: dissoc$4,
  keys: keys$a,
  vals: vals$4
}), implement(ISeq, {
  first: first$c,
  rest: rest$c
}), implement(ICounted, {
  count: count$a
}), implement(ISeqable, {
  seq: seq$9
}));

function keys$9(self) {
  return Object.keys(self.attrs);
}
function count$9(self) {
  return count$c(seq$8(self));
}
function seq$8(self) {
  return concatenated(map(function (key) {
    return map(function (value) {
      return [key, value];
    }, seq$b(get(self, key)) || emptyList());
  }, keys$9(self)));
}
function first$b(self) {
  return first$e(seq$8(self));
}
function rest$b(self) {
  return rest$e(seq$8(self));
}
function lookup$7(self, key) {
  return get(self.attrs, key);
}
function assoc$5(self, key, value) {
  const values = lookup$7(self, key) || self.empty(key);
  return new self.constructor(assoc$8(self.attrs, key, conj$9(values, value)), self.empty);
}
function contains$6(self, key) {
  return contains$8(self.attrs, key);
}
function reduce$a(self, f, init) {
  return reduce$f(function (memo, pair) {
    return f(memo, pair);
  }, init, seq$8(self));
}
function reducekv$7(self, f, init) {
  return reduce$a(self, function (memo, [key, value]) {
    return f(memo, key, value);
  }, init);
}
var behave$A = does(behave$B, keying("Multimap"), implement(IMap, {
  keys: keys$9
}), implement(IReducible, {
  reduce: reduce$a
}), implement(IKVReducible, {
  reducekv: reducekv$7
}), implement(ICounted, {
  count: count$9
}), implement(ISeqable, {
  seq: seq$8
}), implement(ILookup, {
  lookup: lookup$7
}), implement(IAssociative, {
  assoc: assoc$5,
  contains: contains$6
}), implement(ISeq, {
  first: first$b,
  rest: rest$b
}));

behave$A(Multimap);

function IndexedSeq(seq, start) {
  this.seq = seq;
  this.start = start;
}
function indexedSeq1(seq) {
  return indexedSeq2(seq, 0);
}
function indexedSeq2(seq, start) {
  return start < count$c(seq) ? new IndexedSeq(seq, start) : emptyList();
}
const indexedSeq = overload(null, indexedSeq1, indexedSeq2);
IndexedSeq.prototype[Symbol.toStringTag] = "IndexedSeq";

function RevSeq(coll, idx) {
  this.coll = coll;
  this.idx = idx;
}
RevSeq.prototype[Symbol.toStringTag] = "RevSeq";
function revSeq(coll, idx) {
  return new RevSeq(coll, idx);
}

function hashSeq(hs) {
  return reduce$f(function (h1, h2) {
    return 3 * h1 + h2;
  }, 0, map(hash$7, hs));
}
function hashKeyed(self) {
  return reduce$f(function (memo, key) {
    return hashSeq([memo, key, get(self, key)]);
  }, 0, sort(keys$b(self)));
}

function reverse$2(self) {
  let c = count$8(self);
  return c > 0 ? revSeq(self, c - 1) : null;
}
function key$1(self) {
  return lookup$6(self, 0);
}
function val$1(self) {
  return lookup$6(self, 1);
}
function find$3(self, key) {
  return contains$5(self, key) ? [key, lookup$6(self, key)] : null;
}
function contains$5(self, key) {
  return key < count$c(self.seq) - self.start;
}
function lookup$6(self, key) {
  return get(self.seq, self.start + key);
}
function append$4(self, x) {
  return concat(self, [x]);
}
function prepend$4(self, x) {
  return concat([x], self);
}
function next$9(self) {
  const pos = self.start + 1;
  return pos < count$c(self.seq) ? indexedSeq(self.seq, pos) : null;
}
function nth$4(self, idx) {
  return nth$6(self.seq, idx + self.start);
}
function idx2(self, x) {
  return idx3(self, x, 0);
}
function idx3(self, x, idx) {
  if (first$a(self) === x) {
    return idx;
  }
  const nxt = next$9(self);
  return nxt ? idx3(nxt, x, idx + 1) : null;
}
const idx$1 = overload(null, null, idx2, idx3);
function first$a(self) {
  return nth$4(self, 0);
}
function rest$a(self) {
  return indexedSeq(self.seq, self.start + 1);
}
function count$8(self) {
  return count$c(self.seq) - self.start;
}
function reduce$9(self, f, init) {
  let memo = init,
    coll = seq$b(self);
  while (coll && !isReduced(memo)) {
    memo = f(memo, first$e(coll));
    coll = next$b(coll);
  }
  return unreduced(memo);
}
function reducekv$6(self, f, init) {
  let idx = 0;
  return reduce$9(self, function (memo, value) {
    memo = f(memo, idx, value);
    idx += 1;
    return memo;
  }, init);
}
function includes$8(self, x) {
  return detect(function (y) {
    return y === x;
  }, drop(self.start, self.seq));
}
var behave$z = does(iterable, iequiv, keying("IndexedSeq"), implement(ISequential$1), implement(IHashable, {
  hash: hashKeyed
}), implement(IIndexed, {
  nth: nth$4,
  idx: idx$1
}), implement(IReversible, {
  reverse: reverse$2
}), implement(IMapEntry, {
  key: key$1,
  val: val$1
}), implement(IInclusive, {
  includes: includes$8
}), implement(IFind, {
  find: find$3
}), implement(IAssociative, {
  contains: contains$5
}), implement(IAppendable, {
  append: append$4
}), implement(IPrependable, {
  prepend: prepend$4
}), implement(IEmptyableCollection, {
  empty: emptyArray
}), implement(IReducible, {
  reduce: reduce$9
}), implement(IKVReducible, {
  reducekv: reducekv$6
}), implement(IFn, {
  invoke: lookup$6
}), implement(ILookup, {
  lookup: lookup$6
}), implement(ICollection, {
  conj: append$4
}), implement(INext, {
  next: next$9
}), implement(ISeq, {
  first: first$a,
  rest: rest$a
}), implement(ISeqable, {
  seq: identity
}), implement(ICounted, {
  count: count$8
}));

behave$z(IndexedSeq);

function clone$4(self) {
  return new revSeq(self.coll, self.idx);
}
function count$7(self) {
  return count$c(self.coll);
}
function keys$8(self) {
  return range(count$7(self));
}
function vals$3(self) {
  var _self, _nth;
  return map((_nth = nth$3, _self = self, function nth(_argPlaceholder) {
    return _nth(_self, _argPlaceholder);
  }), keys$8(self));
}
function nth$3(self, idx) {
  return nth$6(self.coll, count$7(self) - 1 - idx);
}
function first$9(self) {
  return nth$6(self.coll, self.idx);
}
function rest$9(self) {
  return next$b(self) || emptyList();
}
function next$8(self) {
  return self.idx > 0 ? revSeq(self.coll, self.idx - 1) : null;
}
function conj$6(self, value) {
  return cons(value, self);
}
function reduce2(coll, f) {
  let xs = seq$b(coll);
  return xs ? reduce$f(f, first$e(xs), next$b(xs)) : f();
}
function reduce3(coll, f, init) {
  let memo = init,
    xs = seq$b(coll);
  while (xs) {
    memo = f(memo, first$e(xs));
    if (isReduced(memo)) {
      break;
    }
    xs = next$b(xs);
  }
  return unreduced(memo);
}
const reduce$8 = overload(null, null, reduce2, reduce3);
var behave$y = does(iterable, keying("RevSeq"), implement(ISequential$1), implement(ICounted, {
  count: count$7
}), implement(IIndexed, {
  nth: nth$3
}), implement(ILookup, {
  lookup: nth$3
}), implement(IMap, {
  keys: keys$8,
  vals: vals$3
}), implement(IEmptyableCollection, {
  empty: emptyList
}), implement(IReducible, {
  reduce: reduce$8
}), implement(ICollection, {
  conj: conj$6
}), implement(ISeq, {
  first: first$9,
  rest: rest$9
}), implement(INext, {
  next: next$8
}), implement(ISeqable, {
  seq: identity
}), implement(ICloneable, {
  clone: clone$4
}));

behave$y(RevSeq);

function clone$3(self) {
  return slice(self);
}
function _before(self, reference, inserted) {
  const pos = self.indexOf(reference);
  pos === -1 || self.splice(pos, 0, inserted);
}
function before$1(self, reference, inserted) {
  let arr = Array.from(self);
  _before(arr, reference, inserted);
  return arr;
}
function _after(self, reference, inserted) {
  const pos = self.indexOf(reference);
  pos === -1 || self.splice(pos + 1, 0, inserted);
}
function after$1(self, reference, inserted) {
  let arr = Array.from(self);
  _after(arr, reference, inserted);
  return arr;
}
function keys$7(self) {
  return range(count$6(self));
}
function _dissoc(self, idx) {
  self.splice(idx, 1);
}
function dissoc$3(self, idx) {
  let arr = Array.from(self);
  _dissoc(arr, idx);
  return arr;
}
function reduce$7(xs, f, init) {
  let memo = init,
    to = xs.length - 1;
  for (let i = 0; i <= to; i++) {
    if (isReduced(memo)) break;
    memo = f(memo, xs[i]);
  }
  return unreduced(memo);
}
function reducekv$5(xs, f, init) {
  let memo = init,
    len = xs.length;
  for (let i = 0; i < len; i++) {
    if (isReduced(memo)) break;
    memo = f(memo, i, xs[i]);
  }
  return unreduced(memo);
}
function omit$1(self, value) {
  return filter(function (x) {
    return x !== value;
  }, self);
}
function reverse$1(self) {
  let c = count$6(self);
  return c > 0 ? revSeq(self, c - 1) : null;
}
function key(self) {
  return self[0];
}
function val(self) {
  return self[1];
}
function find$2(self, key) {
  return contains$4(self, key) ? [key, lookup$5(self, key)] : null;
}
function lookup$5(self, key) {
  return key in self ? self[key] : null;
}
function assoc$4(self, key, value) {
  if (key < 0 || key > count$6(self)) {
    throw new Error(`Index ${key} out of bounds`);
  }
  if (lookup$5(self, key) === value) {
    return self;
  }
  const arr = Array.from(self);
  arr.splice(key, 1, value);
  return arr;
}
function contains$4(self, key) {
  return key > -1 && key < self.length;
}
function seq$7(self) {
  return self.length ? self : null;
}
function unconj(self, x) {
  let arr = Array.from(self);
  const pos = arr.lastIndexOf(x);
  arr.splice(pos, 1);
  return arr;
}
function append$3(self, x) {
  return [...self, x];
}
function prepend$3(self, x) {
  return [x, ...self];
}
function next$7(self) {
  return self.length > 1 ? rest$8(self) : null;
}
function first$8(self) {
  return self[0];
}
function rest$8(self) {
  return indexedSeq(self, 1);
}
function includes$7(self, x) {
  return self.includes(x);
}
function count$6(self) {
  return self.length;
}
const nth$2 = lookup$5;
function idx(self, x) {
  const n = self.indexOf(x);
  return n === -1 ? null : n;
}
function fmap$9(self, f) {
  return mapa(f, self);
}
const blank$3 = complement(seq$7);
const iindexed = does(implement(IIndexed, {
  nth: nth$2,
  idx
}), implement(ICounted, {
  count: count$6
}));
function flat$3(self) {
  return self.flat();
}
function flatMap$2(self, f) {
  return self.flatMap(f);
}
var behave$x = does(iequiv, iindexed, keying("Array"), implement(ISequential$1), implement(IFlatMappable, {
  flatMap: flatMap$2,
  flat: flat$3
}), implement(IHashable, {
  hash: hashSeq
}), implement(IMap, {
  dissoc: dissoc$3,
  keys: keys$7,
  vals: identity
}), implement(IMergable, {
  merge: concat
}), implement(IInsertable, {
  before: before$1,
  after: after$1
}), implement(IFunctor, {
  fmap: fmap$9
}), implement(IOmissible, {
  omit: omit$1
}), implement(IReversible, {
  reverse: reverse$1
}), implement(IFind, {
  find: find$2
}), implement(IMapEntry, {
  key,
  val
}), implement(IInclusive, {
  includes: includes$7
}), implement(IAppendable, {
  append: append$3
}), implement(IPrependable, {
  prepend: prepend$3
}), implement(ICloneable, {
  clone: clone$3
}), implement(IFn, {
  invoke: lookup$5
}), implement(IEmptyableCollection, {
  empty: emptyArray
}), implement(IReducible, {
  reduce: reduce$7
}), implement(IKVReducible, {
  reducekv: reducekv$5
}), implement(ILookup, {
  lookup: lookup$5
}), implement(IAssociative, {
  assoc: assoc$4,
  contains: contains$4
}), implement(IBlankable, {
  blank: blank$3
}), implement(ISeqable, {
  seq: seq$7
}), implement(ICollection, {
  conj: append$3,
  unconj
}), implement(INext, {
  next: next$7
}), implement(ISeq, {
  first: first$8,
  rest: rest$8
}));

Object.assign(behaviors, {
  Array: behave$x
});
behave$x(Array);

function conj$5(self, x) {
  return new self.constructor(conj$9(self.colls, [x]));
}
function next$6(self) {
  const tail = rest$e(self);
  return seq$b(tail) ? tail : null;
}
function first$7(self) {
  return first$e(first$e(self.colls));
}
function rest$7(self) {
  return apply(concat, rest$e(first$e(self.colls)), rest$e(self.colls));
}
function reduce$6(self, f, init) {
  let memo = init,
    remaining = self;
  while (!isReduced(memo) && seq$b(remaining)) {
    memo = f(memo, first$e(remaining));
    remaining = next$b(remaining);
  }
  return unreduced(memo);
}
function reducekv$4(self, f, init) {
  let memo = init,
    remaining = self,
    idx = 0;
  while (!isReduced(memo) && seq$b(remaining)) {
    memo = f(memo, idx, first$e(remaining));
    remaining = next$b(remaining);
    idx++;
  }
  return unreduced(memo);
}
function count$5(self) {
  return reduce$6(self, function (memo, value) {
    return memo + 1;
  }, 0);
}
var behave$w = does(iterable,
//TODO reductive?
keying("Concatenated"), implement(IKVReducible, {
  reducekv: reducekv$4
}), implement(IReducible, {
  reduce: reduce$6
}), implement(IHashable, {
  hash: hashSeq
}), implement(ISequential$1), implement(IEmptyableCollection, {
  empty: emptyList
}), implement(ICollection, {
  conj: conj$5
}), implement(INext, {
  next: next$6
}), implement(ISeq, {
  first: first$7,
  rest: rest$7
}), implement(ISeqable, {
  seq: identity
}), implement(ICounted, {
  count: count$5
}));

behave$w(Concatenated);

function date7(year, month, day, hour, minute, second, millisecond) {
  return new Date(year, month || 0, day || 1, hour || 0, minute || 0, second || 0, millisecond || 0);
}
const create = constructs(Date);
const date = overload(create, create, date7);
Date.prototype[Symbol.toStringTag] = "Date";

function isDate(self) {
  return is(self, Date);
}
function monthDays(self) {
  return patch(self, {
    month: inc,
    day: 0
  }).getDate();
}
function weekday(self) {
  return self ? !weekend(self) : null;
}
function weekend(self) {
  const day = dow1(self);
  return day == null ? null : day == 0 || day == 6;
}
function dow1(self) {
  return self ? self.getDay() : null;
}
function dow2(self, n) {
  return self ? dow1(self) === n : null;
}
const dow = overload(null, dow1, dow2);
const year = prop("year");
const month = prop("month");
const day = prop("day");
const hour = prop("hour");
const minute = prop("minute");
//export const second = p.prop("second");
const millisecond = prop("millisecond");
function quarter(self) {
  return Math.ceil((month(self) + 1) / 3);
}
function clockHour(self) {
  const h = self.getHours();
  return (h > 12 ? h - 12 : h) || 12;
}
function pm(self) {
  return self.getHours() >= 12;
}

//dow = 0-6 if day is in first week.  Add 7 for every additional week.
//e.g. Second Saturday is 13 (6 + 7), First Sunday is 0, Second Sunday is 7.
function rdow(self, n) {
  let dt = clone$5(self);
  while (n < 0) {
    dt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 7, dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
    n += 7;
  }
  if (n > 6) {
    const dys = Math.floor(n / 7) * 7;
    dt.setDate(dt.getDate() + dys);
    n = n % 7;
  }
  const offset = n - dt.getDay();
  dt.setDate(dt.getDate() + offset + (offset < 0 ? 7 : 0));
  return dt;
}
function mdow(self, n) {
  return rdow(patch(self, som()), n);
}
function time(hour, minute, second, millisecond) {
  return {
    hour: hour || 0,
    minute: minute || 0,
    second: second || 0,
    millisecond: millisecond || 0
  };
}
function sod() {
  return time(0, 0, 0, 0);
}
function eod() {
  return {
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    day: inc
  };
}
function noon() {
  return time(12, 0, 0, 0);
}
function annually(month, day) {
  return {
    month: month,
    day: day,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
}
const midnight = sod;
function som() {
  return {
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
}
function eom() {
  return {
    month: inc,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
}
function soy() {
  return {
    month: 0,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
}
function eoy() {
  return {
    year: inc,
    month: 0,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
}
function tick(n) {
  return {
    millisecond: n
  };
}
function untick() {
  return tick(dec);
}

var p$4 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  directed: directed,
  steps: steps,
  subtract: subtract,
  add: add$3,
  inc: inc,
  dec: dec,
  get: get,
  getIn: getIn,
  reduce: reduce$f,
  reducing: reducing,
  includes: includes$a,
  excludes: excludes,
  transpose: transpose,
  assoc: assoc$8,
  assocIn: assocIn,
  update: update,
  contains: contains$8,
  updateIn: updateIn,
  rewrite: rewrite,
  prop: prop,
  patch: patch,
  keys: keys$b,
  vals: vals$5,
  dissoc: dissoc$5,
  coerce: coerce$1
});

var _Duration, _p$coerce$1, _p$1, _mult;
const toDuration = (_p$1 = p$4, _p$coerce$1 = _p$1.coerce, _Duration = Duration, function coerce(_argPlaceholder) {
  return _p$coerce$1.call(_p$1, _argPlaceholder, _Duration);
});
function Duration(units) {
  this.units = units;
}
function valueOf() {
  const units = this.units;
  return (units.year || 0) * 1000 * 60 * 60 * 24 * 365.25 + (units.month || 0) * 1000 * 60 * 60 * 24 * 30.4375 + (units.day || 0) * 1000 * 60 * 60 * 24 + (units.hour || 0) * 1000 * 60 * 60 + (units.minute || 0) * 1000 * 60 + (units.second || 0) * 1000 + (units.millisecond || 0);
}
function unit(key) {
  return function (n) {
    return new Duration(assoc$8({}, key, n));
  };
}
const years = unit("year");
const months = unit("month");
const days = unit("day");
const hours = unit("hour");
const minutes = unit("minute");
const seconds = unit("second");
const milliseconds = unit("millisecond");
const duration = overload(null, branch(isNumber, milliseconds, constructs(Duration)), function (start, end) {
  return milliseconds(end - start);
});
const weeks = comp(days, (_mult = mult$2, function mult(_argPlaceholder2) {
  return _mult(_argPlaceholder2, 7);
}));
Duration.prototype[Symbol.toStringTag] = "Duration";
Duration.prototype.valueOf = valueOf;
Duration.units = ["year", "month", "day", "hour", "minute", "second", "millisecond"];

function reducekv$3(self, f, init) {
  return reduce$f(function (memo, key) {
    return f(memo, key, lookup$4(self, key));
  }, init, keys$6(self));
}
const merge$3 = partial(mergeWith, add$3);
function mult(self, n) {
  return fmap$8(self, function (value) {
    return value * n;
  });
}
function fmap$8(self, f) {
  return new self.constructor(reducekv$3(self, function (memo, key, value) {
    return assoc$8(memo, key, f(value));
  }, {}));
}
function keys$6(self) {
  return keys$b(self.units);
}
function dissoc$2(self, key) {
  return new self.constructor(dissoc$5(self.units, key));
}
function lookup$4(self, key) {
  if (!includes$a(Duration.units, key)) {
    throw new Error("Invalid unit.");
  }
  return get(self.units, key);
}
function contains$3(self, key) {
  return contains$8(self.units, key);
}
function assoc$3(self, key, value) {
  if (!includes$a(Duration.units, key)) {
    throw new Error("Invalid unit.");
  }
  return new self.constructor(assoc$8(self.units, key, value));
}
function divide$2(a, b) {
  return a.valueOf() / b.valueOf();
}
var behave$v = does(keying("Duration"), implement(IKVReducible, {
  reducekv: reducekv$3
}), implement(IAddable, {
  add: merge$3
}), implement(IMergable, {
  merge: merge$3
}), implement(IFunctor, {
  fmap: fmap$8
}), implement(IAssociative, {
  assoc: assoc$3,
  contains: contains$3
}), implement(ILookup, {
  lookup: lookup$4
}), implement(IMap, {
  keys: keys$6,
  dissoc: dissoc$2
}), implement(IDivisible, {
  divide: divide$2
}), implement(IMultipliable, {
  mult
}));

behave$v(Duration);

function add$1(self, other) {
  return mergeWith(add$3, self, isNumber(other) ? days(other) : other);
}
function lookup$3(self, key) {
  switch (key) {
    case "year":
      return self.getFullYear();
    case "month":
      return self.getMonth();
    case "day":
      return self.getDate();
    case "hour":
      return self.getHours();
    case "minute":
      return self.getMinutes();
    case "second":
      return self.getSeconds();
    case "millisecond":
      return self.getMilliseconds();
  }
}
function InvalidKeyError(key, target) {
  this.key = key;
  this.target = target;
}
function contains$2(self, key) {
  return keys$5().indexOf(key) > -1;
}
function keys$5(self) {
  return ["year", "month", "day", "hour", "minute", "second", "millisecond"];
}
function vals$2(self) {
  return reduce$f(function (memo, key) {
    memo.push(get(self, key));
    return memo;
  }, [], keys$5());
}
function conj$4(self, [key, value]) {
  return assoc$2(self, key, value);
}

//the benefit of exposing internal state as a map is assocIn and updateIn
function assoc$2(self, key, value) {
  const dt = new Date(self.valueOf());
  switch (key) {
    case "year":
      dt.setFullYear(value);
      break;
    case "month":
      dt.setMonth(value);
      break;
    case "day":
      dt.setDate(value);
      break;
    case "hour":
      dt.setHours(value);
      break;
    case "minute":
      dt.setMinutes(value);
      break;
    case "second":
      dt.setSeconds(value);
      break;
    case "millisecond":
      dt.setMilliseconds(value);
      break;
    default:
      throw new InvalidKeyError(key, self);
  }
  return dt;
}
function clone$2(self) {
  return new Date(self.valueOf());
}
function equiv$7(self, other) {
  return other != null && deref$9(self) === deref$b(other);
}
function compare$3(self, other) {
  return other == null ? -1 : deref$9(self) - deref$b(other);
}
function reduce$5(self, f, init) {
  return reduce$f(function (memo, key) {
    const value = get(self, key);
    return f(memo, [key, value]);
  }, init, keys$5());
}
function reducekv$2(self, f, init) {
  return reduce$5(self, function (memo, [key, value]) {
    return f(memo, key, value);
  }, init);
}
function deref$9(self) {
  return self.valueOf();
}
function hash$3(self) {
  return self.valueOf();
}
var behave$u = does(keying("Date"), implement(IHashable, {
  hash: hash$3
}), implement(IAddable, {
  add: add$1
}), implement(IDeref, {
  deref: deref$9
}), implement(IBounded, {
  start: identity,
  end: identity
}), implement(ISeqable, {
  seq: identity
}), implement(IReducible, {
  reduce: reduce$5
}), implement(IKVReducible, {
  reducekv: reducekv$2
}), implement(IEquiv, {
  equiv: equiv$7
}), implement(IMap, {
  keys: keys$5,
  vals: vals$2
}), implement(IComparable, {
  compare: compare$3
}), implement(ICollection, {
  conj: conj$4
}), implement(IAssociative, {
  assoc: assoc$2,
  contains: contains$2
}), implement(ILookup, {
  lookup: lookup$3
}), implement(ICloneable, {
  clone: clone$2
}));

Object.assign(behaviors, {
  Date: behave$u
});
behave$u(Date);

const error = constructs(Error);

function isError(self) {
  return ako(self, Error);
}

var behave$t = keying("Error");

behave$t(Error);

Function.prototype[Symbol.toStringTag] = "Function";

function append$2(f, ...applied) {
  return function (...args) {
    return f.apply(this, args.concat(applied));
  };
}
function invoke$2(self, ...args) {
  return self.apply(null, args);
}
function name$1(self) {
  return self.name ? self.name : get(/function (.+)\s?\(/.exec(self.toString()), 1); //latter is for IE
}

var behave$s = does(keying("Function"), implement(INamable, {
  name: name$1
}), implement(IAppendable, {
  append: append$2
}), implement(IPrependable, {
  prepend: partial
}), implement(IFn, {
  invoke: invoke$2
}));

behave$s(Function);

function GUID(id) {
  this.id = id;
}
GUID.prototype[Symbol.toStringTag] = "GUID";
GUID.prototype.toString = function () {
  return this.id;
};
function s4() {
  return Math.floor((1 + rand()) * 0x10000).toString(16).substring(1);
}
function guid1(id) {
  return new GUID(id);
}
function guid0() {
  return guid1(s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
}
const guid = overload(guid0, guid1);

function equiv$6(self, other) {
  return kin(self, other) && self.id === other.id;
}
function hash$2(self) {
  return hash$7(self.id);
}
var behave$r = does(keying("GUID"), implement(IHashable, {
  hash: hash$2
}), implement(IEquiv, {
  equiv: equiv$6
}));

behave$r(GUID);

function Chance(text) {
  //better if a phrase or sentence
  const seed = murmurHash3(text);
  this.text = text;
  this.random = simpleFastCounter32(seed(), seed());
}
function chance(text = guid()) {
  return new Chance(text);
}

//credit: https://www.delftstack.com/howto/javascript/javascript-random-seed-to-generate-random/

function murmurHash3(string) {
  let i = 0,
    hash;
  for (hash = 1779033703 ^ string.length; i < string.length; i++) {
    let bitwise_xor_from_character = hash ^ string.charCodeAt(i);
    hash = Math.imul(bitwise_xor_from_character, 3432918353);
    hash = hash << 13 | hash >>> 19;
  }
  return function () {
    // Return the hash that you can use as a seed
    hash = Math.imul(hash ^ hash >>> 16, 2246822507);
    hash = Math.imul(hash ^ hash >>> 13, 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}
function simpleFastCounter32(seed_1, seed_2, seed_3, seed_4) {
  return function () {
    seed_1 >>>= 0;
    seed_2 >>>= 0;
    seed_3 >>>= 0;
    seed_4 >>>= 0;
    let cast32 = seed_1 + seed_2 | 0;
    seed_1 = seed_2 ^ seed_2 >>> 9;
    seed_2 = seed_3 + (seed_3 << 3) | 0;
    seed_3 = seed_3 << 21 | seed_3 >>> 11;
    seed_4 = seed_4 + 1 | 0;
    cast32 = cast32 + seed_4 | 0;
    seed_3 = seed_3 + cast32 | 0;
    return (cast32 >>> 0) / 4294967296;
  };
}

function Indexed(obj) {
  this.obj = obj;
}
Indexed.prototype[Symbol.toStringTag] = "Indexed";
function indexed(obj) {
  return new Indexed(obj);
}

function count$4(self) {
  return self.obj.length;
}
function nth$1(self, idx) {
  return self.obj[idx];
}
function first$6(self) {
  return nth$1(self, 0);
}
function rest$6(self) {
  return next$5(self) || emptyList();
}
function next$5(self) {
  return count$4(self) > 1 ? indexedSeq(self, 1) : null;
}
function seq$6(self) {
  return count$4(self) ? self : null;
}
function includes$6(self, value) {
  return !!some$1(function (x) {
    return x === value;
  }, self);
}
function keys$4(self) {
  return range(count$4(self));
}
var behave$q = does(iterable, reductive, keying("Indexed"), implement(IHashable, {
  hash: hashKeyed
}), implement(IMap, {
  keys: keys$4
}), implement(ISequential$1), implement(IInclusive, {
  includes: includes$6
}), implement(IIndexed, {
  nth: nth$1
}), implement(ILookup, {
  lookup: nth$1
}), implement(INext, {
  next: next$5
}), implement(ISeq, {
  first: first$6,
  rest: rest$6
}), implement(ISeqable, {
  seq: seq$6
}), implement(ICounted, {
  count: count$4
}));

behave$q(Indexed);

function Journal(pos, max, history, state) {
  this.pos = pos;
  this.max = max;
  this.history = history;
  this.state = state;
}
Journal.prototype[Symbol.toStringTag] = "Journal";
function journal2(max, state) {
  return new Journal(0, max, [state], state);
}
function journal1(state) {
  return journal2(Infinity, state);
}
const journal = overload(null, journal1, journal2);

const append$1 = overload(null, identity, IAppendable.append, reducing(IAppendable.append));

const blank$2 = IBlankable.blank;
function blot(self) {
  return blank$2(self) ? null : self;
}

const start$1 = IBounded.start;
const end$1 = IBounded.end;
function chronology(item) {
  const s = start$1(item),
    e = end$1(item);
  return s == null || e == null ? [s, e] : [s, e].sort(compare$6);
}

//The end range value must also be the start range value of the next successive range to avoid infinitisimally small gaps.
//As such, the end range value cannot itself be considered part of a range, for if it did that value would nonsensically belong to two successive ranges.

function inside(sr, er, b) {
  if (b == null) {
    return false;
  }
  if (sr == null && er == null) {
    return true;
  }
  return (sr == null || compare$6(b, sr) >= 0) && (er == null || compare$6(b, er) < 0);
}
function between(a, b) {
  const [sa, ea] = chronology(a),
    [sb, eb] = chronology(b);
  return inside(sa, ea, sb) && inside(sa, ea, eb);
}
function overlap(self, other) {
  const make = constructs(self.constructor),
    ss = start$1(self),
    es = end$1(self),
    so = start$1(other),
    eo = end$1(other),
    sn = isNil(ss) || isNil(so) ? ss || so : gt(ss, so) ? ss : so,
    en = isNil(es) || isNil(eo) ? es || eo : lt(es, eo) ? es : eo;
  return lte(sn, en) ? make(sn, en) : null;
}

function compact0() {
  //transducer
  return filter(identity);
}
function compact1$1(self) {
  return satisfies(ICompactible, self) ? ICompactible.compact(self) : filter(identity, self);
}
const compact$1 = overload(compact0, compact1$1);
const only = unspread(compact$1);

const dispose = IDisposable.dispose;

const divide$1 = overload(null, identity, IDivisible.divide, reducing(IDivisible.divide));

const empty$2 = IEmptyableCollection.empty;

const find$1 = IFind.find;

var _noop, _IForkable$fork, _IForkable;
const fork$5 = overload(null, null, (_IForkable = IForkable, _IForkable$fork = _IForkable.fork, _noop = noop$1, function fork(_argPlaceholder, _argPlaceholder2) {
  return _IForkable$fork.call(_IForkable, _argPlaceholder, _noop, _argPlaceholder2);
}), IForkable.fork);

const path$1 = IPath.path;

function Lens(root, path) {
  this.root = root;
  this.path = path;
}
Lens.prototype[Symbol.toStringTag] = "Lens";
function lens(root, path) {
  return new Lens(root, path || []);
}

var _juxt, _map;
function downward(f) {
  return function down(self) {
    const xs = f(self),
      ys = mapcat(down, xs);
    return concat(xs, ys);
  };
}
function upward(f) {
  return function up(self) {
    const other = f(self);
    return other ? cons(other, up(other)) : emptyList();
  };
}
const root$2 = IHierarchy.root;
const parent$1 = IHierarchy.parent;
const parents$2 = IHierarchy.parents;
const closest$2 = IHierarchy.closest;
const ancestors = IHierarchy.parents;
const children$1 = IHierarchy.children;
const descendants$1 = IHierarchy.descendants;
const nextSibling$2 = IHierarchy.nextSibling;
const prevSibling$2 = IHierarchy.prevSibling;
const nextSiblings$2 = IHierarchy.nextSiblings;
const prevSiblings$2 = IHierarchy.prevSiblings;
const siblings$2 = IHierarchy.siblings;
function leaves(self) {
  return remove(comp(count$c, children$1), descendants$1(self));
}
const asLeaves = comp((_map = map, _juxt = juxt(path$1, deref$b), function map(_argPlaceholder) {
  return _map(_juxt, _argPlaceholder);
}), leaves, lens);

const identifier = IIdentifiable.identifier;

function afterN(self, ...els) {
  let ref = self;
  while (els.length) {
    let el = els.shift();
    IInsertable.after(ref, el);
    ref = el;
  }
}
const after = overload(null, identity, IInsertable.after, afterN);
function beforeN(self, ...els) {
  let ref = self;
  while (els.length) {
    let el = els.pop();
    IInsertable.before(ref, el);
    ref = el;
  }
}
const before = overload(null, identity, IInsertable.before, beforeN);

const log = ILogger.log;

const name = INamable.name;

const otherwise$4 = IOtherwise.otherwise;

const prepend$2 = overload(null, identity, IPrependable.prepend, reducing(IPrependable.prepend, reverse$4));

const query = IQueryable.query;

const reset$2 = IResettable.reset;
const resettable$1 = IResettable.resettable;

const crunch$1 = IRevertible.crunch;
const crunchable$1 = IRevertible.crunchable;
const undo$1 = IRevertible.undo;
const undoable$1 = IRevertible.undoable;
const redo$1 = IRevertible.redo;
const redoable$1 = IRevertible.redoable;
const flush$1 = IRevertible.flush;
const flushable$1 = IRevertible.flushable;
const revision$1 = overload(null, function (self) {
  return IRevertible.revision(self, self.pos);
}, IRevertible.revision);

const send = ISend.send;

function sequential(items) {
  return satisfies(ISequential$1, items) ? items : cons(items);
}

var _ISet$unite, _reduce;
const disj$1 = overload(null, identity, ISet.disj, reducing(ISet.disj));
const union2 = (_reduce = reduce$f, _ISet$unite = ISet.unite, function reduce(_argPlaceholder, _argPlaceholder2) {
  return _reduce(_ISet$unite, _argPlaceholder, _argPlaceholder2);
});
function intersection2(xs, ys) {
  return reduce$f(function (memo, x) {
    return includes$a(ys, x) ? conj$9(memo, x) : memo;
  }, empty$2(xs), xs);
}
function difference2(xs, ys) {
  return reduce$f(function (memo, x) {
    return includes$a(ys, x) ? memo : conj$9(memo, x);
  }, empty$2(xs), xs);
}
function subset(self, other) {
  var _other, _includes;
  return every((_includes = includes$a, _other = other, function includes(_argPlaceholder3) {
    return _includes(_other, _argPlaceholder3);
  }), self);
}
function superset(self, other) {
  return subset(other, self);
}
const unite = overload(null, null, ISet.unite, reducing(ISet.unite));
const union = overload(null, identity, union2, reducing(union2));
const intersection = overload(null, null, intersection2, reducing(intersection2));
const difference = overload(null, null, difference2, reducing(difference2));

const split$2 = ISplittable.split;

function swap3(self, f, a) {
  return ISwappable.swap(self, function (state) {
    return f(state, a);
  });
}
function swap4(self, f, a, b) {
  return ISwappable.swap(self, function (state) {
    return f(state, a, b);
  });
}
function swapN(self, f, a, b, cs) {
  return ISwappable.swap(self, function (state) {
    return f.apply(null, [state, a, b, ...cs]);
  });
}
const swap$1 = overload(null, null, ISwappable.swap, swap3, swap4, swapN);

const fill$2 = ITemplate.fill;
function template(self, ...args) {
  return fill$2(self, args);
}

var p$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  directed: directed,
  steps: steps,
  subtract: subtract,
  add: add$3,
  inc: inc,
  dec: dec,
  append: append$1,
  assoc: assoc$8,
  assocIn: assocIn,
  update: update,
  contains: contains$8,
  updateIn: updateIn,
  rewrite: rewrite,
  prop: prop,
  patch: patch,
  blank: blank$2,
  blot: blot,
  start: start$1,
  end: end$1,
  inside: inside,
  between: between,
  overlap: overlap,
  flatMap: flatMap$3,
  flat: flat$4,
  cat: cat,
  clone: clone$5,
  coerce: coerce$1,
  conj: conj$9,
  unconj: unconj$1,
  compact: compact$1,
  only: only,
  compare: compare$6,
  lt: lt,
  lte: lte,
  gt: gt,
  gte: gte,
  inverse: inverse$1,
  count: count$c,
  deref: deref$b,
  dispose: dispose,
  divide: divide$1,
  empty: empty$2,
  kin: kin,
  equiv: equiv$b,
  alike: alike,
  equivalent: equivalent,
  eq: eq,
  notEq: notEq,
  find: find$1,
  invoke: invoke$3,
  invokable: invokable,
  fork: fork$5,
  fmap: fmap$b,
  thrush: thrush,
  pipeline: pipeline,
  hashTag: hashTag,
  hash: hash$7,
  isValueObject: isValueObject,
  downward: downward,
  upward: upward,
  root: root$2,
  parent: parent$1,
  parents: parents$2,
  closest: closest$2,
  ancestors: ancestors,
  children: children$1,
  descendants: descendants$1,
  nextSibling: nextSibling$2,
  prevSibling: prevSibling$2,
  nextSiblings: nextSiblings$2,
  prevSiblings: prevSiblings$2,
  siblings: siblings$2,
  leaves: leaves,
  asLeaves: asLeaves,
  identifier: identifier,
  nth: nth$6,
  idx: idx$3,
  includes: includes$a,
  excludes: excludes,
  transpose: transpose,
  after: after,
  before: before,
  reducekv2: reducekv2,
  reducekv3: reducekv3,
  reducekv: reducekv$a,
  log: log,
  get: get,
  getIn: getIn,
  keys: keys$b,
  vals: vals$5,
  dissoc: dissoc$5,
  key: key$3,
  val: val$2,
  is: is,
  ako: ako,
  keying: keying,
  merge: merge$5,
  mult: mult$2,
  name: name,
  next: next$b,
  otherwise: otherwise$4,
  path: path$1,
  prepend: prepend$2,
  query: query,
  reduce: reduce$f,
  reducing: reducing,
  reset: reset$2,
  resettable: resettable$1,
  reverse: reverse$4,
  crunch: crunch$1,
  crunchable: crunchable$1,
  undo: undo$1,
  undoable: undoable$1,
  redo: redo$1,
  redoable: redoable$1,
  flush: flush$1,
  flushable: flushable$1,
  revision: revision$1,
  send: send,
  first: first$e,
  rest: rest$e,
  seq: seq$b,
  sequential: sequential,
  disj: disj$1,
  subset: subset,
  superset: superset,
  unite: unite,
  union: union,
  intersection: intersection,
  difference: difference,
  split: split$2,
  swap: swap$1,
  fill: fill$2,
  template: template,
  omit: omit$3
});

function undo(self) {
  const pos = self.pos + 1;
  return undoable(self) ? new Journal(pos, self.max, self.history, self.history[pos]) : self;
}
function redo(self) {
  const pos = self.pos - 1;
  return redoable(self) ? new Journal(pos, self.max, self.history, self.history[pos]) : self;
}
function flush(self) {
  return new Journal(0, self.max, [self.state], self.state);
}
function flushable(self) {
  return count$c(self.history) > 1;
}
const crunchable = flushable;
function crunch(self) {
  return crunchable(self) ? new Journal(self.pos, self.max, toArray(splice(self.history, count$c(self.history) - 1, 1, [])), self.state) : self;
}
function undoable(self) {
  return self.pos + 1 < count$c(self.history);
}
function redoable(self) {
  return self.pos > 0;
}
function reset$1(self) {
  const at = count$c(self.history) - 1,
    state = nth$6(self.history, at);
  return new Journal(at, self.max, self.history, state);
}
function resettable(self) {
  return self.pos !== count$c(self.history) - 1;
}
function deref$8(self) {
  return self.state;
}
function fmap$7(self, f) {
  const revised = f(self.state);
  return new Journal(0, self.max, prepend$2(self.pos ? slice(self.history, self.pos) : self.history, revised), revised);
}
function revision(self, pos) {
  return [self.history[pos], self.history[pos + 1] || null];
}
var behave$p = does(keying("Journal"), implement(IDeref, {
  deref: deref$8
}), implement(IFunctor, {
  fmap: fmap$7
}), implement(IResettable, {
  reset: reset$1,
  resettable
}), implement(IRevertible, {
  undo,
  redo,
  flush,
  crunch,
  flushable,
  crunchable,
  undoable,
  redoable,
  revision
}));

behave$p(Journal);

function monadic(construct, flat) {
  function fmap(self, f) {
    return construct(f(self.value));
  }
  function deref(self) {
    return self.value;
  }
  return does(implement(IDeref, {
    deref
  }), implement(IFlatMappable, {
    flat
  }), implement(IFunctor, {
    fmap
  }));
}

function otherwise$3(self) {
  return self.value;
}
function flat$2(self) {
  return self.value instanceof Just ? self.value : self;
}
var behave$o = does(keying("Just"), monadic(maybe, flat$2), implement(IOtherwise, {
  otherwise: otherwise$3
}));

behave$o(Just);

function Left(value) {
  this.value = value;
}
Left.prototype[Symbol.toStringTag] = "Left";
const left = thrush(constructs(Left));

const fmap$6 = identity;
const flat$1 = identity;
function fork$4(self, reject, resolve) {
  reject(self.value);
}
function deref$7(self) {
  return self.value;
}
var behave$n = does(keying("Left"), monadic(left, flat$1), implement(IDeref, {
  deref: deref$7
}), implement(IForkable, {
  fork: fork$4
}), implement(IFunctor, {
  fmap: fmap$6
}));

behave$n(Left);

var p$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  keys: keys$b,
  vals: vals$5,
  dissoc: dissoc$5,
  assoc: assoc$8,
  assocIn: assocIn,
  update: update,
  contains: contains$8,
  updateIn: updateIn,
  rewrite: rewrite,
  prop: prop,
  patch: patch,
  seq: seq$b,
  get: get,
  getIn: getIn,
  includes: includes$a,
  excludes: excludes,
  transpose: transpose,
  first: first$e,
  rest: rest$e,
  coerce: coerce$1,
  reverse: reverse$4,
  downward: downward,
  upward: upward,
  root: root$2,
  parent: parent$1,
  parents: parents$2,
  closest: closest$2,
  ancestors: ancestors,
  children: children$1,
  descendants: descendants$1,
  nextSibling: nextSibling$2,
  prevSibling: prevSibling$2,
  nextSiblings: nextSiblings$2,
  prevSiblings: prevSiblings$2,
  siblings: siblings$2,
  leaves: leaves,
  asLeaves: asLeaves,
  conj: conj$9,
  unconj: unconj$1,
  clone: clone$5
});

function path(self) {
  return self.path;
}
function deref$6(self) {
  return getIn(self.root, self.path);
}
function conj$3(self, value) {
  var _value, _p$conj, _p;
  return swap(self, (_p = p$2, _p$conj = _p.conj, _value = value, function conj(_argPlaceholder) {
    return _p$conj.call(_p, _argPlaceholder, _value);
  }));
}
function lookup$2(self, key) {
  return Object.assign(clone$5(self), {
    path: conj$9(self.path, key)
  });
}
function assoc$1(self, key, value) {
  var _key, _value2, _p$assoc, _p2;
  return swap(self, (_p2 = p$2, _p$assoc = _p2.assoc, _key = key, _value2 = value, function assoc(_argPlaceholder2) {
    return _p$assoc.call(_p2, _argPlaceholder2, _key, _value2);
  }));
}
function contains$1(self, key) {
  return includes$a(keys$3(self), key);
}
function dissoc$1(self, key) {
  var _key2, _p$dissoc, _p3;
  return swap(self, (_p3 = p$2, _p$dissoc = _p3.dissoc, _key2 = key, function dissoc(_argPlaceholder3) {
    return _p$dissoc.call(_p3, _argPlaceholder3, _key2);
  }));
}
function reset(self, value) {
  return Object.assign(clone$5(self), {
    root: assocIn(self.root, self.path, value)
  });
}
function swap(self, f) {
  return Object.assign(clone$5(self), {
    root: updateIn(self.root, self.path, f)
  });
}
function fmap$5(self, f) {
  return Object.assign(clone$5(self), {
    path: f(self.path)
  });
}
function root$1(self) {
  return Object.assign(clone$5(self), {
    path: []
  });
}
function children(self) {
  return map(function (key) {
    return Object.assign(clone$5(self), {
      path: conj$9(self.path, key)
    });
  }, keys$3(self));
}
function keys$3(self) {
  const value = deref$6(self);
  return satisfies(IMap, value) ? keys$b(value) : emptyList();
}
function vals$1(self) {
  var _value3, _p$get, _p4;
  const value = deref$6(self);
  return map((_p4 = p$2, _p$get = _p4.get, _value3 = value, function get(_argPlaceholder4) {
    return _p$get.call(_p4, _value3, _argPlaceholder4);
  }), keys$3(self));
}
function siblings$1(self) {
  const p = parent(self),
    ctx = toArray(butlast(self.path)),
    key = last(self.path);
  return map(function (key) {
    return Object.assign(p.clone(self), {
      path: p.conj(ctx, key)
    });
  }, remove(function (k) {
    return k === key;
  }, p ? keys$3(p) : []));
}
function prevSiblings$1(self) {
  const p = parent(self),
    ctx = toArray(butlast(self.path)),
    key = last(self.path);
  return map(function (key) {
    return Object.assign(p.clone(self), {
      path: p.conj(ctx, key)
    });
  }, p.reverse(toArray(take(1, takeWhile(function (k) {
    return k !== key;
  }, p ? keys$3(p) : [])))));
}
function nextSiblings$1(self) {
  const p = parent(self),
    ctx = toArray(butlast(self.path)),
    key = last(self.path);
  return map(function (key) {
    return Object.assign(p.clone(self), {
      path: p.conj(ctx, key)
    });
  }, drop(1, dropWhile(function (k) {
    return k !== key;
  }, p ? keys$3(p) : [])));
}
const prevSibling$1 = comp(first$e, prevSiblings$1);
const nextSibling$1 = comp(first$e, nextSiblings$1);
function parent(self) {
  return seq$b(self.path) ? Object.assign(clone$5(self), {
    path: toArray(butlast(self.path))
  }) : null;
}
function parents$1(self) {
  return lazySeq(function () {
    const p = parent(self);
    return p ? cons(p, parents$1(p)) : emptyList();
  });
}
function closest$1(self, pred) {
  return detect(comp(pred, deref$6), cons(self, parents$1(self)));
}
const descendants = downward(children);
var behave$m = does(keying("Lens"), implement(IPath, {
  path
}), implement(ICollection, {
  conj: conj$3
}), implement(ILookup, {
  lookup: lookup$2
}), implement(IAssociative, {
  assoc: assoc$1,
  contains: contains$1
}), implement(IMap, {
  keys: keys$3,
  vals: vals$1,
  dissoc: dissoc$1
}), implement(IFunctor, {
  fmap: fmap$5
}), implement(ISwappable, {
  swap
}), implement(IResettable, {
  reset
}), implement(IHierarchy, {
  root: root$1,
  children,
  parents: parents$1,
  parent,
  closest: closest$1,
  descendants,
  siblings: siblings$1,
  nextSiblings: nextSiblings$1,
  nextSibling: nextSibling$1,
  prevSiblings: prevSiblings$1,
  prevSibling: prevSibling$1
}), implement(IDeref, {
  deref: deref$6
}));

behave$m(Lens);

function first$5(self) {
  return self.head;
}
function rest$5(self) {
  return self.tail;
}
var behave$l = does(lazyseq, keying("List"), implement(IHashable, {
  hash: hashSeq
}), implement(ISeqable, {
  seq: identity
}), implement(ISeq, {
  first: first$5,
  rest: rest$5
}));

behave$l(List);

function Members(items, f) {
  this.items = items;
  this.f = f;
}
function members(f) {
  const g = comp(f, sequential);
  return thrush(function construct(items) {
    return new Members(g(items), g);
  });
}

function seq$5(self) {
  return seq$b(self.items);
}
function first$4(self) {
  return first$e(self.items);
}
function rest$4(self) {
  return next$4(self) || empty$1(self);
}
function next$4(self) {
  const items = next$b(self.items);
  return items ? Object.assign(clone$5(self), {
    items
  }) : null;
}
function append(self, other) {
  return Object.assign(clone$5(self), {
    items: append$1(self.items, other)
  });
}
function prepend$1(self, other) {
  return Object.assign(clone$5(self), {
    items: prepend$2(self.items, other)
  });
}
function includes$5(self, name) {
  return includes$a(self.items, name);
}
function count$3(self) {
  return count$c(self.items);
}
function empty$1(self) {
  return clone$5(self, {
    items: []
  });
}
function reduce$4(self, f, init) {
  return reduce$f(f, init, self.items);
}
var behave$k = does(iterable, keying("Series"), implement(ISequential$1), implement(ICounted, {
  count: count$3
}), implement(IInclusive, {
  includes: includes$5
}), implement(IAppendable, {
  append
}), implement(IPrependable, {
  prepend: prepend$1
}), implement(IEmptyableCollection, {
  empty: empty$1
}), implement(ISeqable, {
  seq: seq$5
}), implement(INext, {
  next: next$4
}), implement(IReducible, {
  reduce: reduce$4
}), implement(ISeq, {
  first: first$4,
  rest: rest$4
}));

function fmap$4(self, f) {
  return new self.constructor(self.f(mapcat(comp(sequential, f), self.items)), self.f);
}
function seq$4(self) {
  return seq$b(self.items);
}
function deref$5(self) {
  return self.items;
}
var behave$j = does(behave$k, keying("Members"), implement(IDeref, {
  deref: deref$5
}), implement(ISeqable, {
  seq: seq$4
}), implement(IFunctor, {
  fmap: fmap$4
}));

behave$j(Members);

function Mutable(state) {
  this.state = state;
}
function mutable(state) {
  return new Mutable(state);
}
Mutable.prototype[Symbol.toStringTag] = "Mutable";

function mutate(self, effect) {
  effect(self.state);
  return self.state;
}

function deref$4(self) {
  return self.state;
}
var behave$i = does(keying("Mutable"), implement(IDeref, {
  deref: deref$4
}));

behave$i(Mutable);

function invoke$1(self, ...args) {
  const key = self.dispatch.apply(this, args);
  const hashcode = hash$7(key);
  const potentials = self.methods[hashcode];
  const f = some$1(function ([k, h]) {
    return equiv$b(k, key) ? h : null;
  }, potentials) || self.fallback || function () {
    throw new Error("Unable to locate appropriate method.");
  };
  return f.apply(this, args);
}
var behave$h = does(keying("Multimethod"), implement(IFn, {
  invoke: invoke$1
}));

behave$h(Multimethod);

function otherwise$2(self, other) {
  return other;
}
const deref$3 = constantly(null);
var behave$g = does(keying("Nothing"), implement(IDeref, {
  deref: deref$3
}), implement(IOtherwise, {
  otherwise: otherwise$2
}), implement(IFlatMappable, {
  flatMap: identity
}), implement(IFunctor, {
  fmap: identity
}));

behave$g(Nothing);

const object = constructs(Object);
function emptyObject() {
  return {};
}

var p$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  compare: compare$6,
  lt: lt,
  lte: lte,
  gt: gt,
  gte: gte,
  kin: kin,
  equiv: equiv$b,
  alike: alike,
  equivalent: equivalent,
  eq: eq,
  notEq: notEq,
  reduce: reduce$f,
  reducing: reducing,
  reducekv2: reducekv2,
  reducekv3: reducekv3,
  reducekv: reducekv$a,
  get: get,
  getIn: getIn,
  keys: keys$b,
  vals: vals$5,
  dissoc: dissoc$5,
  key: key$3,
  val: val$2,
  is: is,
  ako: ako,
  keying: keying,
  assoc: assoc$8,
  assocIn: assocIn,
  update: update,
  contains: contains$8,
  updateIn: updateIn,
  rewrite: rewrite,
  prop: prop,
  patch: patch,
  clone: clone$5,
  count: count$c,
  next: next$b,
  first: first$e,
  rest: rest$e,
  seq: seq$b,
  includes: includes$a,
  excludes: excludes,
  transpose: transpose,
  empty: empty$2,
  invoke: invoke$3,
  invokable: invokable,
  coerce: coerce$1
});

var _Object, _p$coerce, _p;
const toObject = (_p = p$1, _p$coerce = _p.coerce, _Object = Object, function coerce(_argPlaceholder) {
  return _p$coerce.call(_p, _argPlaceholder, _Object);
});
function isObject(self) {
  return is(self, Object);
}

//an entity is has descriptive key/value pairs whereas an array does not.
function descriptive$1(self) {
  return satisfies(ILookup, self) && satisfies(IMap, self) && !satisfies(IIndexed, self);
}
function subsumes(self, other) {
  return reducekv$a(function (memo, key, value) {
    return memo ? contains$8(self, key, value) : reduced(memo);
  }, true, other);
}
const emptied = branch(satisfies(IEmptyableCollection), empty$2, emptyObject);
function juxtVals(self, value) {
  return reducekv$a(function (memo, key, f) {
    return assoc$8(memo, key, isFunction(f) ? f(value) : f);
  }, emptied(self), self);
}
function selectKeys(self, keys) {
  return reduce$f(function (memo, key) {
    return assoc$8(memo, key, get(self, key));
  }, emptied(self), keys);
}
function removeKeys(self, keys) {
  return reducekv$a(function (memo, key, value) {
    return includes$a(keys, key) ? memo : assoc$8(memo, key, value);
  }, emptied(self), self);
}
function mapKeys(self, f) {
  return reducekv$a(function (memo, key, value) {
    return assoc$8(memo, f(key), value);
  }, emptied(self), self);
}
function mapVals2(self, f) {
  return reducekv$a(function (memo, key, value) {
    return assoc$8(memo, key, f(value));
  }, self, self);
}
function mapVals3(init, f, pred) {
  return reduce$f(function (memo, key) {
    return pred(key) ? assoc$8(memo, key, f(get(memo, key))) : memo;
  }, init, keys$b(init));
}
const mapVals = overload(null, null, mapVals2, mapVals3);
function defaults2(self, defaults) {
  return reducekv$a(assoc$8, defaults, self);
}
const defaults = overload(null, null, defaults2, reducing(defaults2));
function compile(self) {
  return isFunction(self) ? self : function (...args) {
    return apply(invoke$3, self, args);
  };
}

const keys$2 = Object.keys;
const vals = Object.values;
function fill$1(self, params) {
  return reducekv$a(function (memo, key, value) {
    var _value, _params, _p$fill, _p, _params2, _fill;
    return assoc$8(memo, key, (_value = value, branch(isString, (_p = p$1, _p$fill = _p.fill, _params = params, function fill(_argPlaceholder) {
      return _p$fill.call(_p, _argPlaceholder, _params);
    }), isObject, (_fill = fill$1, _params2 = params, function fill(_argPlaceholder2) {
      return _fill(_argPlaceholder2, _params2);
    }), identity)(_value)));
  }, {}, self);
}
function merge$2(...maps) {
  return reduce$f(function (memo, map) {
    return reduce$f(function (memo, [key, value]) {
      memo[key] = value;
      return memo;
    }, memo, seq$b(map));
  }, {}, maps);
}
function blank$1(self) {
  return keys$2(self).length === 0;
}
function compact1(self) {
  return compact2(self, function ([_, value]) {
    return value == null;
  });
}
function compact2(self, pred) {
  return reducekv$a(function (memo, key, value) {
    return pred([key, value]) ? memo : assoc$8(memo, key, value);
  }, {}, self);
}
const compact = overload(null, compact1, compact2);
function omit(self, entry) {
  const key = key$3(entry);
  if (includes$4(self, entry)) {
    const result = clone$1(self);
    delete result[key];
    return result;
  } else {
    return self;
  }
}
function compare$2(self, other) {
  //assume like keys, otherwise use your own comparator!
  return equiv$b(self, other) ? 0 : descriptive$1(other) ? reduce$f(function (memo, key) {
    return memo == 0 ? compare$6(get(self, key), get(other, key)) : reduced$1(memo);
  }, 0, keys$b(self)) : -1;
}
function conj$2(self, entry) {
  const key = key$3(entry),
    val = val$2(entry);
  const result = clone$5(self);
  result[key] = val;
  return result;
}
function equiv$5(self, other) {
  return self === other ? true : descriptive$1(other) && count$c(keys$b(self)) === count$c(keys$b(other)) && reduce$f(function (memo, key) {
    return memo ? equiv$b(get(self, key), get(other, key)) : reduced$1(memo);
  }, true, keys$b(self));
}
function find(self, key) {
  return contains(self, key) ? [key, lookup$1(self, key)] : null;
}
function includes$4(self, entry) {
  const key = key$3(entry),
    val = val$2(entry);
  return self[key] === val;
}
function lookup$1(self, key) {
  return self[key];
}
function first$3(self) {
  const key = first$e(keys$2(self));
  return key ? [key, lookup$1(self, key)] : null;
}
function rest$3(self) {
  return next$3(self) || {};
}
function next2(self, keys) {
  if (seq$b(keys)) {
    return lazySeq(function () {
      const key = first$e(keys);
      return cons([key, lookup$1(self, key)], next2(self, next$b(keys)));
    });
  } else {
    return null;
  }
}
function next$3(self) {
  return next2(self, next$b(keys$2(self)));
}
function dissoc(self, key) {
  if (contains$8(self, key)) {
    const result = clone$1(self);
    delete result[key];
    return result;
  } else {
    return self;
  }
}
function assoc(self, key, value) {
  if (get(self, key) === value) {
    return self;
  } else {
    const result = clone$1(self);
    result[key] = value;
    return result;
  }
}
function contains(self, key) {
  return self.hasOwnProperty(key);
}
function seq$3(self) {
  if (!count$2(self)) return null;
  return map(function (key) {
    return [key, lookup$1(self, key)];
  }, keys$2(self));
}
function count$2(self) {
  return keys$2(self).length;
}
function clone$1(self) {
  return Object.assign({}, self);
}
function reduce$3(self, f, init) {
  return reduce$f(function (memo, key) {
    return f(memo, [key, lookup$1(self, key)]);
  }, init, keys$2(self));
}
function reducekv$1(self, f, init) {
  return reduce$f(function (memo, key) {
    return f(memo, key, lookup$1(self, key));
  }, init, keys$2(self));
}
var behave$f = does(keying("Object"), implement(IHashable, {
  hash: hashKeyed
}), implement(ITemplate, {
  fill: fill$1
}), implement(IBlankable, {
  blank: blank$1
}), implement(IMergable, {
  merge: merge$2
}), implement(ICompactible, {
  compact
}), implement(IEquiv, {
  equiv: equiv$5
}), implement(IFind, {
  find
}), implement(IOmissible, {
  omit
}), implement(IInclusive, {
  includes: includes$4
}), implement(ICollection, {
  conj: conj$2
}), implement(ICloneable, {
  clone: clone$1
}), implement(IComparable, {
  compare: compare$2
}), implement(IReducible, {
  reduce: reduce$3
}), implement(IKVReducible, {
  reducekv: reducekv$1
}), implement(IMap, {
  dissoc,
  keys: keys$2,
  vals
}), implement(IFn, {
  invoke: lookup$1
}), implement(ISeq, {
  first: first$3,
  rest: rest$3
}), implement(INext, {
  next: next$3
}), implement(ILookup, {
  lookup: lookup$1
}), implement(IEmptyableCollection, {
  empty: emptyObject
}), implement(IAssociative, {
  assoc,
  contains
}), implement(ISeqable, {
  seq: seq$3
}), implement(ICounted, {
  count: count$2
}));

Object.assign(behaviors, {
  Object: behave$f
});
behave$f(Object);

function Okay(value) {
  this.value = value;
}
Okay.prototype[Symbol.toStringTag] = "Okay";
const okay = thrush(constructs(Okay));

function fmap$3(self, f) {
  try {
    return okay(f(self.value));
  } catch (ex) {
    return left(ex);
  }
}
function flatMap$1(self, f) {
  try {
    return f(self.value);
  } catch (ex) {
    return left(ex);
  }
}
function fork$3(self, reject, resolve) {
  resolve(self);
}
function deref$2(self) {
  return self.value;
}
var behave$e = does(keying("Okay"), implement(IDeref, {
  deref: deref$2
}), implement(IForkable, {
  fork: fork$3
}), implement(IFlatMappable, {
  flatMap: flatMap$1
}), implement(IFunctor, {
  fmap: fmap$3
}));

behave$e(Okay);

var p = /*#__PURE__*/Object.freeze({
  __proto__: null,
  start: start$1,
  end: end$1,
  inside: inside,
  between: between,
  overlap: overlap,
  directed: directed,
  steps: steps,
  subtract: subtract,
  add: add$3,
  inc: inc,
  dec: dec,
  divide: divide$1,
  coerce: coerce$1,
  compare: compare$6,
  lt: lt,
  lte: lte,
  gt: gt,
  gte: gte,
  kin: kin,
  equiv: equiv$b,
  alike: alike,
  equivalent: equivalent,
  eq: eq,
  notEq: notEq
});

function Period(start, end) {
  this.start = start;
  this.end = end;
}
function emptyPeriod() {
  return new Period();
}
function period1(obj) {
  return period2(patch(obj, sod()), patch(obj, eod()));
}
function period2(start, end) {
  //end could be a duration (e.g. `minutes(30)`).
  const pd = new Period(start, end == null || isDate(end) ? end : add$3(start, end));
  if (!(pd.start == null || isDate(pd.start))) {
    throw new Error("Invalid start of period.");
  }
  if (!(pd.end == null || isDate(pd.end))) {
    throw new Error("Invalid end of period.");
  }
  if (pd.start != null && pd.end != null && pd.start > pd.end) {
    throw new Error("Period bounds must be chronological.");
  }
  return pd;
}
const period = overload(emptyPeriod, period1, period2);
Period.prototype[Symbol.toStringTag] = "Period";

function Recurrence(start, end, step, direction) {
  this.start = start;
  this.end = end;
  this.step = step;
  this.direction = direction;
}
function emptyRecurrence() {
  return new Recurrence();
}
function recurrence1(obj) {
  return recurrence2(patch(obj, sod()), patch(obj, eod()));
}
function recurrence2(start, end) {
  return recurrence3(start, end, days(end == null || start <= end ? 1 : -1));
}
const recurrence3 = steps(Recurrence, isDate);
function recurrence4(start, end, step, f) {
  const pred = end == null ? constantly(true) : directed(start, end) > 0 ? function (dt) {
    return compare$6(start, dt) <= 0;
  } : directed(start, end) < 0 ? function (dt) {
    return compare$6(start, dt) >= 0;
  } : constantly(true);
  return filter(pred, f(recurrence3(start, end, step)));
}
const recurrence = overload(emptyRecurrence, recurrence1, recurrence2, recurrence3, recurrence4);
Recurrence.prototype[Symbol.toStringTag] = "Recurrence";

function split2(self, step) {
  var _step, _period;
  return map((_period = period, _step = step, function period(_argPlaceholder) {
    return _period(_argPlaceholder, _step);
  }), recurrence(start$1(self), end$1(self), step));
}
function split3$1(self, step, n) {
  return take(n, split2(self, step));
}
const split$1 = overload(null, null, split2, split3$1);
function add(self, dur) {
  var _ref, _self, _dur, _p$add, _p;
  return end$1(self) ? new self.constructor(start$1(self), (_ref = (_self = self, end$1(_self)), (_p = p, _p$add = _p.add, _dur = dur, function add(_argPlaceholder2) {
    return _p$add.call(_p, _argPlaceholder2, _dur);
  })(_ref))) : self;
}
function merge$1(self, other) {
  return other == null ? self : new self.constructor(min(start$1(self), start$1(other)), max(end$1(other), end$1(other)));
}
function divide(self, step) {
  return divide$1(coerce$1(self, Duration), step);
}
function start(self) {
  return self.start;
}
function end(self) {
  return self.end;
}
function includes$3(self, dt) {
  return dt != null && (self.start == null || compare$6(dt, self.start) >= 0) && (self.end == null || compare$6(dt, self.end) < 0);
}
function equiv$4(self, other) {
  return other != null && equiv$b(self.start, other.start) && equiv$b(self.end, other.end);
}
function compare$1(self, other) {
  //TODO test with sort of periods
  return compare$6(other.start, self.start) || compare$6(other.end, self.end);
}
var behave$d = does(emptyable, keying("Period"), implement(ISplittable, {
  split: split$1
}), implement(IAddable, {
  add
}), implement(IMergable, {
  merge: merge$1
}), implement(IDivisible, {
  divide
}), implement(IComparable, {
  compare: compare$1
}), implement(IInclusive, {
  includes: includes$3
}), implement(IBounded, {
  start,
  end
}), implement(IEquiv, {
  equiv: equiv$4
}));

behave$d(Period);

function promise(handler) {
  return new Promise(handler);
}
function isPromise(self) {
  return is(self, Promise);
}

var _Promise, _coerce;
const toPromise = (_coerce = coerce$1, _Promise = Promise, function coerce(_argPlaceholder) {
  return _coerce(_argPlaceholder, _Promise);
});
function awaits(f) {
  return function (...args) {
    if (detect(isPromise, args)) {
      return fmap$b(Promise.all(args), function (args) {
        return f.apply(this, args);
      });
    } else {
      return f.apply(this, args);
    }
  };
}

function fmap$2(self, resolve) {
  return self.then(resolve);
}
function fork$2(self, reject, resolve) {
  self.then(resolve, reject);
}
function otherwise$1(self, other) {
  return fmap$2(self, function (value) {
    return value == null ? other : value;
  });
}
function equiv$3(self, other) {
  return self === other; //regardless of its result, every promise is distinct
}

var behave$c = does(keying("Promise"), implement(IEquiv, {
  equiv: equiv$3
}), implement(IOtherwise, {
  otherwise: otherwise$1
}), implement(IForkable, {
  fork: fork$2
}), implement(IFunctor, {
  fmap: fmap$2
}));

Object.assign(behaviors, {
  Promise: behave$c
});
behave$c(Promise);

function seq$2(self) {
  return equiv$b(self.start, self.end) || self.step == null && self.direction == null && self.start == null && self.end == null ? null : self;
}
function first$2(self) {
  return self.end == null ? self.start : compare$6(self.start, self.end) * self.direction < 0 ? self.start : null;
}
function rest$2(self) {
  return next$b(self) || new self.constructor(self.end, self.end, self.step, self.direction);
}
function next$2(self) {
  if (!seq$2(self)) return null;
  const stepped = add$3(self.start, self.step);
  return self.end == null || compare$6(stepped, self.end) * self.direction < 0 ? new self.constructor(stepped, self.end, self.step, self.direction) : null;
}
function equiv$2(self, other) {
  return kin(self, other) ? alike(self, other) : equiv$a(self, other);
}
function reduce$2(self, f, init) {
  let memo = init,
    coll = seq$2(self);
  while (!isReduced(memo) && coll) {
    memo = f(memo, first$e(coll));
    coll = next$b(coll);
  }
  return unreduced(memo);
}
function reducekv(self, f, init) {
  let memo = init,
    coll = seq$2(self),
    n = 0;
  while (!isReduced(memo) && coll) {
    memo = f(memo, n++, first$e(coll));
    coll = next$b(coll);
  }
  return unreduced(memo);
}
function inverse(self) {
  const start = self.end,
    end = self.start,
    step = inverse$1(self.step);
  return new self.constructor(start, end, step, directed(start, step));
}
function nth(self, idx) {
  return first$e(drop(idx, self));
}
function count$1(self) {
  let n = 0,
    xs = self;
  while (seq$b(xs)) {
    n++;
    xs = rest$e(xs);
  }
  return n;
}
function includes$2(self, value) {
  let xs = self;
  if (self.direction > 0) {
    while (seq$b(xs)) {
      let c = compare$6(first$e(xs), value);
      if (c === 0) return true;
      if (c > 0) break;
      xs = rest$e(xs);
    }
  } else {
    while (seq$b(xs)) {
      let c = compare$6(first$e(xs), value);
      if (c === 0) return true;
      if (c < 0) break;
      xs = rest$e(xs);
    }
  }
  return false;
}
var behave$b = does(iterable, emptyable, keying("Range"), implement(ISequential$1), implement(IInversive, {
  inverse
}), implement(IIndexed, {
  nth
}), implement(ICounted, {
  count: count$1
}), implement(IInclusive, {
  includes: includes$2
}), implement(ISeqable, {
  seq: seq$2
}), implement(IReducible, {
  reduce: reduce$2
}), implement(IKVReducible, {
  reducekv
}), implement(INext, {
  next: next$2
}), implement(ISeq, {
  first: first$2,
  rest: rest$2
}), implement(IEquiv, {
  equiv: equiv$2
}));

behave$b(Range);

const record = behave$B;

behave$b(Recurrence);

function isRegExp(self) {
  return is(self, RegExp);
}

const test = unbind(RegExp.prototype.test);
function reFind(re, s) {
  if (!isString(s)) {
    throw new TypeError("reFind must match against string.");
  }
  const matches = re.exec(s);
  if (matches) {
    return count$c(matches) === 1 ? first$e(matches) : matches;
  }
}
function reFindAll2(text, find) {
  const found = find(text);
  return found ? lazySeq(function () {
    return cons(found, reFindAll2(text, find));
  }) : emptyList();
}
function reFindAll(re, text) {
  var _re, _reFind;
  return reFindAll2(text, (_reFind = reFind, _re = re, function reFind(_argPlaceholder) {
    return _reFind(_re, _argPlaceholder);
  }));
}
function reMatches(re, s) {
  if (!isString(s)) {
    throw new TypeError("reMatches must match against string.");
  }
  const matches = re.exec(s);
  if (first$e(matches) === s) {
    return count$c(matches) === 1 ? first$e(matches) : matches;
  }
}
function reSeq(re, s) {
  return lazySeq(function () {
    const matchData = reFind(re, s),
      matchIdx = s.search(re),
      matchStr = isArray(matchData) ? first$e(matchData) : matchData,
      postIdx = matchIdx + max(1, count$c(matchStr)),
      postMatch = s.substring(postIdx);
    return matchData ? cons(matchData, reSeq(new RegExp(re.source, re.flags), postMatch)) : emptyList();
  });
}
function rePattern(s) {
  if (isRegExp(s)) return s;
  if (!isString(s)) throw new TypeError("rePattern is derived from a string.");
  const found = reFind(/^\(\?([idmsux]*)\)/, s),
    prefix = get(found, 0),
    flags = get(found, 1),
    pattern = s.substring(count$c(prefix));
  return new RegExp(pattern, flags || "");
}

//Extracts group matches only: _.right("foo(12)/bar(22)", _.reGroups(/foo\((\d+)\)\/bar\((\d+)\)/,_))
const reGroups = comp(blot, toArray, rest$e, reFind);

var behave$a = keying("RegExp");

behave$a(RegExp);

function Right(value) {
  this.value = value;
}
Right.prototype[Symbol.toStringTag] = "Right";
const right = thrush(constructs(Right));

function flat(self) {
  return self.value instanceof Right || self.value instanceof Left ? self.value : self;
}
function otherwise(self, other) {
  return self.value;
}
function fork$1(self, reject, resolve) {
  resolve(self.value);
}
var behave$9 = does(keying("Right"), monadic(right, flat), implement(IForkable, {
  fork: fork$1
}), implement(IOtherwise, {
  otherwise
}));

behave$9(Right);

function Router(handlers, fallback, f) {
  this.handlers = handlers;
  this.fallback = fallback;
  this.f = f;
}
Router.prototype[Symbol.toStringTag] = "Router";
function router(handler) {
  const h = handler || noop$1;
  return new Router([], h, h);
}

function addRoute3(self, pred, f) {
  return addRoute2(self, guard(pred, f));
}
function addRoute2(self, handler) {
  const handlers = append$1(self.handlers, handler);
  return new Router(handlers, self.fallback, apply(coalesce, concat(handlers, [self.fallback])));
}
function addRoute4(self, re, xf, f) {
  var _re, _reGroups;
  return addRoute2(self, parsedo((_reGroups = reGroups, _re = re, function reGroups(_argPlaceholder) {
    return _reGroups(_re, _argPlaceholder);
  }), xf, f));
}
const addRoute = overload(null, null, addRoute2, addRoute3, addRoute4);

function invoke(self, ...args) {
  return self.f(...args);
}
var behave$8 = does(keying("Router"), implement(IFn, {
  invoke
}));

behave$8(Router);

const series = behave$k;

function set(xs) {
  return new Set(xs);
}
function emptySet() {
  return set([]);
}

function seq$1(self) {
  return count(self) ? self : null;
}
function empty(self) {
  return emptySet();
}
function disj(self, value) {
  const s = clone(self);
  s.delete(value);
  return s;
}
function includes$1(self, value) {
  return self.has(value);
}
function conj$1(self, value) {
  const s = clone(self);
  s.add(value);
  return s;
}
function first$1(self) {
  return self.values().next().value;
}
function rest$1(self) {
  const iter = self.values();
  iter.next();
  return _.lazyIterable(iter);
}
function next$1(self) {
  const iter = self.values();
  iter.next();
  return _.lazyIterable(iter, null);
}
function count(self) {
  return self.size;
}
function clone(self) {
  return new self.constructor(Array.from(self));
}
function reduce$1(self, f, init) {
  let memo = init;
  let coll = seq$1(self);
  while (coll) {
    memo = f(memo, ISeq.first(coll));
    coll = INext.next(coll);
  }
  return _.unreduced(memo);
}
function merge(self, other) {
  return set([...self, ...other]);
}
function equiv$1(self, other) {
  return count(self) === count(other) && reduce$1(self, function (memo, value) {
    return memo && includes$1(other, value) ? true : reduced$1(false);
  }, true);
}
var behave$7 = does(keying("Set"), implement(ISequential$1), implement(IEquiv, {
  equiv: equiv$1
}), implement(IMergable, {
  merge
}), implement(IHashable, {
  hash: hashSeq
}), implement(IReducible, {
  reduce: reduce$1
}), implement(ISeqable, {
  seq: seq$1
}), implement(IInclusive, {
  includes: includes$1
}), implement(ICloneable, {
  clone
}), implement(ICounted, {
  count
}), implement(INext, {
  next: next$1
}), implement(ISeq, {
  first: first$1,
  rest: rest$1
}), implement(IEmptyableCollection, {
  empty
}), implement(ICollection, {
  conj: conj$1
}), implement(ISet, {
  disj
}));

Object.assign(behaviors, {
  Set: behave$7
});
behave$7(Set);

var behave$6 = keying("Symbol");

Object.assign(behaviors, {
  Symbol: behave$6
});
behave$6(Symbol);

function split1(str) {
  return str.split("");
}
function split3(str, pattern, n) {
  const parts = [];
  while (str && n !== 0) {
    let found = str.match(pattern);
    if (!found || n < 2) {
      parts.push(str);
      break;
    }
    let pos = str.indexOf(found),
      part = str.substring(0, pos);
    parts.push(part);
    str = str.substring(pos + found.length);
    n = n ? n - 1 : n;
  }
  return parts;
}
const split = overload(null, split1, unbind(String.prototype.split), split3);
function fill(self, params) {
  return reducekv$a(function (text, key, value) {
    return replace(text, new RegExp("\\{" + key + "\\}", 'ig'), value);
  }, self, params);
}
function blank(self) {
  return self.trim().length === 0;
}
function compare(self, other) {
  return self === other ? 0 : self > other ? 1 : -1;
}
function conj(self, other) {
  return self + other;
}
function seq2(self, idx) {
  return idx < self.length ? lazySeq(function () {
    return cons(self[idx], seq2(self, idx + 1));
  }) : null;
}
function seq(self) {
  return seq2(self, 0);
}
function lookup(self, key) {
  return self[key];
}
function first(self) {
  return self[0] || null;
}
function rest(self) {
  return next(self) || "";
}
function next(self) {
  return self.substring(1) || null;
}
function prepend(self, head) {
  return head + self;
}
function includes(self, str) {
  return self.includes(str);
}
function reduce(self, f, init) {
  let memo = init;
  let coll = seq$b(self);
  while (coll && !isReduced(memo)) {
    memo = f(memo, first$e(coll));
    coll = next$b(coll);
  }
  return unreduced(memo);
}
function hash$1(self) {
  var hash = 0,
    i,
    chr;
  if (self.length === 0) return hash;
  for (i = 0; i < self.length; i++) {
    chr = self.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}
var behave$5 = does(iindexed, keying("String"), implement(IHashable, {
  hash: hash$1
}), implement(ISplittable, {
  split
}), implement(IBlankable, {
  blank
}), implement(ITemplate, {
  fill
}), implement(ICollection, {
  conj
}), implement(IReducible, {
  reduce
}), implement(IComparable, {
  compare
}), implement(IInclusive, {
  includes
}), implement(IAppendable, {
  append: conj
}), implement(IPrependable, {
  prepend
}), implement(IEmptyableCollection, {
  empty: emptyString
}), implement(IFn, {
  invoke: lookup
}), implement(IIndexed, {
  nth: lookup
}), implement(ILookup, {
  lookup
}), implement(ISeqable, {
  seq
}), implement(ISeq, {
  first,
  rest
}), implement(INext, {
  next
}));

Object.assign(behaviors, {
  String: behave$5
});
behave$5(String);

function Task(fork) {
  this.fork = fork;
}
Task.prototype[Symbol.toStringTag] = "Task";
function task(fork) {
  return new Task(fork);
}
function resolve(value) {
  return task(function (reject, resolve) {
    resolve(value);
  });
}
function reject(value) {
  return task(function (reject, resolve) {
    reject(value);
  });
}
Task.of = resolve;
Task.resolve = resolve;
Task.reject = reject;

function fmap$1(self, f) {
  return task(function (reject, resolve) {
    self.fork(reject, comp(resolve, f));
  });
}
function flatMap(self, f) {
  return task(function (reject, resolve) {
    self.fork(reject, function (value) {
      fork$5(f(value), reject, resolve);
    });
  });
}
function fork(self, reject, resolve) {
  self.fork(reject, resolve);
}
var behave$4 = does(keying("Task"), implement(IFlatMappable, {
  flatMap
}), implement(IForkable, {
  fork
}), implement(IFunctor, {
  fmap: fmap$1
}));

behave$4(Task);

function pluck(coll) {
  return nth$6(coll, randInt(count$c(coll)));
}
function uident(len) {
  return join("", repeatedly(len, partial(pluck, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")));
}
function UID(id, context) {
  this.id = id;
  this.context = context; //optionally, the qualifying context in which the id is unique
}

UID.prototype[Symbol.toStringTag] = "UID";
UID.prototype.toString = function () {
  return this.id;
};
function uid0() {
  return uid(uident(5));
}
function uid2(id, context = null) {
  return new UID(id, context);
}
const uid = overload(uid0, uid2, uid2);

function equiv(self, other) {
  return equiv$b(self.id, other.id) && equiv$b(self.context, other.context);
}
function hash(self) {
  return hash$7(self.id + "/" + (self.context || ""));
}
var behave$3 = does(implement(IEquiv, {
  equiv
}), implement(IHashable, {
  hash
}), keying("UID"));

behave$3(UID);

var _param$1, _verified;
function Verified(value, pred) {
  this.value = value;
  this.pred = pred;
}
Verified.prototype[Symbol.toStringTag] = "Verified";
function verified(value, pred) {
  if (!pred(value)) {
    throw new Error("Initial state could not be verified.");
  }
  return new Verified(value, pred);
}
const fluent = thrush((_verified = verified, _param$1 = function (value) {
  return value !== undefined;
}, function verified(_argPlaceholder) {
  return _verified(_argPlaceholder, _param$1);
}));

function fmap(self, f) {
  const value = f(self.value);
  return new Verified(self.pred(value) ? value : self.value, self.pred);
}
function deref$1(self) {
  return self.value;
}
var behave$2 = does(keying("Verified"), implement(IDeref, {
  deref: deref$1
}), implement(IFunctor, {
  fmap
}));

behave$2(Verified);

function Volatile(state) {
  this.state = state;
}
function volatile(state) {
  return new Volatile(state);
}
Volatile.prototype[Symbol.toStringTag] = "Volatile";

function vreset(self, state) {
  return self.state = state;
}
function vswap(self, f) {
  return self.state = f(self.state);
}

function deref(self) {
  return self.state;
}
var behave$1 = does(keying("Volatile"), implement(IDeref, {
  deref
}));

behave$1(Volatile);

function keys$1(self) {
  return self.keys();
}
var iprotocol = does(implement(IMap, {
  keys: keys$1
}));

var _behaviors, _behaves, _param, _test, _days, _recurs, _str, _mapkv, _str2, _join, _collapse, _ISeq, _satisfies;
const config = _config;
iprotocol(Protocol);
const behave = (_behaves = behaves, _behaviors = behaviors, function behaves(_argPlaceholder) {
  return _behaves(_behaviors, _argPlaceholder);
});
function called4(fn, message, context, logger) {
  return function () {
    const meta = Object.assign({}, context, {
      fn,
      arguments
    });
    log(logger, message, meta);
    return meta.results = fn.apply(this, arguments);
  };
}
function called3(fn, message, context) {
  return called4(fn, message, context, config.logger);
}
function called2(fn, message) {
  return called3(fn, message, {});
}
const called = overload(null, null, called2, called3, called4);
function fillProp(obj, key, value) {
  if (!obj.hasOwnProperty(key)) {
    Object.defineProperty(obj, key, {
      value,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }
}
function equals(other) {
  return equiv$b(this, other);
}
fillProp(Object.prototype, "equals", equals);
const numeric = (_test = test, _param = /^\d+$/i, function test(_argPlaceholder2) {
  return _test(_param, _argPlaceholder2);
});
(function () {
  function log(self, ...args) {
    self.log(...args);
  }
  doto(console, specify(ILogger, {
    log
  }));
  doto(Nil, implement(ILogger, {
    log: noop$1
  }));
})();
function severityLogger(logger, severity) {
  const f = logger[severity].bind(logger);
  function log(self, ...args) {
    f(...args);
  }
  return doto({
    logger,
    severity
  }, specify(ILogger, {
    log
  }));
}
function metaLogger(logger, ...meta) {
  function log$1(self, ...args) {
    log(logger, ...[...mapa(execute, meta), ...args]);
  }
  return doto({
    logger,
    meta
  }, specify(ILogger, {
    log: log$1
  }));
}
function labelLogger(logger, ...labels) {
  function log$1(self, ...args) {
    log(logger, ...[...labels, ...args]);
  }
  return doto({
    logger,
    labels
  }, specify(ILogger, {
    log: log$1
  }));
}
function peek(logger) {
  var _logger, _p$log, _p;
  return tee((_p = p$3, _p$log = _p.log, _logger = logger, function log(_argPlaceholder3) {
    return _p$log.call(_p, _logger, _argPlaceholder3);
  }));
}
function siblings(self) {
  const parent = parent$1(self);
  if (parent) {
    return filter(function (sibling) {
      return sibling !== self;
    }, children$1(parent));
  } else {
    return emptyList();
  }
}
function prevSiblings(self) {
  return reverse(takeWhile(function (sibling) {
    return sibling !== self;
  }, siblings(self)));
}
function nextSiblings(self) {
  return rest$e(dropWhile(function (sibling) {
    return sibling !== self;
  }, siblings(self)));
}
const prevSibling = comp(first$e, prevSiblings$2);
const nextSibling = comp(first$e, nextSiblings$2);
const parents = upward(parent$1);
const root = comp(last, parents);
function closest(self, pred) {
  return detect(pred, cons(self, parents$2(self)));
}
extend(IHierarchy, {
  siblings,
  prevSibling,
  nextSibling,
  prevSiblings,
  nextSiblings,
  parents,
  closest,
  root
});
function recurs2(pd, step) {
  return recurrence(start$1(pd), end$1(pd), step);
}
const recurs = overload(null, (_recurs = recurs2, _days = days(1), function recurs2(_argPlaceholder4) {
  return _recurs(_argPlaceholder4, _days);
}), recurs2);
function inclusive(self) {
  return new self.constructor(self.start, add$3(self.end, self.step), self.step, self.direction);
}
function cleanlyN(f, ...args) {
  try {
    return f(...args);
  } catch {
    return null;
  }
}
const cleanly = overload(null, curry(cleanlyN, 2), cleanlyN);
function mod3(obj, key, f) {
  if (key in obj) {
    obj[key] = f(obj[key]); //must be a mutable copy
  }

  return obj;
}
function modN(obj, key, value, ...args) {
  return args.length > 0 ? modN(mod3(obj, key, value), ...args) : mod3(obj, key, value);
}

//Has the api of `assoc` and behaves like `update` persistently updating object attributes.  Depends on `clone` but not `lookup` or `assoc`.
function edit(obj, ...args) {
  const copy = clone$5(obj);
  args.unshift(copy);
  return modN.apply(copy, args);
}
function deconstruct(dur, ...units) {
  let memo = dur;
  return mapa(function (unit) {
    const n = fmap$b(divide$1(memo, unit), Math.floor);
    memo = subtract(memo, fmap$b(unit, constantly(n)));
    return n;
  }, units);
}
const toQueryString = opt((_mapkv = mapkv, _str = (_str2 = str, function str(_argPlaceholder6, _argPlaceholder7) {
  return _str2(_argPlaceholder6, "=", _argPlaceholder7);
}), function mapkv(_argPlaceholder5) {
  return _mapkv(_str, _argPlaceholder5);
}), (_join = join, function join(_argPlaceholder8) {
  return _join("&", _argPlaceholder8);
}), (_collapse = collapse, function collapse(_argPlaceholder9) {
  return _collapse("?", _argPlaceholder9);
}));
function fromQueryString(url) {
  const params = {};
  each(function (match) {
    const key = decodeURIComponent(match[1]),
      val = decodeURIComponent(match[2]);
    params[key] = val;
  }, reFindAll(/[?&]([^=&]*)=([^=&]*)/g, url));
  return params;
}
function distinct0() {
  //transducer
  return function (rf) {
    const seen = new Set();
    return overload(rf, rf, function (memo, value) {
      if (seen.has(value)) {
        return memo;
      }
      seen.add(value);
      return rf(memo, value);
    });
  };
}
function distinct1(xs) {
  return coerce$1(new Set(coerce$1(xs, Array)), Array);
}
const distinct = overload(distinct0, distinct1);
const unique = distinct;
const second = branch((_satisfies = satisfies, _ISeq = ISeq, function satisfies(_argPlaceholder10) {
  return _satisfies(_ISeq, _argPlaceholder10);
}), comp(ISeq.first, ISeq.rest), prop("second"));
function expands(f) {
  function expand(...contents) {
    return detect(isFunction, contents) ? postpone(...contents) : f(...contents);
  }
  function postpone(...contents) {
    return function (value) {
      const expanded = map(function (content) {
        return isFunction(content) ? content(value) : content;
      }, contents);
      return apply(expand, expanded);
    };
  }
  return expand;
}
function filled2(f, g) {
  return function (...args) {
    return seq$b(filter(isNil, args)) ? g(...args) : f(...args);
  };
}
function filled1(f) {
  return filled2(f, noop$1);
}
const filled = overload(null, filled1, filled2);
function elapsed(self) {
  return duration(end$1(self) - start$1(self));
}
function collapse(...args) {
  return some$1(isBlank, args) ? "" : join("", args);
}
function impartable(f) {
  return isFunction(f) && !/^[A-Z]./.test(name(f));
}
function impart2(source, f) {
  //overriding `f` with `identity` nullifies its effects
  return decorating3(source, impartable, f); //impart to functions which are not also constructors
}

function impart3(target, source, f) {
  return decorating4(target, source, impartable, f);
}
const impart = overload(null, null, impart2, impart3);

//convenience for wrapping batches of functions/modules.
function decorating2(source, f) {
  return decorating3(source, identity, f);
}
function decorating3(source, pred, f) {
  return decorating4({}, source, pred, f);
}
function decorating4(target, source, pred, f) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = pred(value, key) ? f(value) : value;
  }
  return target;
}
const decorating = overload(null, null, decorating2, decorating3, decorating4);
function include2(self, value) {
  var _value, _p$conj, _p2, _value2, _p$omit, _p3, _value3, _p$includes, _p4;
  return toggles((_p2 = p$3, _p$conj = _p2.conj, _value = value, function conj(_argPlaceholder11) {
    return _p$conj.call(_p2, _argPlaceholder11, _value);
  }), (_p3 = p$3, _p$omit = _p3.omit, _value2 = value, function omit(_argPlaceholder12) {
    return _p$omit.call(_p3, _argPlaceholder12, _value2);
  }), (_p4 = p$3, _p$includes = _p4.includes, _value3 = value, function includes(_argPlaceholder13) {
    return _p$includes.call(_p4, _argPlaceholder13, _value3);
  }), self);
}
function include3(self, value, want) {
  var _value4, _p$conj2, _p5, _value5, _p$omit2, _p6, _value6, _p$includes2, _p7;
  return toggles((_p5 = p$3, _p$conj2 = _p5.conj, _value4 = value, function conj(_argPlaceholder14) {
    return _p$conj2.call(_p5, _argPlaceholder14, _value4);
  }), (_p6 = p$3, _p$omit2 = _p6.omit, _value5 = value, function omit(_argPlaceholder15) {
    return _p$omit2.call(_p6, _argPlaceholder15, _value5);
  }), (_p7 = p$3, _p$includes2 = _p7.includes, _value6 = value, function includes(_argPlaceholder16) {
    return _p$includes2.call(_p7, _argPlaceholder16, _value6);
  }), self, want);
}
const include = overload(null, null, include2, include3);
function inventory(obj) {
  var _ref, _ref2, _obj, _join2, _str3;
  //can be used to expose all module exports
  return _ref = (_ref2 = (_obj = obj, Object.keys(_obj)), (_join2 = join, function join(_argPlaceholder17) {
    return _join2(",\n", _argPlaceholder17);
  })(_ref2)), (_str3 = str, function str(_argPlaceholder18) {
    return _str3("{\n", _argPlaceholder18, "\n}");
  })(_ref);
}
const fmt = expands(str);
function when(pred, ...xs) {
  return last(map(realize, pred ? xs : null));
}
function readable(keys) {
  const lookup = keys ? function (self, key) {
    if (!includes$a(keys, key)) {
      throw new Error("Cannot read from " + key);
    }
    return self[key];
  } : function (self, key) {
    return self[key];
  };
  return implement(ILookup, {
    lookup
  });
}
function writable(keys) {
  function clone(self) {
    return Object.assign(Object.create(self.constructor.prototype), self);
  }
  function contains(self, key) {
    return self.hasOwnProperty(key);
  }
  const assoc = keys ? function (self, key, value) {
    if (!includes$a(keys, key) || !contains(self, key)) {
      throw new Error("Cannot write to " + key);
    }
    const tgt = clone(self);
    tgt[key] = value;
    return tgt;
  } : function (self, key, value) {
    if (!contains(self, key)) {
      throw new Error("Cannot write to " + key);
    }
    const tgt = clone(self);
    tgt[key] = value;
    return tgt;
  };
  return does(implement(ICloneable, {
    clone
  }), implement(IAssociative, {
    assoc,
    contains
  }));
}
function scanKey1(better) {
  return partial(scanKey, better);
}
function scanKey3(better, k, x) {
  return x;
}
function scanKey4(better, k, x, y) {
  return better(k(x), k(y)) ? x : y;
}
function scanKeyN(better, k, x, ...args) {
  return apply(reduce$f, partial(scanKey3, better), x, args);
}
const scanKey = overload(null, scanKey1, null, scanKey3, scanKey4, scanKeyN);
const maxKey = scanKey(gt);
const minKey = scanKey(lt);
function absorb2(tgt, src) {
  return reducekv$a(function (memo, key, value) {
    const was = get(memo, key);
    let absorbed;
    if (was == null) {
      absorbed = value;
    } else if (descriptive(value)) {
      absorbed = into(empty$2(was), absorb(was, value));
    } else if (satisfies(ISequential, value)) {
      absorbed = into(empty$2(was), concat(was, value));
    } else {
      absorbed = value;
    }
    return assoc$8(memo, key, absorbed);
  }, tgt, src || empty$2(tgt));
}
const absorb = overload(constantly({}), identity, absorb2, reducing(absorb2));
function unfork(self) {
  return new Promise(function (resolve, reject) {
    fork$5(self, reject, resolve);
  });
}
function reduceToArray(self) {
  return reduce$f(function (memo, value) {
    memo.push(value);
    return memo;
  }, [], self);
}
ICoercible.addMethod([Set, Array], unary(Array.from));
ICoercible.addMethod([Array, Set], function (coll) {
  return new Set(coll);
});
ICoercible.addMethod([Number, String], unary(str));
ICoercible.addMethod([Number, Date], unary(date));
ICoercible.addMethod([Duration, Duration], identity);
ICoercible.addMethod([Period, Duration], function (self) {
  return self.end == null || self.start == null ? duration(Number.POSITIVE_INFINITY) : duration(self.end - self.start);
});
ICoercible.addMethod([Promise, Promise], identity);
ICoercible.addMethod([Right, Promise], unfork);
ICoercible.addMethod([Left, Promise], unfork);
ICoercible.addMethod([Error, Promise], unfork);
ICoercible.addMethod([Okay, Promise], unfork);
ICoercible.addMethod([Task, Promise], unfork);
ICoercible.addMethod([Object, Object], identity);
ICoercible.addMethod([Array, Object], function (self) {
  return reduce$f(function (memo, [key, value]) {
    memo[key] = value;
    return memo;
  }, {}, self);
});
ICoercible.addMethod([Array, Array], identity);
ICoercible.addMethod([Multimap, Array], comp(Array.from, seq$b));
ICoercible.addMethod([Concatenated, Array], reduceToArray);
ICoercible.addMethod([EmptyList, Array], emptyArray);
ICoercible.addMethod([List, Array], reduceToArray);
ICoercible.addMethod([Range, Array], reduceToArray);
ICoercible.addMethod([Nil, Array], emptyArray);
ICoercible.addMethod([IndexedSeq, Array], reduceToArray);
ICoercible.addMethod([RevSeq, Array], unary(Array.from));
ICoercible.addMethod([LazySeq, Array], function (xs) {
  let ys = xs;
  const zs = [];
  while (seq$b(ys) != null) {
    zs.push(first$e(ys));
    ys = rest$e(ys);
  }
  return zs;
});
ICoercible.addMethod([Multimap, Array], comp(Array.from, seq$b));
ICoercible.addMethod([Object, Array], reduceToArray);
ICoercible.addMethod([String, Array], function (self) {
  return self.split("");
});

export { Chance, Concatenated, Duration, EmptyList, GUID, IAddable, IAppendable, IAssociative, IBlankable, IBounded, ICloneable, ICoercible, ICollection, ICompactible, IComparable, ICounted, IDeref, IDisposable, IDivisible, IEmptyableCollection, IEquiv, IFind, IFlatMappable, IFn, IForkable, IFunctor, IHashable, IHierarchy, IIdentifiable, IInclusive, IIndexed, IInsertable, IInversive, IKVReducible, ILogger, ILookup, IMap, IMapEntry, IMergable, IMultipliable, INamable, INext, IOmissible, IOtherwise, IPath, IPrependable, IQueryable, IReducible, IResettable, IReversible, IRevertible, ISend, ISeq, ISeqable, ISequential$1 as ISequential, ISet, ISplittable, ISwappable, ITemplate, Indexed, IndexedSeq, Journal, Just, LazySeq, Left, Lens, List, Members, Multimap, Multimethod, Mutable, Nil, Nothing, Okay, Period, PostconditionError, PreconditionError, Protocol, Range, Recurrence, Reduced, RevSeq, Right, Router, Task, UID, Verified, Volatile, absorb, add$3 as add, addMethod, addRoute, after, ako, alike, all, also, ancestors, and, annually, any, append$1 as append, apply, applying, arity, array, asLeaves, asc, assoc$8 as assoc, assocIn, assume, attach, average, awaits, before, behave, behaves, behaviors, best, between, binary, blank$2 as blank, blot, bool, boolean, both, braid, branch, butlast, called, camelToDashed, cat, chain, chance, children$1 as children, clamp, cleanly, clockHour, clone$5 as clone, closest$2 as closest, coalesce, coerce$1 as coerce, collapse, comp, compact$1 as compact, compare$6 as compare, compile, complement, concat, concatenated, cond, config, conj$9 as conj, cons, constantly, construct, constructs, contains$8 as contains, count$c as count, countBy, crunch$1 as crunch, crunchable$1 as crunchable, curry, cycle, date, day, days, dec, deconstruct, decorating, dedupe, defaults, deferring, deref$b as deref, desc, descendants$1 as descendants, descriptive$1 as descriptive, detach, detect, detectIndex, difference, directed, disj$1 as disj, dispose, dissoc$5 as dissoc, distinct, divide$1 as divide, doall, does, doing, dorun, doseq, dotimes, doto, dow, downward, drop, dropLast, dropWhile, duration, each, eachIndexed, eachkv, eachvk, edit, either, elapsed, empty$2 as empty, emptyArray, emptyList, emptyObject, emptyPeriod, emptyRange, emptyRecurrence, emptySet, emptyString, end$1 as end, endsWith, entries, eod, eom, eoy, eq, equiv$b as equiv, equivalent, error, every, everyPair, everyPred, excludes, execute, expands, extend, factory, farg, fill$2 as fill, filled, filter, filtera, find$1 as find, first$e as first, flat$4 as flat, flatMap$3 as flatMap, flatten, flip, float, fluent, flush$1 as flush, flushable$1 as flushable, fmap$b as fmap, fmt, fnil, fold, folding, foldkv, fork$5 as fork, forward, fromQueryString, generate, get, getIn, groupBy, gt, gte, guard, guid, handle, hash$7 as hash, hashTag, hour, hours, identifier, identity, idx$3 as idx, impart, implement, inc, include, includes$a as includes, inclusive, index, indexOf, indexed, indexedSeq, initial, inside, int, integers, interleave, interleaved, interpose, intersection, into, inventory, inverse$1 as inverse, invokable, invoke$3 as invoke, invokes, is, isArray, isBlank, isBoolean, isDate, isDistinct, isEmpty, isError, isEven, isFalse, isFloat, isFunction, isIdentical, isInt, isInteger, isNaN, isNative, isNeg, isNil, isNumber, isObject, isOdd, isPos, isPromise, isReduced, isRegExp, isSome, isString, isSymbol, isTrue, isValueObject, isZero, iterable, iterate$1 as iterate, join, journal, juxt, juxtVals, keep, keepIndexed, key$3 as key, keyed, keying, keys$b as keys, kin, labelLogger, last, lastN, lazyIterable, lazySeq, least, leaves, left, lens, list, log, lowerCase, lpad, lt, lte, ltrim, map, mapArgs, mapIndexed, mapKeys, mapSome, mapVals, mapa, mapcat, mapkv, mapvk, max, maxKey, maybe, mdow, measure, members, memoize, merge$5 as merge, mergeWith, metaLogger, midnight, millisecond, milliseconds, min, minKey, minute, minutes, modulus, month, monthDays, months, most, mult$2 as mult, multi, multimap, multimethod, mutable, mutate, name, nary, negatives, next$b as next, nextSibling$2 as nextSibling, nextSiblings$2 as nextSiblings, nil, noon, noop$1 as noop, not, notAny, notEmpty, notEq, notEvery, notSome, nothing, nth$6 as nth, nullary, num, number, numeric, obj, object, okay, omit$3 as omit, once, only, opt, or, otherwise$4 as otherwise, overlap, overload, parent$1 as parent, parents$2 as parents, parsedo, partial, partition, partitionAll, partitionAll1, partitionAll2, partitionAll3, partitionBy, partly, patch, path$1 as path, peek, period, period1, pipe, pipeline, placeholder, pluck, plug, plugging, pm, positives, posn, post, pre, prepend$2 as prepend, prevSibling$2 as prevSibling, prevSiblings$2 as prevSiblings, promise, prop, protocol, quarter, quaternary, query, rand, randInt, randNth, range, rdow, reFind, reFindAll, reGroups, reMatches, rePattern, reSeq, readable, realize, realized, record, recurrence, recurrence1, recurs, redo$1 as redo, redoable$1 as redoable, reduce$f as reduce, reduced$1 as reduced, reducekv$a as reducekv, reducekv2, reducekv3, reducing, reifiable, remove, removeKeys, repeat, repeatedly, replace, reset$2 as reset, resettable$1 as resettable, rest$e as rest, revSeq, reverse$4 as reverse, revision$1 as revision, rewrite, right, root$2 as root, router, rpad, rtrim, satisfies, scan, scanKey, second, seconds, see, seek, selectKeys, send, seq$b as seq, sequential, series, set, severityLogger, shuffle, siblings$2 as siblings, sift, signature, signatureHead, slice, sod, som, some$1 as some, someFn, sort, sortBy, soy, specify, splice, split$2 as split, splitAt, splitWith, spread, start$1 as start, startsWith, steps, str, subj, subs, subset, subsumes, subtract, sum, superset, swap$1 as swap, take, takeLast, takeNth, takeWhile, task, tee, template, ternary, test, thin, thrush, tick, time, titleCase, toArray, toDuration, toObject, toPromise, toQueryString, toggles, transduce, transpose, treeSeq, trim, type, uid, uident, unary, unbind, unconj$1 as unconj, undo$1 as undo, undoable$1 as undoable, unfork, union, unique, unite, unreduced, unspecify, unspread, untick, update, updateIn, upperCase, upward, val$2 as val, vals$5 as vals, verified, volatile, vreset, vswap, weekday, weekend, weeks, when, withIndex, writable, year, years, zeros, zip };
