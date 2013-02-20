scaleApp.register("client", function(sb) {
	return {
		init: function() {
			$("#login").click(function(){
				sb.emit("log", "Login attempt ...");
				sb.emit("connect", {
					jid: $("#inputJid").val(),
					password: $("#inputPassword").val()
				});
			});
			
			$("#logout").click(function(){
				sb.emit("disconnect");
			});
		},
		destroy: function(){

		}
	}

});

scaleApp.register("logger", function(sb) {

	return {
		init: function() {
			sb.subscribe({
				log: this.log
			})
		},

		destroy: function(){},

		log: function(message) {
			$("#log").append(
				$("<p>").text(message)
			);
		}
	}
});

$(function(){
	scaleApp.startAll();
	scaleApp.emit("init-connection", "meet.js/xmpp");
});