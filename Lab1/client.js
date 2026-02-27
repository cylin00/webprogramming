displayView = function(){
// the code required to display a view
    var token = localStorage.getItem("token");
    var contentDiv = document.getElementById("content-container");

    if (token != null) {
        // logged in
        contentDiv.innerHTML = document.getElementById("profileview").innerHTML;

        loadHomeData();
        loadHomeWall();
    } else {
        // not logged in
        contentDiv.innerHTML = document.getElementById("welcomeview").innerHTML;
    }
};

window.onload = function(){
//code that is executed as the page is loaded.
//You shall put your own custom code here.
//window.alert() is not allowed to be used in your implementation.
// window.alert("Hello TDDD97!");

    // initialize
    displayView();
};

function validateLogin(form) {
    var email = form.email.value;
    var password = form.password.value;
    var errorDiv = document.getElementById("loginError");
    errorDiv.innerText = ""; // build an empty error message
    
    // check format
    if (!form.checkValidity()) {
        errorDiv.innerText = "Please fill in all fields correctly.";
        return false; 
    }

    // console.log("Login form is valid! Sending to server...");

    // start to call serverstub
    var result = serverstub.signIn(email, password);
    if (result.success) {
        var token = result.data;
        
        // store token to local storage
        localStorage.setItem("token", token);
        
        // switch to profile view
        displayView();
    } 
    else {
        // shwo error message from server
        errorDiv.innerText = result.message; 
    }

    return false; 
}

function validateSignup(form) {
    var errorDiv = document.getElementById("signupError");
    errorDiv.innerText = "";

    // check format
    if (!form.checkValidity()) {
        errorDiv.innerText = "Please fill in all fields correctly.";
        return false;
    }

    // check password match
    var pass = document.getElementById("signup_pswd").value;
    var repeat = document.getElementById("repeat_pswd").value;

    if (pass !== repeat) {
        errorDiv.innerText = "Passwords do not match!";
        return false;
    }

    console.log("Signup form is valid! Sending to server...");

    // start to call serverstub
    var userData = {
        "email": form.email.value,
        "password": form.pswd.value,
        "firstname": form.firstname.value,
        "familyname": form.familyname.value,
        "gender": form.gender.value,
        "city": form.city.value,
        "country": form.country.value
    };

    var result = serverstub.signUp(userData);
    if (result.success) {
        // switch to login view
        validateLogin(form);
    } 
    else {
        // show error message from server
        errorDiv.innerText = result.message; 
    }
    return false;
}

// switch tab
function openTab(evt, tabId) {
    // hide all tab contents
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    // remove active class from all tab links
    var tabLinks = document.getElementsByClassName("tab-link");
    for (var i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    // display the selected tab content
    document.getElementById(tabId).style.display = "block";

    // add active class to the clicked tab link
    evt.currentTarget.className += " active";
}

function validateChangePassword(form) {
    var errorDiv = document.getElementById("changePasswordError");
    errorDiv.innerText = "";
    errorDiv.style.color = "red"; //default

    var oldPswd = form.oldPassword.value;
    var newPswd = form.newPassword.value;
    var repeatNew = form.repeatNewPassword.value;

    var token = localStorage.getItem("token"); // get current token

    // validate format
    if (newPswd !== repeatNew) {
        errorDiv.innerText = "New passwords do not match.";
        return false;
    }

    // call serverstub to change password
    var result = serverstub.changePassword(token, oldPswd, newPswd);

    if (result.success) {
        errorDiv.style.color = "green";
        errorDiv.innerText = result.message;
        form.reset(); // reset form after successful password change
    } else {
        errorDiv.style.color = "red";
        errorDiv.innerText = result.message;
    }

    return false; 
}

function signOutUser() {
    var token = localStorage.getItem("token");

    serverstub.signOut(token);

    // remove token and swtich display to welcome view
    localStorage.removeItem("token");
    displayView();
}

function loadHomeData() {
    var token = localStorage.getItem("token");
    var result = serverstub.getUserDataByToken(token);

    if (result.success) {
        var user = result.data;
        document.getElementById("info-email").innerText = user.email;
        document.getElementById("info-firstname").innerText = user.firstname;
        document.getElementById("info-familyname").innerText = user.familyname;
        document.getElementById("info-gender").innerText = user.gender;
        document.getElementById("info-city").innerText = user.city;
        document.getElementById("info-country").innerText = user.country;
    }
}

function loadHomeWall() {
    var token = localStorage.getItem("token");
    // return user's messages 
    var result = serverstub.getUserMessagesByToken(token);
    var wallDiv = document.getElementById("wall-messages");
    wallDiv.innerHTML = ""; // clear wall before loading messages

    if (result.success) {
        var messages = result.data;
        for (var i = 0; i < messages.length; i++) {
            var msgObj = messages[i];
            // display each message in format: "writer: content"
            wallDiv.innerHTML += "<div class='message-item'><b>" + msgObj.writer + ":</b> " + msgObj.content + "</div>";
        }
    }
}

function postToHomeWall() {
    var token = localStorage.getItem("token");
    var content = document.getElementById("post-textarea").value;

    // check client side if content is empty
    if (content.trim() === "") {
        return; 
    }

    var result = serverstub.postMessage(token, content, null); // post to own wall, so receiver is null

    if (result.success) {
        document.getElementById("post-textarea").value = ""; // clear textarea after successful post
        loadHomeWall(); 
    }
}

var CurrentBrowsingEmail = "";

function searchUser() {
    var email = document.getElementById("browse-search-email").value;
    var errorDiv = document.getElementById("browse-search-error");
    var token = localStorage.getItem("token");
    
    errorDiv.innerText = "";
    
    // get target user data by email
    var result = serverstub.getUserDataByEmail(token, email);

    if (result.success) {
        CurrentBrowsingEmail = email; // record current browsing email for later use 
        document.getElementById("browse-result-area").style.display = "block";
        
        // load target user data to display
        var user = result.data;
        document.getElementById("browse-info-email").innerText = user.email;
        document.getElementById("browse-info-firstname").innerText = user.firstname;
        document.getElementById("browse-info-familyname").innerText = user.familyname;
        document.getElementById("browse-info-gender").innerText = user.gender;
        document.getElementById("browse-info-city").innerText = user.city;
        document.getElementById("browse-info-country").innerText = user.country;

        // load target user's wall messages
        reloadBrowseWall();
    } else {
        document.getElementById("browse-result-area").style.display = "none";
        errorDiv.innerText = result.message; 
    }
}

// load messages of current browsing user
function reloadBrowseWall() {
    var token = localStorage.getItem("token");
    var result = serverstub.getUserMessagesByEmail(token, CurrentBrowsingEmail);
    var wallDiv = document.getElementById("browse-wall-messages");
    wallDiv.innerHTML = "";

    if (result.success) {
        var messages = result.data;
        for (var i = 0; i < messages.length; i++) {
            wallDiv.innerHTML += "<div class='message-item'><b>" + messages[i].writer + ":</b> " + messages[i].content + "</div>";
        }
    }
}

// post message to current browsing user's wall
function postToBrowseWall() {
    var token = localStorage.getItem("token");
    var content = document.getElementById("browse-post-textarea").value;

    if (content.trim() === "") return;

    var result = serverstub.postMessage(token, content, CurrentBrowsingEmail);

    if (result.success) {
        document.getElementById("browse-post-textarea").value = "";
        reloadBrowseWall();
    }
}