!function ($) {
  $(function(){
    // fix nav on scroll
    //var $win = $(window)
    //  , $nav = $('.subnav')
    //  , navTop = $('.subnav').length && $('.subnav').offset().top - 40
    //  , isFixed = 0

    //processScroll()

    //// hack sad times - holdover until rewrite for 2.1
    //$nav.on('click', function () {
    //  if (!isFixed) setTimeout(function () {  $win.scrollTop($win.scrollTop() - 47) }, 10)
    //})

    //$win.on('scroll', processScroll)

    //function processScroll() {
    //  var i, scrollTop = $win.scrollTop()
    //  if (scrollTop >= navTop && !isFixed) {
    //    isFixed = 1
    //    $nav.addClass('subnav-fixed')
    //  } else if (scrollTop <= navTop && isFixed) {
    //    isFixed = 0
    //    $nav.removeClass('subnav-fixed')
    //  }
    //}

    //Get your own key to avoid bumping up against the rate limits!
    my_api_key = 'IETVGRWWN5DORHYAUB';
  
    //update login / logout menu content
    Eventbrite.prototype.utils.logout = function(my_api_key){
      Eventbrite.prototype.data.deleteAccessToken();
      //update the user name
      $('.account_name').html('My Account');
  
      //show the login button
      $('.account_status_toggle').html('Login').attr('href', Eventbrite.prototype.utils.oauthLink(my_api_key)).attr('onclick','');
    };
    
    Eventbrite.prototype.widget.login({'app_key': my_api_key, 'renderer': 'disabled'}, function( strings ){
      if( strings['user_email'] !== undefined){
        if( strings['user_name'] !== undefined && !strings['user_name'].match(/undefined/)) {
          //update user name
          $('.account_name').html(strings['user_name'] + "<b class='caret'>");
        }else{
          $('.account_name').html(strings['user_email']+ "<b class='caret'>");
        }
        //update "login" button label / action
        $('.account_status_toggle').html('Logout').attr('href', '#').attr('onclick', "Eventbrite.prototype.utils.logout('"+my_api_key+"');return false;");
      }else{
        $('.account_status_toggle').attr('href', Eventbrite.prototype.utils.oauthLink(my_api_key)).attr('onclick','');
      }
    });
    
    // if on the discussion page, load the content
    //if(window.location.pathname == '/discussion/'){
    //  window.stackunderflow.googleQuestions("eventbrite").render("#discussion_content");
    //  $('#discussion_loading').hide();
    //}

  })
}(window.jQuery)
