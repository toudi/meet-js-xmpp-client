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
			    $("#roster").children("li").remove();
			    $("#login-form,#chat-ui").toggle();
			});
			sb.subscribe("client::add-roster-item", function(roster_item) {
			  var ri = $("#roster-item").clone();
			  ri.find("a").attr("data-jid", roster_item.getBareJID()).text(roster_item.getBareJID());
			  $("#roster").append(ri);
			});
			sb.subscribe("client::roster-presence-changed", function(status_change) {
			  presence = status_change.type || status_change.presence || 'available';
			  if (presence in presence_colors) {
			    var ri = $("#roster").find("a[data-jid='"+status_change.jid.getBareJID()+"']");
			    ri.siblings('svg').children('circle').attr('fill', presence_colors[presence]);
			  }
			});
			sb.subscribe("client::message", function(message) {
			  console.info(message);
			  try {
			  console.info(message.from.split('@')[0]);
			  sb.instance.addMessageToWindow(message.from.split('@')[0], message);
			  } catch (e) { console.info(e); }
			});
			sb.subscribe("client::send-message", function(message) {
			  sb.instance.addMessageToWindow(message.to.split('@')[0], message);
			});
			
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
			
			$(document).on("submit", ".chat-form", function(e){
			  var message = $(this).children('input[name="message"]');
			  if (message.val() != '') {
			  sb.emit("client::send-message", {
			    to: $(this).children('input[name="to"]').val(),
			    message: message.val()
			  });
			  message.val('');
			  }
			  return false;
			});
			
			$(document).on("click", "#chat-windows ul li a", function(e) {
			  e.preventDefault();
			  $(this).tab('show');
			});
 			$(document).on("click", ".roster-item", function(e){
			  e.preventDefault();
			  var jid = new JSJaCJID($(this).text());
// 			  
			  if (!(jid.getNode() in sb.chat_windows)) {
			    $("#chat-windows").children("ul").append(
			      $("<li>").append(
				$("<a>").attr({
				  "href": "#tab-"+jid.getNode(),
			          "data-toggle": "tab",
				  "data-jid": jid.getNode()
				}).text(jid.getNode())
			      )
			    );
			    var chat_window = $("#chat-window-template").clone();
			    chat_window.attr("id", "tab-"+jid.getNode());
			    chat_window.children("input[name='to']").val(jid.getBareJID());
			    $("#chat-windows").children(".tab-content").append(
			      chat_window
			    );
			    sb.chat_windows[jid.getNode()] = $("a[data-jid='"+jid.getNode()+"']");
			  }
			  console.info(sb);
			  sb.chat_windows[jid.getNode()].tab('show');
			  
			  return false;
			});
		},
		destroy: function(){

		},
		
		addMessageToWindow: function(_window, message) {
		  _window = $("#tab-"+_window).children('.chat-window');
		  body = message.message;
		  if (message.to) {
		    body = '> ' + body;
		  }
		  else {
		    body = '< ' + body;
		  }
		  
		  _window.append($('<p>').text(body));
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