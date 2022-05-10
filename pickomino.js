import _ from "./lib/@atomic/core.js";

export function init(names){
  const up = 0;
  const status = "ready";
  const players = _.mapa(function(name){
    return {name, stack: [], score: 0, best: null};
  }, names);
  const rolled = [];
  const banked = [];
  return {up, status, rolled, banked, players, tiles};
}

export const tiles = _.mapa(function(worms, rank){
  return {worms, rank};
}, _.concat(_.repeat(4, 1), _.repeat(4, 2), _.repeat(4, 3), _.repeat(4, 4)), _.iterate(_.inc, 21));

export function rollDice(n){
  return _.sort(_.asc(function(x){
    return x === 0 ? 6 : x;
  }), _.repeatedly(n, _.partial(_.randInt, 6)));
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
      return t.rank < tile.rank;
    }, tiles));
    return _.chain(state,
      _.updateIn(_, ["players", up, "stack"], _.comp(_.toArray, _.rest)),
      _.updateIn(_, ["players", up], score),
      _.update(_, "tiles", _.pipe(
        _.splice(_, ref, [tile]),
        _.toArray,
        _.butlast,
        _.toArray)),
        finish);
  } else {
    return finish(state);
  }
}

export function roll(state){
  switch(_.get(state, "status")) {
    case "ready":
    case "banked":
      const {banked, rolled} = state;
      const dice = rollDice(_.count(banked) ? _.count(rolled) : 8);
      const status = _.count(_.concat(rolled, banked)) === 0 || bankable(banked, dice) ? "success" : "failure";
      return {...state, status, rolled: dice};
    case "failure":
      return fail(state);
    default:
      return state;
  }
}

export function bank(n){
  return function(state){
    const {banked, rolled, status} = state;
    const {"true": claimed, "false": unclaimed} = _.groupBy(_.and(_.eq(n, _), _.complement(_.includes(banked, _))), rolled);
    const _banked = _.toArray(_.concat(claimed, banked));
    return _.count(claimed) && status === "success" ? _.chain({...state, status: "banked", rolled: unclaimed, banked: _banked}, hasWorm(_banked) ? _.identity : roll) : state;
  }
}

export function worth(banked){
  return _.sum(_.map(function(n){
    return n ? n : 5;
  }, banked));
}

export function exposed(players, up, r){
  return _.first(_.keepIndexed(function(idx, {stack}){
    const {worms, rank} = _.first(stack) || {};
    return rank === r && idx !== up ? idx : null;
  }, players));
}

export function rank(players){
  const ranked = _.sort(_.desc(_.get(_, "score")), _.desc(_.get(_, "best")), players);
  return _.mapa(function(player){
    return Object.assign(player, {pos: _.indexOf(ranked, player) + 1});
  }, players);
}

export function finish(state){
  const {up, players, tiles} = state;
  const n = up + 1;
  const status = _.count(tiles) ? "ready" : "over";
  return _.chain({...state, rolled: [], banked: [], status, up: n >= _.count(players) ? 0 : n},
    status === "over" ?
    _.update(_, "players", rank) :
    _.identity);
}

export function score(player){
  const score = _.sum(_.map(_.get(_, "worms"), _.get(player, "stack")));
  const best = _.last(_.sort(_.mapa(_.get(_, "rank"), _.get(player, "stack")))) || null;
  return _.chain(player,
    _.assoc(_, "score", score),
    _.assoc(_, "best", best));
}

export function claim(r){
  return function(state){
    const {up, banked, tiles} = state;
    const {"true": took, "false": left} = _.groupBy(function({worms, rank}){
      return rank === r;
    }, tiles);
    return r <= worth(banked) && _.count(took) && hasWorm(banked) ?
      _.chain(state,
        _.updateIn(_, ["players", up, "stack"], _.comp(_.toArray, _.prepend(_, _.first(took)))),
        _.updateIn(_, ["players", up], score),
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
        _.updateIn(_, ["players", at], score),
        _.updateIn(_, ["players", up, "stack"], _.comp(_.toArray, _.prepend(_, tile))),
        _.updateIn(_, ["players", up], score),
        finish) :
      state;
  }
}
