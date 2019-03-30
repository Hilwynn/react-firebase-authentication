import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";

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
    let hours = ("0" + date.getHours()).slice(-2);
    let minutes = ("0" + date.getMinutes()).slice(-2);

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
      this.props.sessionStore.authUser,
      this.props.message,
      this.state.editText
    );

    this.setState({ editMode: false });
  };

  render() {
    const { message, onRemoveMessage, sessionStore } = this.props;
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
            {sessionStore.authUser &&
              (sessionStore.authUser.uid === message.userId ||
                sessionStore.authUser.roles.includes(ROLES.ADMIN)) && (
                <span>
                  <button onClick={this.onToggleEditMode}>Edit</button>
                  <button
                    onClick={() =>
                      onRemoveMessage(sessionStore.authUser, message)
                    }
                  >
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

export default compose(
  inject("sessionStore"),
  observer
)(MessageItem);
