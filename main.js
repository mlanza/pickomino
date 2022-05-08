import {init, bank, roll, claim, steal} from "./pickomino.js";
import _ from "./lib/@atomic/core.js";
import $ from "./lib/@atomic/reactives.js";
import dom from "./lib/@atomic/dom.js";

const el = dom.sel1("#pickomino"),
      tiles = dom.sel1(".tiles", el),
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
  return li({class: "tile", id: "tile-" + tile.value, worms: tile.worms}, div({class: "rank"}, tile.value), div({class: "worms"}));
}

function renderTiles(state){
  return ul(_.mapa(renderTile, state.tiles));
}

function renderPlayers(state){
  return ul(_.mapa(function(player){
    return li({name: player.name},
      div({class: "name"}, player.name),
      ul({class: "stack"}, _.mapa(renderTile, player.stack)));
  }, state.players));
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
  }, 10)
}

/*function renderDice(state){
  return ul(_.mapa(function(die){

  }, state.rolled))
}*/

$.sub($hist, function([curr, prior]){
  dom.html(tiles, renderTiles(curr));
  dom.html(players, renderPlayers(curr));

  const t23 = dom.sel1("#tile-23"),
        avas = dom.sel1("[name='Ava'] .stack");

  setTimeout(function(){
    move(t23, avas);
  }, 500)
});
