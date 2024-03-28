export enum TTZSocketEvent {
    AnswerTimeout = 'game:answerTimeout',
    OpenChannel = 'game:openChannel',
    JoinGame = 'game:join',
    // @TODO: Come up with better name
    FinalizeTurn = 'game:finalizeTurn',
    StartGame = 'game:start',
    SignOpponentTurn = 'game:signOpponentTurn',
    SubmitGame = 'game:submit',
    TriggerTimeout = 'game:triggerTimeout',
    Turn = 'game:turn',
}