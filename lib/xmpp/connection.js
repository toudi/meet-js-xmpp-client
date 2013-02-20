scaleApp.register("connection", function(sb) {
        var instance = null;

	return {
		init: function() {
			instance = this;
			sb.subscribe("connect", this.connect);
			sb.subscribe("disconnect", this.disconnect);
			sb.subscribe("init-connection", this.initConnection);
		},
		destroy: function() {},

		connect: function(credentials) {
		  	jid = new JSJaCJID(credentials.jid);
			
			this.connection.connect({
				username: jid.getNode(),
				pass: credentials.password,
				domain: jid.getDomain()
			});
		  
		},
		
		disconnect: function() {
			this.connection.disconnect();
		},

		initConnection: function(server) {
			this.connection = new JSJaCHttpBindingConnection({
				//oDbg: new JSJaCConsoleLogger(4),
				httpbase: 'http://' + server
			});
			this.connection.registerHandler('onconnect', instance._handleConnected);
			this.connection.registerHandler('onerror', instance._handleError);
			this.connection.registerHandler('ondisconnect', instance._handleDisconnected);
		},

		_handleError: function(e) {
			sb.emit("log", "Opps.. something went wrong :/");
		},
		
		_handleConnected: function() {
			sb.emit("log", "Successfully connected!");
			sb.emit("xmpp::connect", instance.connection);
		},
		
		_handleDisconnected: function() {
			sb.emit("log", "Successfully disconnected!");
			sb.emit("xmpp::disconnect");
		}
	}
});