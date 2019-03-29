import React, { Component } from "react";

import * as ROLES from "../../constants/roles";

class MessageItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      editText: this.props.message.text
    };
  }

  getFormattedTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${hours}.${minutes}`;
  }

  onToggleEditMode = () => {
    this.setState(state => ({
      editMode: !state.editMode,
      editText: this.props.message.text
    }));
  };

  onChangeEditText = event => {
    this.setState({ editText: event.target.value });
  };

  onSaveEditText = () => {
    this.props.onEditMessage(
      this.props.authUser,
      this.props.message,
      this.state.editText
    );

    this.setState({ editMode: false });
  };

  render() {
    const { authUser, message, onRemoveMessage } = this.props;
    const { editMode, editText } = this.state;

    return (
      <li>
        {editMode ? (
          <span>
            <input
              type="text"
              value={editText}
              onChange={this.onChangeEditText}
            />
            <button onClick={this.onSaveEditText}>Save</button>
            <button onClick={this.onToggleEditMode}>Reset</button>
          </span>
        ) : (
          <span>
            <strong>{message.user.username || message.user.userId}</strong>{" "}
            {this.getFormattedTimestamp(message.createdAt)} {message.text}
            {message.editedAt && <span>(Edited)</span>}
            {authUser &&
              (authUser.uid === message.userId ||
                authUser.roles.includes(ROLES.ADMIN)) && (
                <span>
                  <button onClick={this.onToggleEditMode}>Edit</button>
                  <button onClick={() => onRemoveMessage(authUser, message)}>
                    Remove
                  </button>
                </span>
              )}
          </span>
        )}
      </li>
    );
  }
}

export default MessageItem;
