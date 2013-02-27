scaleApp.register("client", function(sb) {
	var presence_colors = {
	  'unavailable': 'grey',
	  'available': 'green',
	  'away': 'orange',
	  'dnd': 'red'
	}
	return {
		init: function() {
			sb.instance = this;
			sb.chat_windows = {};
			sb.subscribe(["xmpp::connect", "xmpp::disconnect"], function(){
			    sb.resource = $("#nick").val();
			    $("#roster").children("li").remove();
			    $("#login-form,#chat-ui").toggle();
			});
			sb.subscribe("client::add-muc-user", function(nick) {
			  $("#roster").append($("<li>").attr("data-nick", nick).text(nick));
			});
			sb.subscribe("client::remove-muc-user", function(nick) {
			  $("#roster").children("li[data-nick="+nick+"]").remove();
			  sb.instance.addMessage("** "+nick+" has left the building");
			});
			sb.subscribe("client::message", function(message) {
			  if (message.resource != sb.resource) {
			    sb.instance.addMessage("<"+message.resource+"> :: "+message.message)
			  }
			});
			sb.subscribe("client::send-muc-room-message", function(message) {
			  sb.instance.addMessage("> " + message.message);
			});
			
			$("#login").click(function(){
				sb.emit("connect-anonymous", {
					nick: $("#nick").val(),
				});
			});
			
			$("#logout").click(function(){
				sb.emit("disconnect");
			});
			
			$(".chat-form").submit(function(){
			  var message = $(this).children('input[name="message"]');
			  if (message.val() != '') {
			  sb.emit("client::send-muc-room-message", {
			    message: message.val()
			  });
			  message.val('');
			  }
			  return false;
			});
		},
		destroy: function(){

		},		
		
		addMessage: function(message) {
		  $(".chat-window").append($("<p>").text(message));
		}
	}

});

$(function(){
	scaleApp.startAll();
	scaleApp.emit("init-connection", "chat.meet.js/xmpp");
	scaleApp.emit("xmpp::muc::set-room", "plotkarnia@conference.chat.meet.js");
});