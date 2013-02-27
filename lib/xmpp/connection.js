scaleApp.register("connection", function(sb) {
        var instance = null;

	return {
		init: function() {
			instance = this;
			sb.subscribe("connect", this.connect);
			sb.subscribe("connect-anonymous", this.connectAnonymously);
			sb.subscribe("disconnect", this.disconnect);
			sb.subscribe("init-connection", this.initConnection);
			sb.subscribe("client::send-message", this.sendMessage);
		},
		destroy: function() {},

		connect: function(credentials) {
		  	jid = new JSJaCJID(credentials.jid);
			
			this.connection.connect({
				username: jid.getNode(),
				pass: credentials.password,
				domain: jid.getDomain(),
			});
		  
		},
		connectAnonymously: function(credentials) {
		    this.connection.connect({
		      domain: 'chat.meet.js',
		      authtype: 'saslanon',
		      resource: credentials.nick
		    });
		},
		
		disconnect: function() {
			this.connection.disconnect();
		},

		initConnection: function(server) {
			sb.connection = new JSJaCHttpBindingConnection({
				//oDbg: new JSJaCConsoleLogger(4),
				httpbase: 'http://' + server
			});
			
			sb.connection.registerHandler('onconnect', instance._handleConnected); 
			sb.connection.registerHandler('onerror', instance._handleError);
			sb.connection.registerHandler('ondisconnect', instance._handleDisconnected);
			sb.connection.registerHandler('message', instance._handleMessage);
			sb.emit("xmpp::init-connection", {connection: sb.connection});
		},

		_handleError: function(e) {
			sb.emit("log", "Opps.. something went wrong :/");
		},
		
		_handleConnected: function() {
			sb.emit("log", "Successfully connected!");
			/**
			 * Behold !!
			 * Dlaczego nie dziala samo sb.connection?
			 */
			sb.emit("xmpp::connect", {connection: sb.connection});
		},
		
		_handleDisconnected: function() {
			sb.emit("log", "Successfully disconnected!");
			sb.emit("xmpp::disconnect");
		},
		
		_handleMessage: function(message) {
		  try {
			sb.emit("client::message", {
			  from: message.getFromJID().getBareJID(),
			  resource: message.getFromJID().getResource(),
			  message: message.getBody().htmlEnc()
			});
		  } catch (e) { console.info(e); }
		},
		
		sendMessage: function(message) {
		  try {
		  var m = new JSJaCMessage();
		  m.setTo(new JSJaCJID(message.to));
		  m.setBody(message.message);
		  sb.connection.send(m);
		  } catch (e) { console.info(e); }
		}
	}
});