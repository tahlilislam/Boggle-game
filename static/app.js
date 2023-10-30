class BoggleGame {
  constructor(secs = 60) {
    this.score = 0;
    this.BOGGLE_GAME = $("#boggleBoard");
    this.board = $("#boggle-container");
    this.userGuess = $("#user-guess");
    this.words = new Set();
    this.lastClick = {
      i: -1,
      j: -1,
    };

    this.handleSubmit = this.handleSubmit.bind(this);

    $(".box").on("click", this.handleBoxClick.bind(this));

    // Event listener for form submission
    $("#word-form").on("submit", this.handleSubmit);
  }

  // show CORRECT word in DOM from list of words
  showWord(word) {
    $(".words", this.BOGGLE_GAME).append($("<li>").text(word).addClass("box"));
  }

  validateClick(i, j) {
    // once we verify its valid
    // set this.lastClick =  {i, j}

    // get me the i and j of the box that was clicked

    // if the last click i and j are -1, continue
    // set the last click i and j to the values we gathered for the current click

    // if they aren't -1, then we need to validate this current click is within the box of i and j +/- 1
    // if the last click i or j is 0, then just +1
    // if the last click i or j is 4, then just -1
    // we ask if the current click i and j are within that range
    // if they aren't throw some sort error or alert to the user

    if (this.lastClick.i === -1 && this.lastClick.j === -1) {
      this.lastClick = { i, j };
      return true;
    }
    const validRange = {
      iMin: this.lastClick.i - 1 < 0 ? 0 : this.lastClick.i - 1,
      iMax: this.lastClick.i + 1 > 4 ? 4 : this.lastClick.i + 1,
      jMin: this.lastClick.j - 1 < 0 ? 0 : this.lastClick.j - 1,
      jMax: this.lastClick.j + 1 > 4 ? 4 : this.lastClick.j + 1,
    };

    // Check if the current click is within the valid range
    if (
      i >= validRange.iMin &&
      i <= validRange.iMax &&
      j >= validRange.jMin &&
      j <= validRange.jMax
    ) {
      this.lastClick = { i, j }; // Update the last click to the current one
      return true; // The click is valid
    } else {
      // The click is invalid
      return false;
    }
  }

  handleBoxClick(event) {
    const $clickedBox = $(event.currentTarget);

    // Navigate up to the parent ".col" element to access the data attribute for the column
    const j = $clickedBox.closest(".custom-column").data("col");

    // Navigate further up to the grandparent ".row" element to access the data attribute for the row
    const i = $clickedBox.closest(".custom-row").data("row");

    // Log for debugging
    // console.log(`Clicked box coordinates: (${i}, ${j})`);

    // Validate the click
    if (!this.validateClick(i, j)) {
      // console.log("Invalid click! Please click an adjacent box.")

      this.showMessages(
        "Invalid click! Please click an adjacent box.",
        "alert-danger"
      );
      return;
    }

    // Log for debugging
    console.log("Box clicked:", $clickedBox);

    // Get the letter in the clicked box

    // *******THsi is only correct when set to lower case
    const letter = $clickedBox.text().toLowerCase();

    // Add the letter to the user's guess input
    this.userGuess.val(this.userGuess.val() + letter);

    // Add a class to visually indicate the box has been selected
    $clickedBox.addClass("selected");

    // Add "focus" to the input field
    this.userGuess.addClass("fake-focus");
  }

  async handleSubmit(event) {
    event.preventDefault();

    // Get the word input value
    const userGuess = this.userGuess.val();
    if (!userGuess) return; // If there's no input, do nothing
    if (userGuess.length < 2) {
      this.showMessages(
        "Please guess words with 2 or more letters.",
        "alert-danger"
      );

      //Resetting values to initial state
      this.userGuess.val("");
      $(".box.selected", this.board).removeClass("selected");
      this.userGuess.removeClass("fake-focus");
      this.lastClick = { i: -1, j: -1 };
      return;
    }

    console.log(`User guessed: ${userGuess}`);

    if (this.words.has(userGuess)) {
      this.showMessages(`Already found ${userGuess}`, "alert-danger");

      //Resetting values to initial state
      this.userGuess.val("");
      $(".box.selected", this.board).removeClass("selected");
      this.userGuess.removeClass("fake-focus");
      this.lastClick = { i: -1, j: -1 };
      return;
    }

    let result;

    //Using Axios to do a HTTP get request without refreshing the page
    try {
      // When you use the params key, you're telling axios,
      // "Take this data object and serialize it into a query string in the URL of my GET request."
      const response = await axios.get("/check-word", {
        params: { word: userGuess },
      });

      result = response.data.result;
      // console.log(result);
    } catch (error) {
      console.error(error);
    }

    this.userGuess.val(""); // Clear the input box
    $(".box.selected", this.board).removeClass("selected"); // Clear the selected boxes
    this.userGuess.removeClass("fake-focus");

    // Reset lastClick for the next word. This is critical to ensure that the game doesn't
    // mistakenly use the last click from the previous word for the next one.
    this.lastClick = { i: -1, j: -1 }; // Resetting to initial state

    // Display the appropriate message based on the result
    this.displayResultMessage(result, userGuess);

    //Displays words in unordered list of words in the DOM
    if (result === "ok") {
      this.showWord(userGuess);
      //Add words to set to only display new words on list
      this.words.add(userGuess);
      
      //Update scores
      this.score += userGuess.length;
      this.updateScoreDisplay();
    }

    return result;
  }

  displayResultMessage(result, word) {
    if (result === "ok") {
      this.showMessages(`Way to go! You found: ${word}!`, "alert-success");
    } else if (result === "not-on-board") {
      this.showMessages(`${word} is not located on the board.`, "alert-danger");
    } else if (result === "not-word") {
      this.showMessages(`${word} is not a valid word.`, "alert-danger");
    } else {
      this.showMessages(
        "There was an error processing your word.",
        "alert-danger"
      );
    }
  }

  showMessages(msg, className) {
    let messageElement = $("#message");
    messageElement.text(msg).show().addClass(className);

    setTimeout(function () {
      messageElement.hide().text("").removeClass(className);
    }, 2000);
  }

  updateScoreDisplay() {
    $(".score", this.BOGGLE_GAME).text(this.score);
  }
}


