/* 
*
*	Xbox Live API app. Paul Brownsmith 2013
*	http://www.webstandardsdesign.co.uk/xbox/index.html
*	
*/

Xbox = {};

Xbox.objects = {};

Xbox.base = new (function() {
		
	this.init = function() {
		
		var _config = {

			// get the username from localStorage	
			username: localStorage.getItem('xbox-username'),

			// get console element
			consoleElem: document.getElementById('xconsole'),

			// get home/username input screen element
			homeElem: document.getElementById('xhome')

		}

		// if there is no username set - run the homeScreen object
		if (!_config.username) {

			// run homescreen object, pass in the consoleElem and homeElem vars as properties
			Xbox.objects.homeScreen = new Xbox.homeScreen(_config.consoleElem, _config.homeElem);
			
		}

		// if there is a username present in localStorage, run the console object
		if (_config.username) {

			// show the console
			Xbox.removeClass(_config.consoleElem, 'hide');

			// hide the home screen
			Xbox.addClass(_config.homeElem, 'hide');

			// run the console - this is only run from here if the user is returning and a username is already stored in the storage
			Xbox.objects.console = new Xbox.console(_config.consoleElem, _config.homeElem);

		}

		Xbox.objects.logOut = new Xbox.logOut(_config.consoleElem, _config.homeElem);

	}

});

Xbox.homeScreen = function(consoleElem, homeElem) {

	// variable for input field
	var inputField = document.getElementById('username');
	
	// variable for enter button
	var enterBtn = document.getElementById('enter');
	
	// capture click event
	enterBtn.addEventListener('click', function(e) {
		
		// if the input field is empty
		if (!inputField.value) {
		
			// error message HTML
			var errorMsg = 	'<div class=\"alert alert-error\">' +
							'<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>' +
							'<div>Please enter a valid Xbox Live username</div>' +
							'</div>';
		
			// ID for the FORM element
			var homeScreen = document.getElementById('homescreen');
		
			// create a DIV
			var _div = document.createElement('div');
			
			// insert the errorMsg into the DIV
			_div.innerHTML = errorMsg;
			
			// append the DIV to the homescreen DIV
			homeScreen.appendChild(_div);
			
			// prevent the button firing
			e.preventDefault();
			
			return;
		}

		// if the INPUT contains a value
		if (inputField.value) {
		
			// set localStorage for username
			localStorage.setItem('xbox-username', inputField.value);

			Xbox.removeClass(consoleElem, 'hide');

			Xbox.addClass(homeElem, 'hide');

			// run the console
			Xbox.objects.console = new Xbox.console(consoleElem, homeElem);

			e.preventDefault();
			
		}
		
	}, false);

}

Xbox.console = function(consoleElem, homeElem) {

	// if we're in the console, hide the home screen
	Xbox.addClass(homeElem, 'hide');

	var _config = {
	
		// variable to change if profile ajax call has been made, so further clicks don't fetch data
		profileAjax: 0,

		// variable to change if game list ajax call has been made, so further clicks don't fetch data
		gamesAjax: 0,

		// variable to change if friends list ajax call has been made, so further clicks don't fetch data
		friendsAjax: 0,

		// Xbox live username
		username: localStorage.getItem('xbox-username'),

		// profile button
		profileBtn: document.getElementById('btn-profile'),
		
		// friends button
		friendsBtn: document.getElementById('btn-friends'),
		
		// games button
		gamesBtn: document.getElementById('btn-games'),
		
		// empty tag for user name to be inserted
		userNameSpan: document.getElementById('insertUserName')
	
	}

	// show username on Profile accordion
	_config.userNameSpan.innerHTML = _config.username;
	
	// fetch the profile data and populate the profile accordion
	_config.profileBtn.addEventListener('click', function() {

		// check to see if the ajax call has already been made this session.
		if (_config.profileAjax == 0) {
	
			// fetch data
			Xbox.objects.ajax = new Xbox.ajax('https://xboxapi.com/profile/' + _config.username, 'data-profile');

			// set _config.profileAjax to 1, prevent further requests
			_config.profileAjax = 1;

		}
	
	}, false);
	
	// fetch the games data and populate the games accordion
	_config.gamesBtn.addEventListener('click', function() {

		// check to see if the ajax call has already been made this session.
		if (_config.gamesAjax == 0) {
			
			// fetch data
			Xbox.objects.ajax = new Xbox.ajax('https://xboxapi.com/games/' + _config.username, 'data-games');

			// set _config.gamesAjax to 1, prevent further requests
			_config.gamesAjax = 1;

		}
			
	}, false);
	
	_config.friendsBtn.addEventListener('click', function() {

		// check to see if the ajax call has already been made this session.
		if (_config.friendsAjax == 0) {
	
			// fetch data
			Xbox.objects.ajax = new Xbox.ajax('https://xboxapi.com/friends/' + _config.username, 'data-friends');

			// set value to 1, prevent further requests
			_config.friendsAjax = 1;

		}
	
	}, false);
	
}

Xbox.ajax = function(xboxData, dataDivId) {

	var dataDiv = dataDivId;
	
	// creat element for the loading spinner
	var loader = document.createElement('div');

	// give the loader elem an ID
	loader.id = 'loader';
	
	// var for the DIV that'll show the data
	var contentDiv = document.getElementById(dataDiv);
	
	console.log('dataDiv requested: ', dataDiv);
	
	// some jQuery for getting the ajax data. TODO: remove jQuery.
	$(function() {

		$.ajax({

			dataType: "json",

			url: xboxData,

			beforeSend: function() {
			
				// if the content requested is for game achievements, remove hide class from dataDiv (#data-game)
				if (dataDiv === 'data-game') {
					
					var _content = document.getElementById(dataDiv);

					Xbox.removeClass(_content, 'hide');
				}

				// add loading spinner elem
				contentDiv.appendChild(loader);
				
				// add loading class
				Xbox.addClass(contentDiv, 'loading');
			
			},

			complete: function(){
			
				// remove loading class
				Xbox.removeClass(contentDiv, 'loading');

				//loader.parentNode.removeChild(loader);
				
			},

			success: function(data) {
				
				// switch depending on the data being displayed
				switch (dataDiv) {

					case 'data-games': 
						
						// create the games list 
						Xbox.objects.dataGameList = new Xbox.dataGameList(data);
									
						break;
					
					case 'data-game':
						
						// create individual game 
						Xbox.objects.dataGame = new Xbox.dataGame(data, dataDiv);
									
						break;
					
					case 'data-profile':
					
						// create profile
						Xbox.objects.dataProfile = new Xbox.dataProfile(data);
					
						break;

					case 'data-friends':
					
						// create friends list
						Xbox.objects.dataFriends = new Xbox.dataFriends(data);
					
						break;

				}
								
			},

			error: function(data) {
			
				// if an error is returned from the API, run the errorHandler
				Xbox.objects.errorHandler = new Xbox.errorHandler(dataDiv);

			}

			
		});
		
	});
	
}

Xbox.dataGameList = function(data) {

	// log the data, for dev purposes
	console.log('Activity data:', data);
	
	// div to display the data	
	var gamesDataDiv = document.getElementById('data-games');

	// empty UL element for the games list
	var gamesUL = document.createElement('ul');

	// append the games list UL
	gamesDataDiv.appendChild(gamesUL);
	
	// loop through the returned games list to create the LI's
	for (var i=0;i<10;i++) {
		
		// create li element
		var _elem = document.createElement('li');

		// add clearfix attribute
		_elem.setAttribute('class', 'clearfix');
		
		// populate the list items
		_elem.innerHTML =

			// box image
			'<img src=\"' + data.Games[i].BoxArt.Small + '\" class=\"box-art\"/>' + 

			// put the game achievement data URL into the data-achievements attribute
			'<h5>' + data.Games[i].Name + '</h5>' + 

			// display achievement progress
			'<p>Acheivements: ' + data.Games[i].Progress.Achievements + '/' + data.Games[i].PossibleAchievements + '</p>' + 

			// more details button
			'<a class=\"btn btn-small btnDetails\" data-achievements=\"' + data.Games[i].AchievementInfo + '\">Details</a>';
					
		// append the LI's to the UL
		gamesUL.appendChild(_elem);

		// get buttons
		var btnDetails = gamesUL.getElementsByTagName('a');

		// Add click event to the LI
		btnDetails[i].addEventListener('click', function() {

			// hide the game list, in order to show the game achievement data
			Xbox.addClass(gamesDataDiv, 'hide');

			// get the achievement URL from the data-achievements attribute
			var achievements = this.getAttribute('data-achievements');

			// request new data object containing achievement data
			Xbox.objects.ajax = new Xbox.ajax(achievements, 'data-game');

		}, false);

	}

}

Xbox.dataGame = function(data, dataDiv) {

	// log the data for dev purposes
	console.log('Game data: ',data);

	var _config = {

		// get dataDiv by ID
		dataDiv: document.getElementById(dataDiv),

		// create private backButton function
		backButton: function() {

			// create and append the back button - can this be in the HTML?
			var backBtn = document.createElement('a');

			// set href to #
			backBtn.href = '#';

			// give backBtn an ID
			backBtn.id = 'backButton';

			// set some styling classes
			backBtn.setAttribute('class', 'btn test');

			// and innerHTML
			backBtn.innerHTML = 'Back to game list';

			// append the back button to the data div
			_config.dataDiv.appendChild(backBtn);

			// click event listener for back button
			backBtn.addEventListener('click', function(e) {

				// variables again for content DIVs - TODO: are these already available?
				var _games = document.getElementById('data-games');
				var _game = document.getElementById('data-game');

				// add and remove classes for the games list and game achievement data
				Xbox.addClass(_game, 'hide');
				Xbox.removeClass(_games, 'hide');

				// remove data from the _game DIV in order for it to be populated by another games data
				_game.innerHTML = '';

				// prevent the link firing
				e.preventDefault();

			}, false);

		}

	}

	// some apps, such as YouTube or NetFlix don't have achievements:
	if (data.Achievements === null) {

		// message to be displayed if there are no achievements
		_config.dataDiv.innerHTML = '<p>' + data.Game.Name + ' doesn\'t have any achievements</p>';

		// append a back button
		_config.backButton();

	}

	// if there are achievements
	if (data.Achievements != null) {

		// add game name in H3 element
		_config.dataDiv.innerHTML = '<h3>' + data.Game.Name + ' achievements</h3>';

		// create UL
		var achUL = document.createElement('ul');

		// append UL to data DIV
		_config.dataDiv.appendChild(achUL);

		// loop through the achievements available for game
		for (var i=0;i<data.Achievements.length;i++) {

			// if the achievement has been earned, draw it in an LI
			if (data.Achievements[i].EarnedOn != false) {

				// create LI
				var _elem = document.createElement('li');

				// append the acheivement description
				_elem.innerHTML = '<p>' + data.Achievements[i].Description + '</p>';

				// append the LI to the UL
				achUL.appendChild(_elem);

			}

		}

		// append a back button
		_config.backButton();

	}

}

Xbox.dataProfile = function(data) {

	console.log('Profile data: ', data);
	
	// get the profile data DIV
	var profileDataDiv = document.getElementById('data-profile');
		
	profileDataDiv.innerHTML = 	'<img src=\"' + data.Player.Avatar.Body + '\"/>' +

								'<div class=\"profileInfo\">' +

								'<h5>' + data.Player.Status.Online_Status + '</h5>' +

								//'<p>' + + '</p>' +

								'</div>';

	
}

Xbox.dataFriends = function(data) {

	// log the friends data for dev purposes
	console.log('DATA',data);

	// get the friends data div
	var friendsDataDiv = document.getElementById('data-friends');

	// empty UL element for the games list
	var friendsUL = document.createElement('ul');

	friendsUL.setAttribute('class', 'friendsList');

	// append the games list UL
	friendsDataDiv.appendChild(friendsUL);
	
	// loop through the returned games list to create the LI's
	for (var i=0;i<data.Friends.length;i++) {
	
		// create li element
		var _elem = document.createElement('li');

		// add clearfix class
		_elem.setAttribute('class', 'clearfix');

		// list item inner html
		var elemContent = 	'<img src=\"' + data.Friends[i].GamerTileUrl + '\"/>' +
							'<h5>' + data.Friends[i].GamerTag + '</h5>' + 
							'<p>' + data.Friends[i].Presence + '</p>'

		// if friends are not online, display elemContent
		if (data.Friends[i].IsOnline = 'false') {

			_elem.innerHTML = elemContent;

		}

		// if friends ARE online, display elemContent and the 'online now' element
		if (data.Friends[i].IsOnline != 'false') {

			_elem.innerHTML = elemContent + '<p class=\"online-now\">Online</p>';

		}

		// append inner HTML to LI element
		friendsUL.appendChild(_elem);

	}

}

Xbox.logOut = function(consoleElem, homeElem) {

	// get logout button
	var logOutBtn = document.getElementById('logout');

	// click event for logout button
	logOutBtn.addEventListener('click', function() {

		// clear local storage. TODO: remove xbox-username, not entire local storage
		localStorage.clear('xbox-username');

		// clear everything and reset
		window.location.reload();

	}, false);

}

Xbox.errorHandler = function(dataDiv) {

	// error message HTML
	var errorMsg = 	'<div class=\"alert alert-error\">' +
					'<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>' +
					'<div>GAME OVER<br>There was a problem...</div>' +
					'</div>';
		
	// get the data DIV
	var _dataDiv = document.getElementById(dataDiv);

	// insert the error message HTML into the data DIV
	_dataDiv.innerHTML = errorMsg;

}

// if class is present
Xbox.hasClass = function(ele,cls) {

	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	
}

// add class, pass in element and class value to add
Xbox.addClass = function(ele,cls) {

	if (!Xbox.hasClass(ele,cls)) ele.className += " "+cls;
	
}

// remove class, pass in element and class value to remove
Xbox.removeClass = function(ele,cls) {

	if (Xbox.hasClass(ele,cls)) {
	
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		
		ele.className=ele.className.replace(reg,' ');
		
	}
	
}

xbox = new Xbox.base.init();



















