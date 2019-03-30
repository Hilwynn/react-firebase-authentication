import { observable, action, computed } from "mobx";

class MessageStore {
  @observable messages = null;
  @observable count = null;
  @observable limit = 5;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action setMessages = messages => {
    this.messages = messages;
  };

  @action setCount = count => {
    this.count = count;
  };

  @action setLimit = limit => {
    this.limit = limit;
  };

  @computed get messageList() {
    return Object.keys(this.messages || {}).map(key => ({
      ...this.messages[key],
      uid: key
    }));
  }
}

export default MessageStore;
