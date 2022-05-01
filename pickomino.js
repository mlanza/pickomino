import _ from "./lib/@atomic/core.js";

export function init(names){
  const up = 0;
  const status = "ready";
  const players = _.mapa(function(name){
    return {player: name, stack: []};
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

export function roll(state){
  const {banked, rolled} = state;
  return {...state, status: "rolled", rolled: rollDice(banked.length ? rolled.length : 8)};
}

export function bank(n){
  return function(state){
    const {banked, rolled, status} = state;
    const {"true": claimed, "false": unclaimed} = _.groupBy(_.and(_.eq(n, _), _.complement(_.includes(banked, _))), rolled);
    return _.count(claimed) && status === "rolled" ? {...state, status: "banked", rolled: unclaimed, banked: _.sort(_.concat(claimed, banked))} : state;
  }
}

function worth(banked){
  return _.sum(_.map(function(n){
    return n ? n : 5;
  }, banked));
}

function snatchable(players, up, v){
  return _.keepIndexed(function(idx, {stack}){
    const {worms, value} = _.first(stack);
    return value === v && idx !== up ? idx : null;
  }, players);
}

export function take(v){
  return function(state){
    const {banked, tiles} = state;
    const {"true": took, "false": left} = _.groupBy(function({worms, value}){
      return value === v;
    }, tiles);
    return v <= worth(banked) && _.count(took) ?
      _.chain(state,
        _.updateIn(_, ["players", up, "stack"], _.prepend(_, _.first(took))),
        _.assocIn(_, ["tiles"], left),
        finish) :
      state;
  }
}

function finish(state){
  const {up, players} = state;
  const n = up + 1;
  return {...state, status: "ready", up: n > _.count(players) ? 0 : n};
}

export function snatch(v){
  return function(state){
    const {banked, players, up} = state;
    const at = snatchable(players, up, v);
    const tile = _.first(_.getIn(players, [at, "stack"]));
    return v === worth(banked) && who ?
      _.chain(state,
        _.updateIn(_, ["players", up, "stack"], _.prepend(_, tile)),
        _.updateIn(_, ["players", at, "stack"], _.comp(_.toArray, _.rest)),
        finish) :
      state;
  }
}
