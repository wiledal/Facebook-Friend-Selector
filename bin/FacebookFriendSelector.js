!function() {
	function FacebookFriend(name, id) {
		var that = this;

		this.name = name;
		this.id = id;
		this.selected = false;
		this.onclick = null;

		this.element = document.createElement("li");
		this.element.innerHTML = ""
			+ "<img src='https://graph.facebook.com/"+id+"/picture'>"
			+ "<span>" + name + "</span>"
		+ "";

		this.element.onclick = function() {
			if (!that.selected) {
				that.select(true);
			}else{
				that.select(false);
			}
			
			if (that.onclick) that.onclick(that.name, that.id);
			return false;
		}
	}
	FacebookFriend.prototype.select = function(doSelect) {
		this.element.className = (doSelect ? "selected" : "");
		this.selected = doSelect;
	};
	FacebookFriend.prototype.toggleVisible = function(doVisible) {
		this.element.style.display = (doVisible ? "table" : "none");
	};

	function FacebookFriendSelector() {
		this.friends = [];
		this.friendElements = [];
		this._listElement = document.createElement("ul");
		this._searchField = document.createElement("input");
		this._buttonConfirm = document.createElement("button");
		this._buttonCancel = document.createElement("button");

		this.callback = null;
		this.settings = {
			limit: 0,
			fadeOutSpeed: 300,
			copy: {
				title: "Select friend",
				searchText: "Start typing a name...",
				buttonSelect: "Continue",
				buttonCancel: "Cancel"
			}
		}

		this.element = this.makeElement();

		this.init();
	}
	FacebookFriendSelector.prototype.init = function() {
		document.body.appendChild(this.element);
	};
	FacebookFriendSelector.prototype.getFriends = function(callback) {
		var that = this;

		if (window.FB) {
			if (that.friends.length < 1) {
				FB.api("/me/friends", function(resp) {
					that.friends = resp.data;
					callback(that.friends);
				});
			}else{
				callback(that.friends);
			}
		}else{
			throw("FacebookFriendSelector Error: Facebook API not defined.");
		}
	};
	FacebookFriendSelector.prototype.open = function(callback) {
		var that = this;

		that.callback = callback;
		that.getFriends(function(friends) {
			that.element.style.display = "block";
			if (that.friendElements.length < 1) {
				for (var i = 0; i < friends.length; i++) {
					var f = new FacebookFriend(friends[i].name, friends[i].id);
					that.friendElements.push(f);
					that._listElement.appendChild(f.element);
				}
			}else{
				for (var i=0; i < that.friendElements.length; i++) {
					that.friendElements[i].select(false);
				}
			}
		});
	};
	FacebookFriendSelector.prototype.hide = function() {
		if (window.$) {
			$(this.element).faceOut(this.settings.fadeOutSpeed);
		}else{
			this.element.style.display = "none";
		}
	};
	FacebookFriendSelector.prototype.confirm = function() {
		var confirmed = [];
		for (var i = 0; i < this.friendElements.length; i++) {
			if (this.friendElements[i].selected) {
				confirmed.push({name: this.friendElements[i].name, id: this.friendElements[i].id});
			}
		}
		if (confirmed.length > 0) {
			this.callback(confirmed);
			this.hide();
		}
	};
	FacebookFriendSelector.prototype.cancel = function() {
		this.callback(false);
		this.hide();
	};
	FacebookFriendSelector.prototype.makeElement = function() {
		var that = this;

		// SearchField
		this._searchField.setAttribute("type", "text");
		this._searchField.setAttribute("data-default", this.settings.copy.searchText);
		this._searchField.value = this.settings.copy.searchText;

		this._searchField.onblur = function() {
			if (this.value == "") {
				this.value = this.getAttribute("data-default");
				this.style.color = "#a0a0a0";
			}
		}
		this._searchField.onfocus = function() {
			if (this.value == this.getAttribute("data-default")) {
				this.value = "";
				this.style.color = "#000";
			}
		}
		this._searchField.onkeyup = function() {
			for (var i = 0; i < that.friendElements.length; i++) {
				if (that.friendElements[i].name.toLowerCase().indexOf(this.value.toLowerCase()) == -1) {
					that.friendElements[i].toggleVisible(false);
				}else{
					that.friendElements[i].toggleVisible(true);
				}
			}
		}

		// Buttons
		this._buttonConfirm.className = "facebook-friend-selector-button-confirm";
		this._buttonConfirm.innerHTML = "<span>"+this.settings.copy.buttonSelect+"</span>";
		this._buttonConfirm.onclick = function() {
			that.confirm();
		}

		this._buttonCancel.className = "facebook-friend-selector-button-cancel";
		this._buttonCancel.innerHTML = "<span>"+this.settings.copy.buttonCancel+"</span>";
		this._buttonCancel.onclick = function() {
			that.cancel();
		}


		var element = document.createElement("div");
		element.className = "facebook-friend-selector facebook-friend-selector-main";
		element.innerHTML = ""
			+ "<div class='facebook-friend-selector-bg'></div>"
			+ "<div class='facebook-friend-selector-container'>"
				+ "<div class='facebook-friend-selector-head'>"
					+ "<h2>" + this.settings.copy.title + "</h2>"
					+ "<div class='facebook-friend-selector-search-container'></div>"
				+ "</div>"
				+ "<div class='facebook-friend-selector-footer'>"
				+ "</div>"
			+ "</div>";

		element.children[1].children[0].children[1].appendChild(this._searchField);
		element.children[1].children[1].appendChild(this._buttonConfirm);
		element.children[1].children[1].appendChild(this._buttonCancel);
		element.children[1].insertBefore(this._listElement, element.children[1].children[1]);

		return element;
	};

	window.fbFriendSelector = new FacebookFriendSelector();
}();