var eb_themer = {
  'pending_updates': 3,
  'completed_updates': 0,
  'max_update_attempts': 10,
  'access_token': '',
  'init': function( example_eid ){
    eb_themer.example_eid = example_eid;
    eb_themer.detect_login_state( function( access_token ){ 
      eb_themer.access_token = access_token;
      if(access_token !== ''){
        document.getElementById( 'themer_welcome' ).style.display = 'none';
        document.getElementById( 'themer_controls' ).style.display = 'block';
        eb_themer.extend_client_lib();
        eb_themer.load_event_list('eb_my_events');
        eb_themer.get_event_theme( example_eid );
      }
    });
  },
  'event_cache': undefined,
  'detect_login_state': function(cb){
    var access_token = '';
    if( window.location.hash.slice( window.location.hash.indexOf("access_token=") + 13 ).indexOf("&") !== -1){
      //partial fragment slice
      access_token = window.location.hash.slice( 
        window.location.hash.indexOf("access_token=") + 13,
        window.location.hash.indexOf("access_token=") + 13 + window.location.hash.slice( window.location.hash.indexOf("access_token=") + 13 ).indexOf("&") 
      );
    }else{
      access_token = window.location.hash.slice( window.location.hash.indexOf("access_token=") + 13 );
    }
    cb( access_token );
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
    var event_list_content = event_list.innerHTML;
    if( event_list_content.replace(/^\s+|\s+$|\n/g, '') == "<div class=\"eb_event_list\"></div><div class=\"eb_event_list\"></div>" ) {
      event_list.innerHTML = "<br/><p>You do not have any existing 'Live' or 'Draft' events that are ready to be themed.</p><br/><p><a href='#' onclick='eb_themer.clone_event();' class='button_medium_green' >Create an event</a></p>";
    }
  },
  'get_event_theme': function( from_eid ){
    if( from_eid == undefined ){ from_eid = eb_themer.example_eid; }

    //if we have already fetched this eid, return our cached copy.
    console.log("looking up event: " + from_eid );
    if(eb_themer.event_cache !== undefined ){
      return eb_themer.event_cache;
    }else{
      //find, cache, and return
      Eventbrite({'access_token': eb_themer.access_token }, function(eb){
        var options = {
          'display': 'custom_header,custom_footer',
          'id'     : from_eid
        };
        eb.event_get( options, function( response ){
          if( response.event !== undefined ){
            eb_themer.event_cache = response.event;
            return response.event;
          }else{
            console.log("Failed to find event: " + from_eid);
          }
        });
      });
    }
  },
  'apply_theme': function( to_eid, from_eid ){
    document.getElementById('update_in_progress' ).style.display = 'block';
    document.getElementById('process_complete' ).style.display = 'none';
    $('#next_steps').dialog({'autoOpen': true,
      'height': 250,
      'width': 400,
      'modal': true,
      'closeOnEscape': false
    });
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
    eb_themer.completed_updates = 0;
    
    // Check our UI, cleanup and reset from the previous run:
    document.getElementById('progress_step_' + eb_themer.pending_updates ).style.display = 'none';
    document.getElementById('progress_step_0' ).style.display = 'block';
    Eventbrite({'access_token': eb_themer.access_token }, function(eb){
      eb.event_update( eb_header, function(response){ eb_themer.check_theme_update( response, eb, eb_header, 1); });
      eb.event_update( eb_footer, function(response){ eb_themer.check_theme_update( response, eb, eb_footer, 1); });
      eb.event_update( eb_theme_basics, function(response){ eb_themer.check_theme_update( response, eb, eb_theme_basics, 1); });
      document.getElementById('proceed_to_event_page').href = eb.utils.edit_link( to_eid );
    });  
  },
  'check_theme_update': function( response, eb, update_details, iteration ){
    if(response.error !== undefined){
      console.log("Error updating the event: "); console.log(response.error);
    }else{
      console.log(response);
    }
    if( eb_themer.completed_updates < eb_themer.pending_updates)
    {
      eb_themer.completed_updates = eb_themer.completed_updates + 1;
      //show the current progress step:
      document.getElementById('progress_step_' + eb_themer.completed_updates ).style.display = 'block';
      //hide the previous progress step:
      document.getElementById('progress_step_' + (eb_themer.completed_updates - 1) ).style.display = 'none';
    }
    if( eb_themer.completed_updates >= eb_themer.pending_updates ){
      if( iteration <= eb_themer.max_update_attempts)
      {
        var example_event = eb_themer.get_event_theme();
        eb.event_get({'id': update_details.event_id, 'display': 'custom_header,custom_footer' }, function(response){
          if( response.event.custom_footer == example_event.custom_footer
           && response.event.custom_header == example_event.custom_header){
            eb_themer.show_next_steps();
          }else{
            var event_update_details = {'event_id': update_details.event_id };
            if( response.event.custom_footer !== example_event.custom_footer ){
              //Try updating the footer again...
              event_update_details.custom_footer = example_event.custom_footer;
            }else if( response.event.custom_header !== example_event.custom_header ){
              //Try updating the header again...
              event_update_details.custom_header = example_event.custom_header;
            }
            eb.event_update(event_update_details, eb_themer.check_theme_update( response, eb, event_update_details, iteration + 1));
        
          }
        });
      }else{
        console.log("Retry limit hit! Proceeding to next-steps without a verified theme change... "); console.log(response);
        eb_themer.show_next_steps();
      }
    }
  },
  'show_next_steps': function(){
    //print the final next_step info:
    document.getElementById('update_in_progress' ).style.display = 'none';
    document.getElementById('process_complete' ).style.display = 'block';
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
