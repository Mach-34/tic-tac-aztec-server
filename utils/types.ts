
export type AnswerTimeoutPayload = Omit<TurnPayload, 'senderSignature'>;

export type FinalizeTurnPayload = {
    turnResult: object;
}

export type JoinGamePayload = {
    address: string;
    id: string;
    mongoId: string,
    signature: string[]
}

export type OpenChannelPayload = {
    openChannelResult: object
}

export type SignTurnPayload = {
    signature: string
}

export type StartGamePayload = {
    address: string
}

export type TimeoutTriggeredPayload = {
    turnResult?: object
}

export type TurnPayload = {
    col: number
    gameId: string
    row: number
    sender: string
    senderSignature: string
    turnIndex: number
}

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