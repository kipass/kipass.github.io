"use strict";

var icons = {
  cow: "🐄",
  pig: "🐖",
  goat: "🐐",
  monkey: "🐒",
  horse: "🐎",
  snake: "🐍",
  chicken: "🐔",
  cat: "🐱",
  dog: "🐶",
  whale: "🐳",
  dragon: "🐉",
  octopus: "🐙",
  turtle: "🐢",
  penguin: "🐧",
  elephant: "🐘",
  fish: "🐟",
  panda: "🐼",
  fox: "🐺",
  dolphin: "🐬"
};

var colors = [
  "purple", "orange", "black", "green", "red", "blue", "gray"
];

module.exports = {
  icons: icons,
  names: Object.keys(icons).sort(),
  colors: colors.sort()
};
