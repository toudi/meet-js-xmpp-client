scaleApp.register("muc", function(sb) {
  return {
    init: function() {
      sb.instance = this;
      sb.subscribe("xmpp::init-connection", this.registerHandlers); // !!!
      sb.subscribe("xmpp::muc::set-room", function(room) { sb.room = room; });
      sb.subscribe("xmpp::connect", this.onConnect);
      sb.subscribe("client::send-muc-room-message", this.sendRoomMessage);
    },
    destroy: function() {
    },
    
    registerHandlers: function(data) {
      sb.connection = data.connection;
      sb.connection.registerHandler("presence", sb.instance.onPresence);
    },
    
    onConnect: function() {
      var pres = new JSJaCPresence();
      sb.connection.send(pres);
      
      var chatPresence = new JSJaCPresence();
      console.info(sb.connection);
      chatPresence.setTo(sb.room + "/" + new JSJaCJID(sb.connection.fulljid).getResource());
      var xnode = chatPresence.buildNode("x");
      xnode.setAttribute("xmlns", NS_MUC);
      chatPresence.appendNode(xnode);
      sb.connection.send(chatPresence);
    },
    
    onPresence: function(presence) {
      jid = presence.getFromJID();
      if (jid.getBareJID() == sb.room) {
	if (jid.getResource() != sb.connection.resource) {
	  if (presence.getType() == 'unavailable') {
	    sb.emit('client::remove-muc-user', jid.getResource());
	  }
	  else {
	    sb.emit("client::add-muc-user", jid.getResource());
	  }
	}
      }
    },
    
    sendRoomMessage: function(msg) {
      var message = new JSJaCMessage();
      message.setType("groupchat");
      message.setTo(sb.room);
      message.setBody(msg.message);
      sb.connection.send(message);
    }
  }
});