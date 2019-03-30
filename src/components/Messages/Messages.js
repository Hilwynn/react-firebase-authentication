import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { compose } from "recompose";

import { withFirebase } from "../Firebase";
import MessageList from "./MessageList";

import * as ROLES from "../../constants/roles";

class Messages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      loading: false
    };
  }

  componentDidMount() {
    if (!this.props.messageStore.messageList.length) {
      this.setState({ loading: true });
    }

    this.onListenForMessages();
  }

  componentWillUnmount() {
    this.props.firebase.messages().off();
  }

  onListenForMessages() {
    this.setState({ loading: true });

    this.props.firebase.messages().on("value", snapshot => {
      this.props.messageStore.setCount(snapshot.numChildren());
    });

    this.props.firebase
      .messages()
      .orderByChild("createdAt")
      .limitToLast(this.props.messageStore.limit)
      .on("value", snapshot => {
        this.props.messageStore.setMessages(snapshot.val());

        this.setState({ loading: false });
      });
  }

  onChangeText = event => {
    this.setState({ text: event.target.value });
  };

  onCreateMessage = (event, authUser) => {
    this.props.firebase.messages().push({
      text: this.state.text,
      userId: authUser.uid,
      createdAt: this.props.firebase.serverValue.TIMESTAMP
    });

    this.setState({ text: "" });

    event.preventDefault();
  };

  onRemoveMessage = (authUser, message) => {
    if (
      authUser.uid === message.userId ||
      authUser.roles.includes(ROLES.ADMIN)
    ) {
      this.props.firebase.message(message.uid).remove();
    }
  };

  onEditMessage = (authUser, message, text) => {
    if (
      authUser.uid === message.userId ||
      authUser.roles.includes(ROLES.ADMIN)
    ) {
      this.props.firebase.message(message.uid).set({
        ...message,
        text,
        editedAt: this.props.firebase.serverValue.TIMESTAMP
      });
    }
  };

  onNextPage = () => {
    const { limit, count, setLimit } = this.props.messageStore;

    if (limit < count) {
      setLimit(limit + 5);
      this.onListenForMessages();
    }
  };

  render() {
    const { users, messageStore, sessionStore } = this.props;
    const { text, loading } = this.state;
    const { limit, count } = messageStore;
    const messages = messageStore.messageList;

    return (
      <div>
        {!loading && messages && limit < count && (
          <button type="button" onClick={this.onNextPage}>
            More
          </button>
        )}

        {loading && <div>Loading ...</div>}

        {messages ? (
          <MessageList
            messages={messages.map(message => ({
              ...message,
              user: users ? users[message.userId] : { userId: message.userId }
            }))}
            onEditMessage={this.onEditMessage}
            onRemoveMessage={this.onRemoveMessage}
          />
        ) : (
          <div>There are no messages ...</div>
        )}

        <form
          onSubmit={event => this.onCreateMessage(event, sessionStore.authUser)}
        >
          <input type="text" value={text} onChange={this.onChangeText} />
          <button type="submit">Send</button>
        </form>
      </div>
    );
  }
}

export default compose(
  withFirebase,
  inject("messageStore", "sessionStore"),
  observer
)(Messages);
