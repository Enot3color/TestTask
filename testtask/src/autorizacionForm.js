import React from "react";
import "./autorizationForm.css"

class AutorizationForm extends React.Component {
    idInstance
    apiTokenInstance
    recipientNumber

    render() {
        return (<form className="autorizationForm">
            <h1>Войти</h1>
            <div className="input-form">
                <input id="IdInstance" type="text" placeholder="IdInstance" onChange={(evt) => this.idInstance = evt.target.value} />
            </div>
            <div className="input-form">
                <input id="ApiTokenInstance" type="text" placeholder="ApiTokenInstance" onChange={(evt) => this.apiTokenInstance = evt.target.value} />
            </div>
            <div className="input-form">
                <input type="submit" value="Войти" onClick={() => this.props.onAutorization(this.idInstance, this.apiTokenInstance, this.recipientNumber)} />
            </div>
        </form>)
    }


}

export default AutorizationForm