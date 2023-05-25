import React from "react";
import dayjs from "dayjs"

class Message extends React.Component {

    render() {
        return (
            <tr>
                <td>
                    <div className={"message-block " + this.props.message.type}>
                        <div className="text_block">
                            <span className="text">{this.props.message.messageText}</span>
                            <span className="time">{dayjs(new Date(this.props.message.timestamp * 1000)).format("HH:mm")}</span>
                        </div>
                    </div>
                </td>
            </tr>
        )
    }
}

export default Message