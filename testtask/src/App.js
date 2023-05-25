import React from "react";
import AutorizationForm from "./autorizacionForm";
import Chat from "./chat";

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isAutorization: false,
      idInstance: "",
      apiTokenInstance: ""
    }
    this.autorizationAction = this.autorizationAction.bind(this)
  }

  render() {
    if (!this.state.isAutorization) {
      return (
        <div className="App">
          <AutorizationForm onAutorization={this.autorizationAction}/>
        </div>
      );
    } else {
      return (
        <div className="App">
          <Chat idInstance={this.idInstance} apiTokenInstance={this.apiTokenInstance}/>
        </div>
      )
    }
  }

  autorizationAction(idInstance, apiTokenInstance, recipientNumber) {
    this.idInstance = idInstance
    this.apiTokenInstance = apiTokenInstance
    this.recipientNumber = recipientNumber
    this.setState({
      isAutorization: !!idInstance && !!apiTokenInstance
    })
  }
}

export default App;
