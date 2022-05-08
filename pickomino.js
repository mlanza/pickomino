import _ from "./lib/@atomic/core.js";

export function init(names){
  const up = 0;
  const status = "ready";
  const players = _.mapa(function(name){
    return {name, stack: []};
  }, names);
  const rolled = [];
  const banked = [];
  return {up, status, rolled, banked, players, tiles};
}

export const tiles = _.mapa(function(worms, value){
  return {worms, value};
}, _.concat(_.repeat(4, 1), _.repeat(4, 2), _.repeat(4, 3), _.repeat(4, 4)), _.iterate(_.inc, 21));

export function rollDice(n){
  return _.sort(_.repeatedly(n, _.partial(_.randInt, 6)));
}

export function bankable(banked, rolled){
  return _.chain(rolled, _.remove(_.includes(banked, _), _), _.unique, _.seq);
}

export const hasWorm = _.includes(_, 0);

export function fail(state){
  const {up, tiles} = state;
  const tile = _.chain(state, _.getIn(_, ["players", up, "stack"]), _.first);
  if (tile) {
    const ref = _.count(_.takeWhile(function(t){
      return tile.value < t.value;
    }, tiles));
    return _.chain(state,
      _.updateIn(_, ["players", up, "stack"], _.rest),
      _.update(_, "tiles", _.pipe(
        _.before(_, ref, tile),
        _.butlast)),
        finish);
  } else {
    return finish(state);
  }
}

export function roll(state){
  if (_.includes(["ready", "banked"], _.get(state, "status"))) {
    const {banked, rolled} = state;
    const dice = rollDice(_.count(banked) ? _.count(rolled) : 8);
    const status = _.count(rolled) === 0 || bankable(banked, dice) ? "success" : "failure";
    return _.chain({...state, status, rolled: dice}, status === "success" ? _.identity : fail);
  } else {
    return state;
  }
}

export function bank(n){
  return function(state){
    const {banked, rolled, status} = state;
    const {"true": claimed, "false": unclaimed} = _.groupBy(_.and(_.eq(n, _), _.complement(_.includes(banked, _))), rolled);
    const _banked = _.sort(_.concat(claimed, banked));
    return _.count(claimed) && status === "success" ? _.chain({...state, status: "banked", rolled: unclaimed, banked: _banked}, hasWorm(_banked) ? _.identity : roll) : state;
  }
}

export function worth(banked){
  return _.sum(_.map(function(n){
    return n ? n : 5;
  }, banked));
}

export function exposed(players, up, v){
  return _.first(_.keepIndexed(function(idx, {stack}){
    const {worms, value} = _.first(stack) || {};
    return value === v && idx !== up ? idx : null;
  }, players));
}

export function finish(state){
  const {up, players, tiles} = state;
  const n = up + 1;
  const status = _.count(tiles) ? "ready" : "over";
  return roll({...state, rolled: [], banked: [], status, up: n >= _.count(players) ? 0 : n});
}

export function claim(v){
  return function(state){
    const {up, banked, tiles} = state;
    const {"true": took, "false": left} = _.groupBy(function({worms, value}){
      return value === v;
    }, tiles);
    return v <= worth(banked) && _.count(took) && hasWorm(banked) ?
      _.chain(state,
        _.updateIn(_, ["players", up, "stack"], _.prepend(_, _.first(took))),
        _.assocIn(_, ["tiles"], left),
        finish) :
      state;
  }
}

export function steal(v){
  return function(state){
    const {banked, players, up} = state;
    const at = exposed(players, up, v);
    const tile = _.first(_.getIn(players, [at, "stack"]));
    return v === worth(banked) && at !== null ?
      _.chain(state,
        _.updateIn(_, ["players", at, "stack"], _.comp(_.toArray, _.rest)),
        _.updateIn(_, ["players", up, "stack"], _.prepend(_, tile)),
        finish) :
      state;
  }
}
