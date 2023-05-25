import React from "react";
import Message from "./message";
import "./chat.css"
import send from "./send.png"
import stop from "./stop.png"

const GET_NOTIFICATION_URL = "https://api.green-api.com/waInstance{idInstance}/receiveNotification/{apiTokenInstance}"
const DELETE_NOTIFICATION_URL = "https://api.green-api.com/waInstance{idInstance}/deleteNotification/{apiTokenInstance}/{receiptId}"
const SEND_MESSAGE_URL = "https://api.green-api.com/waInstance{idInstance}/sendMessage/{apiTokenInstance}"
const OUTGOING_API_MESSAGE_RECIVED = "outgoingAPIMessageReceived";
const INCOMING_MESSAGE_RECEIVED = "incomingMessageReceived";

class Chat extends React.Component {
    handleKeyDown

    constructor(props) {
        super(props)
        this.state = {
            messages: [],
            newMessage: "",
            recipientName: null,
            isSubscribeToNotofication: false,
            chatId: ""
        }
        this.updateMessageList = this.updateMessageList.bind(this)
        this.inputMessageRef = React.createRef();
        this.subscribeToNotofication = this.subscribeToNotofication.bind(this)
        this.executeDeleteNotification = this.executeDeleteNotification.bind(this);
        this.executeGetNotification = this.executeGetNotification.bind(this);
        this.executeSendMessage = this.executeSendMessage.bind(this);
        this.updateMessage = this.updateMessage.bind(this)
        this.selectNumber = ((evt) => {
            this.setState({
                chatId: evt.target.value + "@c.us"
            })
        }).bind(this)
        this.startSubscribe = (() => {
            this.setState({
                isSubscribeToNotofication: true
            }, this.subscribeToNotofication)
        }).bind(this)
        this.stopSubscribe = (() => {
            this.setState({
                messages: [],
                newMessage: "",
                recipientName: null,
                isSubscribeToNotofication: false,
                chatId: ""
            })
        }).bind(this)
        this.handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                this.executeSendMessage(this.state.newMessage)
                this.setState({
                    newMessage: ""
                })
            }
        };
        this.numberHandleKeyDown = (event) => {
            if (event.key === 'Enter') {
                this.startSubscribe()
            }
        };
    }

    renderMessageList() {
        if (this.state.isSubscribeToNotofication) {
            return (
                <table>
                    <tbody>
                        {this.state.messages.map(message => <Message key={message.idMessage} message={message} />)}
                    </tbody>
                </table>
            )
        } else {
            return (
                <div className="selectNumberForm">
                    <div className="input-form">
                        <input onKeyDown={this.numberHandleKeyDown} 
                            type="text"
                            placeholder="Введите номер получателя"
                            onChange={this.selectNumber} />
                    </div>
                    <div className="input-form">
                        <input type="submit" value="Начать диалог" onClick={this.startSubscribe} />
                    </div>
                </div>
            )
        }
    }

    render() {
        return (<div className="chat">
            <div className="header-chat e2_3">
                <div className="chat-name e2_12">
                    {this.state.isSubscribeToNotofication && this.state.recipientName && <span className="recipient-name e2_13">{this.state.recipientName} <img className="stop" src={stop} onClick={this.stopSubscribe}/></span>}
                </div>
            </div>
            <div className="message-list">
                {this.renderMessageList()}
            </div>
            <div className="new-message e2_21">
                <input onKeyDown={this.handleKeyDown} className="mew-message-field e2_30" value={this.state.newMessage} onChange={(evt) => { this.updateMessage(evt.target.value) }} type="text" placeholder="Напишите сообщение..." />
                <div className="new-message-button e2_32">
                    <img src={send} onClick={() => {
                        this.executeSendMessage(this.state.newMessage)
                        this.setState({
                            newMessage: ""
                        })
                    }} />
                </div>
            </div>
        </div>)
    }


    updateMessage(text) {
        this.setState({
            newMessage: text
        })
    }

    updateMessageList(message) {
        let newMessage
        let type = message.body.typeWebhook
        switch (type) {
            case OUTGOING_API_MESSAGE_RECIVED:
                newMessage = {
                    idMessage: message.body.idMessage,
                    messageText: message.body.messageData.extendedTextMessageData.text,
                    senderName: message.body.senderData.senderName,
                    sender: message.body.senderData.sender,
                    timestamp: message.body.timestamp,
                    type: "outgoing"
                }
                break;
            case INCOMING_MESSAGE_RECEIVED:
                newMessage = {
                    idMessage: message.body.idMessage,
                    messageText: message.body.messageData.textMessageData.textMessage,
                    senderName: message.body.senderData.senderName,
                    sender: message.body.senderData.sender,
                    timestamp: message.body.timestamp,
                    type: "incoming"
                }
                break;
        }
        if (!this.state.recipientName)
            this.setState({
                recipientName: message.body.senderData.chatName
            })
        this.setState({
            messages: [...this.state.messages, newMessage]
        })
        this.executeDeleteNotification(message.receiptId)
    }

    subscribeToNotofication() {
        if (this.state.isSubscribeToNotofication) {
            let notificationPromise = this.executeGetNotification()
            notificationPromise.then((message) => {
                if (message) {
                    if (message.body.senderData.chatId !== this.state.chatId) {
                        this.executeDeleteNotification(message.receiptId)
                    } else {
                        this.updateMessageList(message)
                    }
                }
            }).finally(
                () => { new Promise(resolve => setTimeout(resolve, 5000)).then(() => this.subscribeToNotofication()) }
            )
        }
    }

    executeDeleteNotification(receiptId) {
        let url = DELETE_NOTIFICATION_URL.replace("{idInstance}", this.props.idInstance).replace("{apiTokenInstance}", this.props.apiTokenInstance).replace("{receiptId}", receiptId);
        return new Promise(function (resolve, reject) {
            let request = new XMLHttpRequest();
            request.open("delete", url, true);
            request.onload = function () {
                if (request.status >= 200 && request.status < 300) {
                    resolve(JSON.parse(request.response))
                } else {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                }
            };
            request.onerror = function () {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            };
            request.send();
        });
    }

    executeGetNotification() {
        let url = GET_NOTIFICATION_URL.replace("{idInstance}", this.props.idInstance).replace("{apiTokenInstance}", this.props.apiTokenInstance);
        return new Promise(function (resolve, reject) {
            let request = new XMLHttpRequest();
            request.open("get", url, true);
            request.onload = function () {
                if (request.status >= 200 && request.status < 300) {
                    if (request.response) {
                        resolve(JSON.parse(request.response))
                    }
                    else {
                        resolve(null)
                    }
                } else {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                }
            };
            request.onerror = function () {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            };
            request.send();
        });
    }

    executeSendMessage(text) {
        let chatId = this.state.chatId
        let url = SEND_MESSAGE_URL.replace("{idInstance}", this.props.idInstance).replace("{apiTokenInstance}", this.props.apiTokenInstance);
        return new Promise(function (resolve, reject) {
            let request = new XMLHttpRequest();
            request.open("post", url, true);
            request.onload = function () {
                if (request.status >= 200 && request.status < 300) {
                    if (request.response) {
                        resolve(JSON.parse(request.response))
                    }
                    else {
                        resolve(null)
                    }
                } else {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                }
            };
            request.onerror = function () {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            };
            let jsonObject = {
                "chatId": chatId,
                "message": text
            };
            request.send(JSON.stringify(jsonObject));
        })
    }
}

export default Chat