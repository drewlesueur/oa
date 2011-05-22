class SignInView extends Backbone.View
  questions: [
    "What is your fav color?"
    "What is your dogs maiden name?"
    "How many pet hampsters do you have?"
  ]
  signUpText: "Just type in an email and choose a question and answer"
  signInText: "Type in your email and choose your question and answer"
  divId: "sign-in-view"
  createEl: () =>
    questions = for question in @questions
      val = question.replace /[^\w]/g, "_"
      "<option value=\"#{val}\">#{question}</option>"
    $ """
      <div id="#{@divId}">
        <div class="top-bar">
          <div class="sign-in-wrapper">
            <a href="#" class="sign-in">Sign In</a> 
          </div>
          <div class="signed-in">
            <span class="signed-in-as-text>Signed in as</span>
            <span class="signed-in-as"></span>
            <a href="#" class="sign-out">Sign Out</a>
          </div>
        </div>
        <div class="login-area">
          <div class="login" style="display:none;" class="login-pop-up">
            <div class="notes">#{@signInText}</div> 
            <form>
              <input type="text" class="email" placeholder="email">
              <br />
              <select class="question">
                #{questions}
              </select>
              <br/>
              <input type="text" class="password" placeholder="ansswer"/>
              <br />
              <input type="submit" value="Sign In"/>
              <a href="#" class="cancel-sign-in">Cancel</a>
            </form>
          </div>
        </div>
      </div>
    """
    
  
  constructor: (mainView) ->
    super
    @el = @createEl() 
    @el.find('cancel-sign-in').click (e) =>
      e.preventDefault()
      @triggerCancelClick()
    @SignInDiv = @el.find '.login'
    @SignInDiv.find('form').submit (e) =>
      e.preventDefault()
      @submit()
    @mainView = mainView || @
    @visible = false
    @el.find(".sign-in").click (e) =>
      e.preventDefault()
      @triggerSignInClick() 
  triggerCancelClick: (done=->) =>
    @hidePopUp done  
  hidePopUp: (done=->) =>
    @SignInDiv.hide =>
      @visible = false
      done()
  showPopUp: (d=->) =>
    @SignInDiv.show =>
      @visible = true
      d()
  showSignedInAs: () => 
    
  submit: (d=->) =>
    @mainView.trigger "signin",
      email: $("##{@divId} .email").val()
      question: $("##{@divId} .question").val()
      password: $("##{@divId} .password").val()
      , d
    
  triggerSignInClick: (done=->) =>
    
    if @SignInDiv.is ":visible"
      @hidePopUp done
    else
      @showPopUp done

      
