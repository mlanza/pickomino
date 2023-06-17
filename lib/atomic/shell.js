import * as _ from './core.js';
import { protocol } from './core.js';
import * as mut from './transients.js';
import * as $ from './reactives.js';

const IDispatch = _.protocol({
  dispatch: null
});

const dispatch$1 = IDispatch.dispatch;

const IEventProvider = _.protocol({
  raise: null,
  release: null
});

const raise = IEventProvider.raise;
const release = IEventProvider.release;

const IMiddleware = protocol({
  handle: null
});

function handle2(self, message) {
  return IMiddleware.handle(self, message, _.noop);
}
const handle$6 = _.overload(null, null, handle2, IMiddleware.handle);

var p = /*#__PURE__*/Object.freeze({
  __proto__: null,
  dispatch: dispatch$1,
  raise: raise,
  release: release,
  handle: handle$6
});

function Bus(middlewares) {
  this.middlewares = middlewares;
}
Bus.prototype[Symbol.toStringTag] = "Bus";
function bus(middlewares) {
  return new Bus(middlewares || []);
}

function conj(self, middleware) {
  self.middlewares = _.conj(self.middlewares, middleware);
}
function handle$5(self, message, next) {
  const f = _.reduce(function (memo, middleware) {
    var _middleware, _memo, _p$handle, _p;
    return _p = p, _p$handle = _p.handle, _middleware = middleware, _memo = memo, function handle(_argPlaceholder) {
      return _p$handle.call(_p, _middleware, _argPlaceholder, _memo);
    };
  }, next || _.noop, _.reverse(self.middlewares));
  f(message);
}
function dispatch(self, message) {
  handle$5(self, message);
}
var behave$7 = _.does(_.keying("Bus"), _.implement(mut.ITransientCollection, {
  conj
}), _.implement(IDispatch, {
  dispatch
}), _.implement(IMiddleware, {
  handle: handle$5
}));

behave$7(Bus);

function Command(type, attrs) {
  this.type = type;
  this.attrs = attrs;
}
Command.prototype[Symbol.toStringTag] = "Command";
function constructs(Type) {
  return function message(type) {
    return function (args, options) {
      return new Type(type, Object.assign({
        args: args || []
      }, options));
    };
  };
}
const command = constructs(Command);

function hash(self) {
  return _.hash({
    type: self.type,
    attrs: self.attrs
  });
}
function identifier(self) {
  return self.type;
}
var behave$6 = _.does(_.record, _.keying("Command"), _.implement(_.IHashable, {
  hash
}), _.implement(_.IIdentifiable, {
  identifier
}));

behave$6(Command);

function Event(type, attrs) {
  this.type = type;
  this.attrs = attrs;
}
Event.prototype[Symbol.toStringTag] = "Event";
const event = constructs(Event);
function effect(message, type) {
  const e = new Event();
  return Object.assign(e, message, {
    type: type
  });
}
function alter(message, type) {
  return Object.assign(_.clone(message), {
    type: type
  });
}

var behave$5 = _.does(behave$6, _.keying("Event"));

behave$5(Event);

function EventMiddleware(emitter) {
  this.emitter = emitter;
}
EventMiddleware.prototype[Symbol.toStringTag] = "EventMiddleware";
const eventMiddleware = _.constructs(EventMiddleware);

function handle$4(self, event, next) {
  $.pub(self.emitter, event);
  next(event);
}
var behave$4 = _.does(_.keying("EventMiddleware"), _.implement(IMiddleware, {
  handle: handle$4
}));

behave$4(EventMiddleware);

function DrainEventsMiddleware(provider, eventBus) {
  this.provider = provider;
  this.eventBus = eventBus;
}
DrainEventsMiddleware.prototype[Symbol.toStringTag] = "DrainEventsMiddleware";
const drainEventsMiddleware = _.constructs(DrainEventsMiddleware);

function handle$3(self, command, next) {
  next(command);
  _.each(function (message) {
    handle$6(self.eventBus, message, next);
  }, release(self.provider));
}
var behave$3 = _.does(_.keying("DrainEventsMiddleware"), _.implement(IMiddleware, {
  handle: handle$3
}));

behave$3(DrainEventsMiddleware);

function HandlerMiddleware(handlers, identify, fallback) {
  this.handlers = handlers;
  this.identify = identify;
  this.fallback = fallback;
}
HandlerMiddleware.prototype[Symbol.toStringTag] = "HandlerMiddleware";
const handlerMiddleware3 = _.constructs(HandlerMiddleware);
function handlerMiddleware2(handlers, identify) {
  return handlerMiddleware3(handlers, identify);
}
function handlerMiddleware1(handlers) {
  return handlerMiddleware2(handlers, _.identifier);
}
function handlerMiddleware0() {
  return handlerMiddleware1({});
}
const handlerMiddleware = _.overload(handlerMiddleware0, handlerMiddleware1, handlerMiddleware2, handlerMiddleware3);

function assoc(self, key, handler) {
  self.handlers = _.assoc(self.handlers, key, handler);
}
function handle$2(self, message, next) {
  const handler = _.get(self.handlers, self.identify(message), self.fallback);
  if (handler) {
    handle$6(handler, message, next);
  } else {
    next(message);
  }
}
var behave$2 = _.does(_.keying("HandlerMiddleware"), _.implement(mut.ITransientAssociative, {
  assoc
}), _.implement(IMiddleware, {
  handle: handle$2
}));

behave$2(HandlerMiddleware);

function LockingMiddleware(bus, queued, handling) {
  this.bus = bus;
  this.queued = queued;
  this.handling = handling;
}
LockingMiddleware.prototype[Symbol.toStringTag] = "LockingMiddleware";
function lockingMiddleware(bus) {
  return new LockingMiddleware(bus, [], false);
}

function handle$1(self, message, next) {
  if (self.handling) {
    self.queued.push(message);
  } else {
    self.handling = true;
    next(message);
    self.handling = false;
    if (self.queued.length) {
      var _self$bus, _p$dispatch, _p;
      const queued = self.queued;
      self.queued = [];
      _.log("draining queued", queued);
      _.each((_p = p, _p$dispatch = _p.dispatch, _self$bus = self.bus, function dispatch(_argPlaceholder) {
        return _p$dispatch.call(_p, _self$bus, _argPlaceholder);
      }), queued);
    }
  }
}
var behave$1 = _.does(_.keying("LockingMiddleware"), _.implement(IMiddleware, {
  handle: handle$1
}));

behave$1(LockingMiddleware);

function TeeMiddleware(effect) {
  this.effect = effect;
}
TeeMiddleware.prototype[Symbol.toStringTag] = "TeeMiddleware";
const teeMiddleware = _.constructs(TeeMiddleware);

function handle(self, message, next) {
  self.effect(message);
  next(message);
}
var behave = _.does(_.keying("TeeMiddleware"), _.implement(IMiddleware, {
  handle
}));

behave(TeeMiddleware);

function defs(construct, keys) {
  return _.reduce(function (memo, key) {
    return _.assoc(memo, key, construct(key));
  }, {}, keys);
}
function dispatchable(Cursor) {
  //from `atomic/reactives`

  function dispatch(self, command) {
    dispatch$1(self.source, _.update(command, "path", function (path) {
      return _.apply(_.conj, self.path, path || []);
    }));
  }
  _.doto(Cursor, _.implement(IDispatch, {
    dispatch
  }));
}
(function () {
  function dispatch(self, args) {
    return self.f(...args);
  }
  _.doto(_.Router, _.implement(IDispatch, {
    dispatch
  }));
})();
(function () {
  function dispatch(self, args) {
    return _.apply(self, args);
  }
  _.doto(Function, _.implement(IDispatch, {
    dispatch
  }));
})();

export { Bus, Command, DrainEventsMiddleware, Event, EventMiddleware, HandlerMiddleware, IDispatch, IEventProvider, IMiddleware, LockingMiddleware, TeeMiddleware, alter, bus, command, constructs, defs, dispatch$1 as dispatch, dispatchable, drainEventsMiddleware, effect, event, eventMiddleware, handle$6 as handle, handlerMiddleware, lockingMiddleware, raise, release, teeMiddleware };
