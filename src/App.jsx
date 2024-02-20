"use strict";

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

// when creating a JS-Object out of a JSON-String when using JSON.parse():
// loops over each entry while creating the new Object and the keys and values can be used as arguments in the reviver function here:
function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value) ;
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
/*   ReactDOM.render(React.createElement("h1", null, `${JSON.stringify(result.data.issueList[0])},
  ${JSON.stringify(result.data.issueList[1])}`), document.getElementById("contents"));
 */
}


loadData();



/////////// REACT /////////////

const initialIssues = [
  {
    id: 1, status: 'New', owner: 'Ravan', effort: 5,
    created: new Date('2018-08-15'), due: undefined,
    title: 'Error in console when clicking Add',
  },
  {
    id: 2, status: 'Assigned', owner: 'Eddie', effort: 14,
    created: new Date('2018-08-16'), due: new Date('2018-08-30'),
    title: 'Missing bottom border on panel',
  },
];

// ISSUEFILTER
class IssueFilter extends React.Component {
  render() {
    return (
      <div>This is a placeholder for the issue filter.</div>
    )
  }
}

function IssueRow(props) {
    const issue = this.props.issue;
    return (
      <tr>
        <td>{issue.id}</td>
        <td>{issue.status}</td>
        <td>{issue.owner}</td>
        <td>{issue.created.toDateString()}</td>
        <td>{issue.effort}</td>
        <td>{issue.due ? issue.due.toDateString() : ''}</td>
        <td>{issue.title}</td>
      </tr>
    );
}

// ISSUETABLE with ISSUEROWS
// multiple issuerows are instanciated with props here
function IssueTable(props) {
    const issueRows = this.props.issues.map(issue => <IssueRow key={issue.id} issue={issue} />);
    return (
      <table className="bordered-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Created</th>
            <th>Effort</th>
            <th>Due Date</th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {issueRows}
        </tbody>
      </table>
    )
}

// ISSUEADD
class IssueAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
   // e.preventDefault();
    const form = document.forms.issueAdd;
    const issue = {
      owner: form.owner.value,
      title: form.title.value,
      status: "New"
    }
    this.props.createIssue(issue);
    form.owner.value = "";
    form.title.value = "";
  }
  render() {
    return (
      <form name="issueAdd" onSubmit={this.handleSubmit}>
        <input type="text" name="owner" placeholder="Owner" />
        <input type="text" name="title" placeholder="Title" />
        <button>Add</button>
      </form>
    )
  }
}

// ISSUELIST
class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadDatax();
  }

  loadDatax() {
    setTimeout(() => {
      this.setState({ issues: initialIssues});
    }, 500);
  }

  createIssue(issue) {
    issue.id = this.state.issues.length + 1;
    issue.created = new Date();
    const newIssueList = this.state.issues.slice();
    newIssueList.push(issue);
    this.setState({ issues: newIssueList });
  }

  render() {
    return (
      <React.Fragment>
        <h1>Issue Tracker</h1>
        <IssueFilter  />
        <hr />
        <IssueTable issues={this.state.issues}/>
        <hr />
        <IssueAdd createIssue={this.createIssue}/>
      </React.Fragment>
    )
  }
}

// create an INSTANCE of the IssueList class
const element = <IssueList />

  
ReactDOM.render(element, document.getElementById("contents"));
  
// npm run watch to compile App.jsx to App.js with babel - then it watches

