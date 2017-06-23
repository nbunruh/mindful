import React, { Component } from 'react';

// Create the Search component
class Signup extends Component {

  constructor (props) {
    super(props);

    this.state = 
    {
        email: null,
        companyName: null,
        password: null,
        confirmPassword: null,
        statesValue: null,
        forbiddenWords: ["password", "user", "username"]
    };
  }
  
  // Whenever we detect ANY change in the textbox, we register it.
  handleChange(event) {
    console.log("****");
    console.log("TEXT CHANGED: " + this.state.search);

    // Here we create syntax to capture any change in text to the query terms (pre-search).
    // See this Stack Overflow answer for more details:
    // http://stackoverflow.com/questions/21029999/react-js-identifying-different-inputs-with-one-onchange-handler
    var newState = {};
    newState[event.target.id] = event.target.value;
    this.setState(newState);
  }

  getQuotes() {
    // API.getQuotes().then(function(quotesData) {
    //     console.log("Quots.js to QuotesPanel.js" , quotesData);
    //     this.setState({ quotes: quotesData.data });
    //     console.log("new state of quotes: ", this.state.quotes);
    //     console.log("saved quotes: ", quotesData.data);
        
    // }.bind(this));
  }

  // shouldComponentUpdate: function () {
  //   console.log("determine if we should render again?");
  //   return true;
  // },

  componentDidMount() {
    console.log("mounted the Signup component");
  }

  // Render the component. Note how we deploy both the Input and the Quotes Components
  render() {
    console.log("state of page: ", this.state.term);

    return (
    <div className="inputContainer">
        <form>
            <div className="container">
                <label><b>Email</b></label>
                <input type="text" placeholder="Enter Email" name="email" required />

                <label><b>Password</b></label>
                <input type="password" placeholder="Enter Password" name="psw" required />

                <label><b>Repeat Password</b></label>
                <input type="password" placeholder="Repeat Password" name="psw-repeat" required />
                <input type="checkbox" checked="checked" /> Remember me
                <p>By creating an account you agree to our <a href="#">
                Terms & Privacy</a>.</p>

                <div className="clearfix">
                    <button type="button"  className="cancelbtn">Cancel</button>
                    <button type="submit" className="signupbtn">Sign Up</button>
                </div>
            </div>
        </form>
    </div>
    );
  }
}

// Export the module back to the route
export default Signup;