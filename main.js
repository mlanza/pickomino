import * as p from "./pickomino.js";
import _ from "./lib/@atomic/core.js";
import $ from "./lib/@atomic/reactives.js";
import dom from "./lib/@atomic/dom.js";

const WORM = "🐛";

const el = dom.sel1("#pickomino"),
      tiles = dom.sel1(".tiles", el),
      r = dom.sel1(".roll", el),
      dice = dom.sel1(".dice", el),
      wins = dom.sel1(".winner", el),
      players = dom.sel1(".players", el);

const ul = dom.tag("ul"),
      li = dom.tag("li"),
      div = dom.tag("div"),
      span = dom.tag("span"),
      style = dom.tag("style");

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return [rect.left + window.scrollX, rect.top + window.scrollY];
}

const params = (new URL(document.location)).searchParams;
const $state = $.cell(p.init(params.get('players').split(",")));
Object.assign(window, {_, $, dom}, {$state});

const $hist = $.hist($state);

function renderTile(remaining, removed){
  const xs = _.mapa(_.get(_, "rank"), remaining);
  const ys = _.mapa(_.get(_, "rank"), removed);
  return function(tile){
    return li({class: "tile", id: "tile-" + tile.rank, "data-rank": tile.rank, "data-worms": tile.worms, "data-status": _.includes(xs, tile.rank) ? "unclaimed" : _.includes(ys, tile.rank) ? "removed" : "claimed"}, div({class: "rank"}, tile.rank), div({class: "worms"}));
  }
}

function renderTiles(state){
  return ul(_.mapa(renderTile(state.tiles, state.removed), p.tiles));
}

function renderDie(die){
  return li({"data-value": die}, die ? die : WORM);
}

function renderDice(state){
  const total = _.sum(_.map(function(n){
    return n === 0 ? 5 : n;
  }, state.banked));
  return [ul({"data-banked": _.join(" ", _.unique(state.banked))}, _.mapa(renderDie, state.rolled)), ul(_.mapa(renderDie, state.banked)), _.count(state.banked) ? span(" = ", total) : null];
}

function renderPlayers(state){
  return ul(_.mapIndexed(function(idx, player){
      return li({name: player.name, "data-active": idx === state.up},
        div({class: "score"}, player.score),
        div({class: "roll"}, "🎲"),
        div({class: "name"}, player.name),
        ul({class: "stack"}, _.mapa(renderTile(player.stack, []), player.stack)));
  }, state.players));
}

function renderWinner(state){
  return _.chain(state.players, p.winner, _.get(_, "name"), _.str(_, " wins!"));
}

$.on(el, "click", "div.roll", function(e){
  _.swap($state, p.dispatch(_.deref($state).up, "roll"));
});

$.on(dice, "click", "ul:first-child > li", function(e){
  const text = dom.text(e.target);
  const value = text === WORM ? 0 : parseInt(text);
  _.swap($state, p.dispatch(_.deref($state).up, "bank", [value]));
});

$.on(tiles, "click", ".tile", function(e){
  const rank = parseInt(dom.attr(this, "data-rank"));
  _.swap($state, p.dispatch(_.deref($state).up, "claim", [rank]));
});

$.on(players, "click", ".stack .tile", function(e){
  const rank = parseInt(dom.attr(this, "data-rank"));
  _.swap($state, p.dispatch(_.deref($state).up, "steal", [rank]));
});

function move(from, to, f){
  const [fx, fy] = getOffset(from),
        [tx, ty] = getOffset(to);
  const p = _.parent(from);
  const el = _.doto(_.clone(from), f, dom.addClass(_, "from"));
  const css = style(`
  .from {
    position: absolute;
    left: ${fx}px;
    top: ${fy}px;
    z-index: 1000;
  }
  .to {
    left: ${tx}px;
    top: ${ty}px;
    transition: all .8s ease-in-out;
  }`);
  to.style.visibility = "hidden";
  dom.append(document.body, css, el);
  setTimeout(function(){
    dom.addClass(el, "to");
    setTimeout(function(){
      dom.omit(el);
      to.style.visibility = "visible";
    }, 800)
  }, 10)
}

function claim(from, to){
  move(from, to, dom.attr(_, "data-status", "unclaimed"))
}

$.sub($hist, function([current, prior]){
  const action = _.chain(current, _.get(_, "actions"), _.first);
  _.log("=>", [current, prior], "action", action);
  dom.attr(el, "data-status", current.status);
  dom.html(tiles, renderTiles(current));
  dom.html(dice, renderDice(current));
  dom.html(players, renderPlayers(current));
  dom.html(wins, renderWinner(current));

  switch(action?.type){
    case "claim":
      const id = action.args[0];
      const from = dom.sel1(`.tiles li[id="tile-${id}"]`);
      const to = dom.sel1(`.players li[id="tile-${id}"]`);
      claim(from, to);
      break;
    case "steal":
      /*const id = action.args[0];
      const from = dom.sel1(`.players li[id="tile-${id}"]`);
      const to = dom.sel1(`.players li[id="tile-${id}"]`);
      claim(from, to);*/

  }

  /*
  const t23 = dom.sel1("#tile-23"),
        avas = dom.sel1("[name='Ava'] .stack");

  setTimeout(function(){
    move(t23, avas);
  }, 500)
  */
});
