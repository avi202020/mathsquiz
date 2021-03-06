import { takeLatest, put, all } from 'redux-saga/effects';
import { OPERATORS, getQuestions, getAnswer } from '../core/questions';
import { DEFAULT_SETTINGS, SETTING_KEY } from '../constants';
import { get } from '../utils/localStorage';
import { ACTIONS } from '../actions';

function* generateQuestions() {
  const { RECEIVE_QUESTION } = ACTIONS;

  const settings = yield get(SETTING_KEY);
  const { level, operatorSettings, questionsPerQuiz } = settings || DEFAULT_SETTINGS;
  const operators = operatorSettings.filter(o => o.selected).map(o => OPERATORS[o.key]);
  const q = yield getQuestions(level, operators, questionsPerQuiz);

  yield put({
    type: RECEIVE_QUESTION,
    payload: q,
  });
}

function* submitAnswer(action) {
  const { SUBMIT_ANSWER_SUCCESS, SUBMIT_ANSWER_FAIL } = ACTIONS;
  try {
    const { question, answer } = action.payload;
    const correctAnswer = yield getAnswer(question);
    yield put({
      type: SUBMIT_ANSWER_SUCCESS,
      payload: {
        ...question,
        correctAnswer,
        answer,
        correct: correctAnswer === answer,
      },
    });
  } catch (e) {
    yield put({
      type: SUBMIT_ANSWER_FAIL,
    });
  }
}

function* watchGenerateQuestion() {
  const { GENERATE_QUESTION, SUBMIT_ANSWER } = ACTIONS;
  yield takeLatest(GENERATE_QUESTION, generateQuestions);
  yield takeLatest(SUBMIT_ANSWER, submitAnswer);
}

export default function* questionSagas() {
  yield all([
    watchGenerateQuestion(),
  ]);
}
