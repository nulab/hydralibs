import {MiddlewareAPI, Dispatch, Action} from "redux"

let _replaying = false
let _monitor: any = null

export const defer = (f: () => void) => setTimeout(f, 0)

export const flagReplaying = (state: boolean) => (_replaying = state)
export const setMonitor = (monitor: any) => {
  _monitor = monitor
}

export const isReplaying = (): boolean =>
  _replaying || (_monitor && _monitor.isTimeTraveling())

export const actionWithDispatch = <S, A extends Action>(
  _: MiddlewareAPI<Dispatch, S>
) => (next: Dispatch<A>) => (action: A) => {
  let syncActivityFinished = false
  let actionQueue: A[] = []

  const withDispatch = (action: A) =>
    Object.assign({}, action, {dispatchFromUpdate})

  function flushQueue() {
    // flush queue
    actionQueue = actionQueue.reduce((nextActionQueue, currentAction) => {
      next(currentAction)
      return nextActionQueue.slice(1)
    }, actionQueue)
  }

  function dispatchFromUpdate(action: A) {
    if (!isReplaying()) actionQueue.push(withDispatch(action))
    if (syncActivityFinished) defer(() => flushQueue())
  }

  const actionWithDispatch = withDispatch(action)

  if (typeof action === "function") {
    next(action)
    syncActivityFinished = true
  } else {
    next(actionWithDispatch)
    syncActivityFinished = true
    flushQueue()
  }
  return actionWithDispatch
}
