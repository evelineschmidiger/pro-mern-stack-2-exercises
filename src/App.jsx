const continents = ["Africa", "America", "Asia", "Australia", "Europa"];
const helloContinents = Array.from(continents, c => `Hello ${c}!`);
const message = helloContinents.join(" ");


/*       const element = React.createElement("div", {title: "Outer div"},
React.createElement("h1", {className: "title"}, "Hello World")
); */
const element = (
    // not HTML, not a string! It's JSX
    <div title="Outer div">
        <h1>{message}</h1>
    </div>
);

ReactDOM.render(element, document.getElementById("contents"));