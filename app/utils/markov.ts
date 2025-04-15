export type TransitionMatrix<T extends string> = {
  [K in T]: { [K2 in T]?: number };
};

export class MarkovChain<T extends string> {
  private transitions: TransitionMatrix<T>;
  private currentState: T;

  constructor(transitions: TransitionMatrix<T>, initialState: T) {
    this.validateTransitions(transitions);
    this.transitions = transitions;
    this.currentState = initialState;
  }

  private validateTransitions(transitions: TransitionMatrix<T>) {
    // Ensure probabilities for each state sum to approximately 1
    for (const state in transitions) {
      const values = Object.values(transitions[state]) as number[];
      const sum = values.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1) > 0.0001) {
        throw new Error(`Probabilities for state ${state} sum to ${sum}, not 1`);
      }
    }
  }

  public getNextState(): T {
    const currentTransitions = this.transitions[this.currentState];
    const random = Math.random();
    let sum = 0;

    for (const [nextState, probability] of Object.entries(currentTransitions)) {
      if (typeof probability === 'number') {
        sum += probability;
        if (random <= sum) {
          this.currentState = nextState as T;
          return this.currentState;
        }
      }
    }

    // Fallback to first state if we somehow don't find one (shouldn't happen with valid transitions)
    this.currentState = Object.keys(this.transitions)[0] as T;
    return this.currentState;
  }

  public getCurrentState(): T {
    return this.currentState;
  }

  public setState(state: T) {
    if (!(state in this.transitions)) {
      throw new Error(`Invalid state: ${state}`);
    }
    this.currentState = state;
  }
} 