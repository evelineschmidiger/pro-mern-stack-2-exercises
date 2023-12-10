"use strict";


const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

// when creating a JS-Object out of a JSON-String when using JSON.parse():
// loops over each entry while creating the new Object and the keys and values can be used as arguments in the reviver function here:
function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}


async function loadData() {
  const query = `query {
    issueList {
      id title status owner
      created effort due
    }
  }`;
/*   const query = `mutation issueAdd($issue: IssueInputs!) {
    issueAdd(issue: $issue) {
      id
    }
  }` */

  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({ query })
  });


  // body: is JSON-string here:
  const body = await response.text();
  // converting JSON-string to a javaScript Object:
  // reviver-function: makes JS-Date-Object out of Date-String
  const result = JSON.parse(body, jsonDateReviver);

  // Renders IssuesList with two items as two strings in DOM
  // Ich verstehe React noch nicht besser
  ReactDOM.render(React.createElement("h1", null, `${JSON.stringify(result.data.issueList[0])},
  ${JSON.stringify(result.data.issueList[1])}`), document.getElementById("contents"));
}

loadData();




