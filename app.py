from boggle import Boggle
from flask import Flask, render_template, session, request, jsonify
from flask_debugtoolbar import DebugToolbarExtension


app = Flask(__name__)
app.debug = True

app.config['SECRET_KEY'] = "oh-so-secret"
# ^^ helps w debugging and viewing info in ssn will talk later
# root route
app.config['DEBUG_TB_INTERCEPT_REDIRECT'] = False

debug = DebugToolbarExtension(app)
# ^^instantiate it with our app..make sure route name is inputed in arg


boggle_game = Boggle()
BOARD_KEY = "board_key"


@app.route('/')
def home_page():
    """Show board."""
    BOARD = boggle_game.make_board()
    session[BOARD_KEY] = BOARD
    return render_template("index.html", board=BOARD)


@app.route('/check-word')
def check_word():
    """Check if word is in dictionary."""

    word = request.args.get('word')

    BOARD = session[BOARD_KEY]
    is_valid_word = boggle_game.check_valid_word(BOARD, word)

    return jsonify({'result': is_valid_word, 'word': word})


@app.route("/post-score", methods=["POST"])
def post_score():
    """Receive score, update nplays, update high score if appropriate."""
    