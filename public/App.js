"use strict";

var continents = ["Africa", "America", "Asia", "Australia", "Europa"];
var helloContinents = Array.from(continents, function (c) {
  return "Hello ".concat(c, "!");
});
var message = helloContinents.join(" ");

/*       const element = React.createElement("div", {title: "Outer div"},
React.createElement("h1", {className: "title"}, "Hello World")
); */
var element =
/*#__PURE__*/
// not HTML, not a string! It's JSX
React.createElement("div", {
  title: "Outer div"
}, /*#__PURE__*/React.createElement("h1", null, message));
ReactDOM.render(element, document.getElementById("contents"));