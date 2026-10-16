export const STATUS = Object.freeze({
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
});

const ALLOWED_TRANSITIONS = Object.freeze({
  IDLE: [STATUS.LOADING],
  LOADING: [STATUS.SUCCESS, STATUS.ERROR],
  SUCCESS: [STATUS.LOADING],
  ERROR: [STATUS.LOADING]
});

export function createInitialState() {
  return {
    status: STATUS.IDLE
  };
}

export function transition(currentState, nextState) {
  if (!currentState || !nextState) {
    throw new Error('State must be defined');
  }

  const allowed = ALLOWED_TRANSITIONS[currentState.status];

  if (!allowed || !allowed.includes(nextState.status)) {
    throw new Error(
      `Invalid transition: ${currentState.status} -> ${nextState.status}`
    );
  }

  if (nextState.status === STATUS.SUCCESS) {
    if (!Array.isArray(nextState.data)) {
      throw new Error('SUCCESS state requires an array of data');
    }

    return {
      status: STATUS.SUCCESS,
      data: nextState.data
    };
  }

  if (nextState.status === STATUS.ERROR) {
    if (typeof nextState.error !== 'string' || !nextState.error.trim()) {
      throw new Error('ERROR state requires an error message');
    }

    return {
      status: STATUS.ERROR,
      error: nextState.error
    };
  }

  return {
    status: STATUS.LOADING
  };
}