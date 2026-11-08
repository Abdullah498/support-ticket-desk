# NOTES

## 1. Which state lives in Redux, which in Context, which in local component state, and why?

I keep tickets, agents, and ticket filters in Redux because they represent shared application data that multiple components need to access. Redux provides a centralized and predictable way to manage this state.

I use React Context for the theme because it is a global UI preference that does not require Redux's advanced state-management capabilities. Local component state handles temporary UI concerns, such as form inputs, dropdown visibility, and modal state. This keeps component-specific state close to where it is needed.

## 2. How your optimistic update and rollback work, step by step.

When a user updates a ticket, I first save a snapshot of its current state, then immediately update the Redux store. This makes the interface reflect the change without waiting for the API response.

The API request then runs in the background. If it succeeds, the optimistic change remains in place. If it fails, I dispatch a rollback action that restores the ticket from the saved snapshot and show an error notification.

## 3. Why your filter selectors are memoized, and what would happen without createSelector.

I use Redux Toolkit's `createSelector` to memoize the selectors responsible for filtering tickets and calculating derived values. The selectors only recompute their results when their input state changes.

Without `createSelector`, filtering would run repeatedly even when the relevant data has not changed. This wastes computation and creates new array references unnecessarily, potentially triggering avoidable component re-renders.

## 4. One thing you would change with more time.

I would improve the optimistic update implementation to handle concurrent updates to the same ticket more reliably. Currently, a saved snapshot is used to restore the previous state when a request fails, but overlapping requests could make rollback behavior more complicated.

I would also expand the test coverage to include API failures, rollback scenarios, filtering combinations, and important user interactions.