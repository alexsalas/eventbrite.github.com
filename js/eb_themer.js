var eb_themer = {
  'access_token': '',
  'init': function( example_eid ){
    eb_themer.example_eid = example_eid;
    eb_themer.detect_login_state();

    if(eb_themer.access_token !== ''){
      document.getElementById( 'themer_welcome' ).setAttribute("style", "display:none;");
      document.getElementById( 'themer_controls' ).setAttribute("style", "display:block;");
      eb_themer.extend_client_lib();
      eb_themer.load_event_list('eb_my_events');
      eb_themer.get_event_theme( example_eid );
    }
  },
  'events_cache': [],
  'detect_login_state': function(){
    if( window.location.hash.slice( window.location.hash.indexOf("access_token=") + 13 ).indexOf("&") !== -1){
      //partial fragment slice
      eb_themer.access_token = window.location.hash.slice( 
        window.location.hash.indexOf("access_token=") + 13,
        window.location.hash.indexOf("access_token=") + 13 + window.location.hash.slice( window.location.hash.indexOf("access_token=") + 13 ).indexOf("&") 
      );
    }else{
      eb_themer.access_token = window.location.hash.slice( window.location.hash.indexOf("access_token=") + 13 );
    }
  },
  'load_event_list': function( display_at ){
    Eventbrite({'access_token': eb_themer.access_token }, function(eb){
      var options = {
        'event_statuses': "live,started",
        'asc_or_desc': "desc",
        'do_not_display':"description,logo,style,organizer,tickets"
      };
      eb.user_list_events( options, function( response ){
        document.getElementById( display_at ).innerHTML += eb.utils.eventList( response, eb.utils.eventListRow );
        eb_themer.detect_empty_event_list( display_at );
      });
      var options = {
        'event_statuses': "draft",
        'asc_or_desc': "desc",
        'do_not_display':"description,logo,style,organizer,tickets"
      };
      eb.user_list_events( options, function( response ){
        document.getElementById( display_at ).innerHTML += eb.utils.eventList( response, eb.utils.eventListRow );
        eb_themer.detect_empty_event_list( display_at );
      });
    });
  },
  'detect_empty_event_list': function( list_selector ){
    var event_list = document.getElementById(list_selector);
    if( event_list.innerHTML == "\n        	\n\n          	<div class=\"eb_event_list\">\n</div><div class=\"eb_event_list\">\n</div>" ) {
      event_list.innerHTML = "<br/><p>You do not have any existing 'Live' or 'Draft' events that are ready to be themed.</p><br/><p><a href='#' onclick='eb_themer.clone_event();' class='button_medium_green' >Create an event</a></p>";
    }
  },
  'get_event_theme': function( from_eid ){
    if( from_eid == undefined ){ from_eid = eb_themer.example_eid; }

    //if we have already fetched this eid, return our cached copy.
    console.log("looking up event: " + from_eid );
    if(eb_themer.events_cache[from_eid] !== undefined ){
      return eb_themer.events_cache[from_eid];
    }else{
      //find, cache, and return
      Eventbrite({'access_token': eb_themer.access_token }, function(eb){
        var options = {
          'display': 'custom_header,custom_footer',
          'id'     : from_eid
        };
        eb.event_get( options, function( response ){
          if( response.event !== undefined ){
            eb_themer.events_cache[from_eid] = response.event;
            return response.event;
          }else{
            console.log("Failed to find event: " + from_eid);
          }
        });
      });
    }
  },
  'apply_theme': function( to_eid, from_eid ){
    var example_event = eb_themer.get_event_theme( from_eid );
    var eb_theme_basics = {
      "background_color": example_event.background_color,
      "text_color": example_event.text_color,
      "title_text_color": example_event.title_text_color,
      "link_color": example_event.link_color,
      "box_header_text_color": example_event.box_header_text_color,
      "box_background_color": example_event.box_background_color,
      "box_border_color": example_event.box_border_color,
      "box_text_color": example_event.box_text_color,
      "box_header_background_color": example_event.box_header_background_color,
      'event_id': to_eid
    };
    var eb_header = {
      "event_id": to_eid,
      "custom_header": example_event.custom_header
    }; 
    var eb_footer= {
      "event_id": to_eid,
      "custom_footer": example_event.custom_footer
    }; 
    var eb_updated = 0;
    var pending_updates = 5;
    Eventbrite({'access_token': eb_themer.access_token }, function(eb){
      // add a spinner here?...
      eb.event_update( eb_header, function( response ){
        console.log(response);
        eb_updated = eb_updated +1;
        if(response.process !== undefined && response.process.id !== undefined && eb_updated == pending_updates){
          console.log("redirect to eid: " + response.process.id);
          window.location = eb.utils.edit_link( response.process.id );
          console.log( eb.utils.edit_link( response.process.id ) );
        }else if(response.error !== undefined){
          console.log("Error updating the event: "); console.log(response.error);
        }
      });
      eb.event_update( eb_footer, function( response ){
        console.log(response);
        eb_updated = eb_updated +1;
        if(response.process !== undefined && response.process.id !== undefined && eb_updated == pending_updates){
          console.log("redirect to eid: " + response.process.id);
          window.location = eb.utils.edit_link( response.process.id );
          console.log( eb.utils.edit_link( response.process.id ) );
        }else if(response.error !== undefined){
          console.log("Error updating the event: "); console.log(response.error);
        }
      });
      eb.event_update( eb_theme_basics, function( response ){
        console.log(response);
        eb_updated = eb_updated +1;
        if(response.process !== undefined && response.process.id !== undefined && eb_updated == pending_updates){
          console.log("redirect to eid: " + response.process.id);
          window.location = eb.utils.edit_link( response.process.id );
          console.log( eb.utils.edit_link( response.process.id ) );
        }else if(response.error !== undefined){
          console.log("Error updating the event: "); console.log(response.error);
        }
      });
      eb.event_update( eb_header, function( response ){
        console.log(response);
        eb_updated = eb_updated +1;
        if(response.process !== undefined && response.process.id !== undefined && eb_updated == pending_updates){
          console.log("redirect to eid: " + response.process.id);
          window.location = eb.utils.edit_link( response.process.id );
          console.log( eb.utils.edit_link( response.process.id ) );
        }else if(response.error !== undefined){
          console.log("Error updating the event: "); console.log(response.error);
        }
      });
      eb.event_update( eb_footer, function( response ){
        console.log(response);
        eb_updated = eb_updated +1;
        if(response.process !== undefined && response.process.id !== undefined && eb_updated == pending_updates){
          console.log("redirect to eid: " + response.process.id);
          window.location = eb.utils.edit_link( response.process.id );
          console.log( eb.utils.edit_link( response.process.id ) );
        }else if(response.error !== undefined){
          console.log("Error updating the event: "); console.log(response.error);
        }
      });
    });  
  },
  'clone_event': function( example_event_id ){
    var example_event = eb_themer.get_event_theme( example_event_id );
    console.log("creating event based on " + example_event.title  + " (" + example_event.id +")");
    Eventbrite({'access_token': eb_themer.access_token }, function(eb){
      var new_event = {
        'title': example_event.title,
        'start_date': example_event.start_date,
        'end_date': example_event.end_date,
        'description': example_event.description,
        'privacy': 1
      };
      eb.event_new( new_event, function( response ){
        console.log(response);
        if(response.process !== undefined && response.process.id !== undefined){
          eb_themer.apply_theme( response.process.id, example_event.id);
          var new_ticket = {'event_id': response.process.id, 'name': example_event.tickets[0].ticket.name, 'price': '0.00', 'quantity': 100};
          eb.ticket_new( new_ticket, function( response ){ console.log(response); });
        }
      });
    });
  },
  'extend_client_lib': function(){
    Eventbrite.prototype.utils.edit_link = function(id){
      return "http://www.eventbrite.com/edit?eid=" + id + "#preview_and_publish";
    };
    Eventbrite.prototype.utils.eventListRow = function(evnt){
      var not_iso_8601 = /\d\d-\d\d-\d\d \d\d:\d\d:\d\d/;
      var date_string = not_iso_8601.test( evnt['start_date'] ) ? evnt['start_date'].replace(' ', 'T') : evnt['start_date'];
      var start_date = new Date( Date.parse( date_string ));
      var venue_name = 'Online'; //default location name
      var time_string = Eventbrite.prototype.utils.formatTime( start_date );
      var date_string = start_date.toDateString();
      var draft = '';
      if(evnt.repeats == 'yes'){
        date_string = 'Repeats';
      }
      var html = '';
      if(start_date < new Date()){
        return html;
      }
      if( evnt['venue'] !== undefined && evnt['venue']['name'] !== undefined && evnt['venue']['name'] !== ''){ 
        venue_name = evnt['venue']['name'];
      }
      if( evnt['status'] == 'Draft' ){
        draft = ' (draft)';
        evnt['url'] = Eventbrite.prototype.utils.edit_link( evnt['id'] );
      }
      html = "<div class='event_info'>" + 
           "<h4 class='eb_event_list_title'><a href='" + evnt['url'] + "'>" + evnt['title'] + draft + "</a></h4><table><tbody class='when_where'>" +
           "<tr><th>When:</th><td><span class='eb_event_list_date'>" + date_string + "</span> <span class='eb_event_list_time'>" + time_string + "</span></td>" +
           "<td rowspan=2 class='apply-button'><a href='#' class='button_medium_grey' onclick='eb_themer.apply_theme(" + evnt['id'] + ")'>Apply Theme</a></td></tr>" +
           "<tr><th>Where:</th><td>" + venue_name + "</span></td></tr></tbody></table></div>";
      return html;
    };
  }
};
