import React, { Component } from "react";

import { AuthUserContext } from "../Session";
import { withFirebase } from "../Firebase";
import MessageList from "./MessageList";

import * as ROLES from "../../constants/roles";

class Messages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      loading: false,
      messages: [],
      limit: 5,
      count: null
    };
  }

  componentDidMount() {
    this.onListenForMessages();
  }

  componentWillUnmount() {
    this.props.firebase.messages().off();
  }

  onListenForMessages() {
    this.setState({ loading: true });

    this.props.firebase.messages().on("value", snapshot => {
      this.setState({
        count: snapshot.numChildren()
      });
    });

    this.props.firebase
      .messages()
      .orderByChild("createdAt")
      .limitToLast(this.state.limit)
      .on("value", snapshot => {
        const messageObject = snapshot.val();

        console.log(messageObject);

        if (messageObject) {
          const messageList = Object.keys(messageObject).map(key => ({
            ...messageObject[key],
            uid: key
          }));

          console.log(messageList);

          this.setState({
            messages: messageList,
            loading: false
          });
        } else {
          this.setState({ messages: null, loading: false });
        }
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
    const { limit, count } = this.state;

    if (limit < count) {
      this.setState(
        state => ({ limit: state.limit + 5 }),
        this.onListenForMessages
      );
    }
  };

  render() {
    const { users } = this.props;
    const { text, messages, loading, limit, count } = this.state;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            {!loading && messages && limit < count && (
              <button type="button" onClick={this.onNextPage}>
                More
              </button>
            )}

            {loading && <div>Loading ...</div>}

            {messages ? (
              <MessageList
                authUser={authUser}
                messages={messages.map(message => ({
                  ...message,
                  user: users
                    ? users[message.userId]
                    : { userId: message.userId }
                }))}
                onEditMessage={this.onEditMessage}
                onRemoveMessage={this.onRemoveMessage}
              />
            ) : (
              <div>There are no messages ...</div>
            )}

            <form onSubmit={event => this.onCreateMessage(event, authUser)}>
              <input type="text" value={text} onChange={this.onChangeText} />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

export default withFirebase(Messages);
