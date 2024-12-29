from flask import Flask, render_template, request, jsonify
import uuid

app = Flask(__name__)

flashcards = [
    {'id': str(uuid.uuid4()), 'question': 'What is Flask?', 'answer': 'A web framework for Python.'},
    {'id': str(uuid.uuid4()), 'question': 'What is Python?', 'answer': 'A programming language.'}
]

@app.route('/')
def home():
    return render_template('index.html', flashcards=flashcards)

@app.route('/create', methods=['POST'])
def create_flashcard():
    question = request.form.get('question')
    answer = request.form.get('answer')

    if not question or not answer:
        return jsonify({'success': False, 'error': 'Both Question and Answer are required'}), 400

    new_card = {
        'id': str(uuid.uuid4()),
        'question': question,
        'answer': answer
    }
    flashcards.append(new_card)
    return jsonify({'success': True, 'flashcards': flashcards})


@app.route('/edit/<string:card_id>', methods=['POST'])
def edit_flashcard(card_id):
    question = request.form.get('question')
    answer = request.form.get('answer')

    for card in flashcards:
        if card['id'] == card_id:
            card['question'] = question
            card['answer'] = answer
            break

    return jsonify({'success': True, 'flashcards': flashcards})


@app.route('/delete/<string:card_id>', methods=['POST'])
def delete_flashcard(card_id):
    global flashcards
    flashcards = [card for card in flashcards if card['id'] != card_id]
    return jsonify({'success': True, 'flashcards': flashcards})

if __name__ == '__main__':
    app.run(debug=True)

