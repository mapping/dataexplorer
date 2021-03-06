window.app = {
    config: {
      gatekeeper_url: 'http://transformer-gatekeeper.herokuapp.com',
      oauth_client_id: '2bab62e2f6b27c3ebe1f'
    },
    models: {},
    views: {},
    routers: {},
    utils: {},
    templates: _($('script[name]')).reduce(function(memo, el) {
      memo[el.getAttribute('name')] = _(el.innerHTML).template();
      return memo;
    }, {}),
    state: {'repo': ''},
    instance: null
};

window.args = _(window.app).toArray();

(function(config, models, views, routers, utils, templates) {
  $(function() {

    // check for special case where this window is being used for doing the login
    var match = window.location.href.match(/\?code=([a-z0-9]*)/);
    if (match) {
      handleGithubLogin(match);
      return;
    }

    // ... we are not doing a login!
    // Check whether we are logged in and boot the app

    // Start the engines
    window.app.instance = new views.Application({ el: '.transformer-app', model: {} }).render();

    // listen for login success in login window
    window.addEventListener("message", function(evt) {
        $.cookie('oauth-token', evt.data);
        window.app.instance.finishLogin();
      }
      , false
    );

    // Start responding to routes
    Backbone.history.start();
  });

  var handleGithubLogin = function(match) {
    var html = ' \
      <div class="view login"> \
        <div class="splash"> \
          <div class="authorize"> \
            <h1>Completing Login</h1> \
            <p>We are completing your login!</p> \
          </div> \
        </div> \
      </div> \
    ';
    $('.navbar').hide();
    $('#main').html(html);
    // complete the login process
    $.getJSON(window.app.config.gatekeeper_url + '/authenticate/'+match[1], function(data) {
      window.opener.postMessage(data.token, window.location)
      window.close();
    });
  }

}).apply(this, window.args);
