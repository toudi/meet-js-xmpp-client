scaleApp.register("roster", function(sb) {
  var instance = null;
  return {
    init: function() {
      instance = this;
      sb.subscribe("xmpp::init-connection", this.registerHandlers); // !!!
      sb.subscribe("xmpp::connect", this.onConnect);
    },
    
    destroy: function() {
    },
    
    onConnect: function(data) {
      connection = data.connection;
      sb.connection = connection;
      connection.send(new JSJaCPresence().setPriority(5));
      /*
      var oMsg = new JSJaCMessage();
      oMsg.setTo("toudi@meet.js");
      oMsg.setBody("user@meet.js");
      con.send(oMsg);*/
      
      var rosterRequest = new JSJaCIQ();
      //rosterRequest.setIQ(connection.domain, 'get');
      rosterRequest.setType('get');
      rosterRequest.setQuery(NS_ROSTER);
      connection.send(rosterRequest);
    },
    
    handleIq: function(iq) {
      $(iq.doc.xml).find("item").each(function(){
	sb.emit("client::add-roster-item", new JSJaCJID($(this).attr('jid')));	
      });      
    },
    
    registerHandlers: function(data) {
      if (!(sb.hasOwnProperty('connection'))) {
	sb.connection = data.connection;
      }
      sb.connection.registerHandler('iq', instance.handleIq);
      sb.connection.registerHandler('presence', instance.handlePresence);
    },
    
    handlePresence: function(presence) {
      console.info(presence.getFromJID().getBareJID());
      if (presence.getFromJID().getBareJID() != sb.connection.jid) {
	sb.emit("client::roster-presence-changed", {
	  jid: presence.getFromJID(),
	  presence: presence.getShow(),
	  status: presence.getStatus(),
	  type: presence.getType()
	});
      }
    }
  }
});