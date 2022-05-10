import {init, bank, roll, claim, steal, winner} from "./pickomino.js";
import _ from "./lib/@atomic/core.js";
import $ from "./lib/@atomic/reactives.js";
import dom from "./lib/@atomic/dom.js";

const el = dom.sel1("#pickomino"),
      tiles = dom.sel1(".tiles", el),
      r = dom.sel1(".roll", el),
      dice = dom.sel1(".dice", el),
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

const $state = $.cell(init(["Mario", "Ava", "Zoe"]));
Object.assign(window, {_, $, dom}, {$state}, {bank, roll, claim, steal});

const $hist = $.hist($state);

function renderTile(tile){
  return li({class: "tile", id: "tile-" + tile.rank, "data-rank": tile.rank, "data-worms": tile.worms}, div({class: "rank"}, tile.rank), div({class: "worms"}));
}

function renderTiles(state){
  return ul(_.mapa(renderTile, state.tiles));
}

function renderDie(die){
  return li({"data-value": die}, die ? die : "🪱");
}

function renderDice(state){
  const total = _.sum(_.map(function(n){
    return n === 0 ? 5 : n;
  }, state.banked));
  return [ul({"data-banked": _.join(" ", _.unique(state.banked))}, _.mapa(renderDie, state.rolled)), ul(_.mapa(renderDie, state.banked)), _.count(state.banked) ? span(" = ", total) : null];
}

function renderPlayers(state){
  return [
    div({class: "winner"}, _.chain(state.players, winner, _.get(_, "name"), _.str(_, " wins!"))),
    ul(_.mapIndexed(function(idx, player){
      return li({name: player.name, "data-active": idx === state.up},
        div({class: "score"}, player.score),
        div({class: "roll"}, "🎲"),
        div({class: "name"}, player.name),
        ul({class: "stack"}, _.mapa(renderTile, player.stack)));
  }, state.players))];
}

function move(start, end){
  const [sx, sy] = getOffset(start),
        [ex, ey] = getOffset(end);
  const p = _.parent(start);
  const el = _.doto(_.clone(start), dom.addClass(_, "start"));
  const css = `.start { position: absolute; left: ${sx}px; top: ${sy}px;} .end { left: ${ex}px; top: ${ey}px; transition: all .6s ease-in-out;}`;
  const s = style(css);
  dom.append(document.body, s, el);
  setTimeout(function(){
    dom.addClass(start, "taken");
    dom.addClass(el, "end");
    setTimeout(function(){
      //dom.omit(el);
    }, 600)
  }, 10)
}

$.on(el, "click", "div.roll", function(e){
  _.swap($state, roll);
});

$.on(dice, "click", "ul:first-child > li", function(e){
  const text = dom.text(e.target);
  const value = text === "🪱" ? 0 : parseInt(text);
  _.swap($state, bank(value));
})

$.on(tiles, "click", ".tile", function(e){
  const rank = parseInt(dom.attr(this, "data-rank"));
  _.swap($state, claim(rank));
});

$.on(players, "click", ".stack .tile", function(e){
  const rank = parseInt(dom.attr(this, "data-rank"));
  _.swap($state, steal(rank));
});

$.sub($hist, function([current, prior]){
  dom.attr(el, "data-status", current.status);
  dom.html(tiles, renderTiles(current));
  dom.html(dice, renderDice(current));
  dom.html(players, renderPlayers(current));

  /*
  const t23 = dom.sel1("#tile-23"),
        avas = dom.sel1("[name='Ava'] .stack");

  setTimeout(function(){
    move(t23, avas);
  }, 500)
  */
});
