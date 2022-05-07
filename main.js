import {init, bank, roll, claim, steal} from "./pickomino.js";
import _ from "./lib/@atomic/core.js";
import $ from "./lib/@atomic/reactives.js";

const $state = $.cell(init(["Mario", "Ava", "Zoe"]));
Object.assign(window, {_, $}, {$state}, {bank, roll, claim, steal});
