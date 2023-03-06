import {List} from "functools-ts"
import {createStore, compose, Store, applyMiddleware} from "redux"
import thunk from "redux-thunk"
import {updateStateReducer, dispatcherFromRedux} from "./index"
import {expect} from "chai"
import {transitions, takeLatest} from "hydra-dispatch";
import {from} from "rxjs";

interface Book {
  id: number
  name: string
  description: string
}
const Book = (id: number, name: string, description: string = ""): Book => ({
  id,
  name,
  description
})

interface Data {
  books: List<Book>
}

const setupStore = (initialState: Data): Store<Data> =>
  createStore(
    updateStateReducer as any,
    initialState,
    compose(applyMiddleware(thunk))
  ) as any

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(() => resolve(), ms))


describe("Redux dispatch tests", () => {
  it("should test if dispatch a sync function works", async () => {
    const store = setupStore({books: []})
    const dispatch = dispatcherFromRedux<Data>(store.dispatch)
    dispatch(() => ({
      books: [Book(1, "test")]
    }))
    await wait(0)
    expect(store.getState().books[0].id).to.eq(1)
  })

  it("should test if dispatch a transition works", async () => {
    const store = setupStore({books: []})
    const dispatch = dispatcherFromRedux<Data>(store.dispatch)
    const firstUpdate = (): Data => ({books: [Book(1, "test")]})
    const secondUpdate = (state: Data): Data => ({books: [...state.books, Book(2, "test")]})
    dispatch(transitions(firstUpdate, secondUpdate))
    await wait(0)
    expect(store.getState().books[1].id).eq(2)
  })

  it("should test if dispatch transitions with async functions works", async () => {
    const store = setupStore({books: []})
    const dispatch = dispatcherFromRedux<Data>(store.dispatch)
    const firstUpdate = (): Data => ({books: [Book(1, "test")]})
    const secondUpdate = async (_: Data) => {
      await wait(5)
      return (state: Data) => ({books: [...state.books, Book(2, "test")]})
    }
    dispatch(transitions(firstUpdate, secondUpdate))
    await wait(10)
    expect(store.getState().books[1].id).eq(2)
  })

  it("should test if dispatch transitions works for more than 2 function", async () => {
    const store = setupStore({books: []})
    const expectedResult: Data = {
      books: [
        Book(1, "test"),
        Book(2, "test"),
        Book(3, "test"),
        Book(4, "test"),
        Book(5, "test")
      ]
    }
    const dispatch = dispatcherFromRedux<Data>(store.dispatch)
    const firstUpdate = (): Data => ({books: [Book(1, "test")]})
    const secondUpdate = async (_: Data) => {
      await wait(5)
      return (state: Data) => ({books: [...state.books, Book(2, "test")]})
    }
    const thirdUpdate = (state: Data): Data => ({books: [...state.books, Book(3, "test")]})
    const fourthUpdate = async (_: Data) => {
      await wait(5)
      return (state: Data) => ({books: [...state.books, Book(4, "test")]})
    }
    const fifthUpdate = async (_: Data) => {
      await wait(5)
      return (state: Data) => ({books: [...state.books, Book(5, "test")]})
    }
    dispatch(transitions(firstUpdate, secondUpdate, thirdUpdate, fourthUpdate, fifthUpdate))
    await wait(30)
    expect(store.getState()).eql(expectedResult)
  })

  it("dispatch in a dispatch function should work", async () => {
    const store = setupStore({books: []})
    const expectedResult = [
      Book(1, "test"),
      Book(2, "test")
    ]
    const dispatch = dispatcherFromRedux<Data>(store.dispatch)
    dispatch(async (_state: Data) => {
      dispatch((_: Data) => ({books: [Book(1, "test")]}))
      await wait(5)
      return (state: Data) => ({books: [...state.books, Book(2, "test")]})
    })
    await wait(10)
    expect(store.getState().books).eql(expectedResult)
  })

  it("should dispatch a stream of function", async () => {
    const store = setupStore({books: []})
    const expectedResult = [
      Book(1, "test"),
      Book(2, "test"),
      Book(3, "test"),
      Book(4, "test")
    ]
    const dispatch = dispatcherFromRedux<Data>(store.dispatch)
    const updates = (_: Data) => from([
      (state: Data): Data => ({books: [...state.books, Book(1, "test")]}),
      (state: Data) => ({books: [...state.books, Book(2, "test")]}),
      (state: Data) => ({books: [...state.books, Book(3, "test")]}),
      (state: Data) => ({books: [...state.books, Book(4, "test")]})
    ])
    dispatch(updates)
    await wait(10)
    expect(store.getState().books).eql(expectedResult)
  })

  it("dispatch should take latest result if specified", async () => {
    const store = setupStore({books: []})
    const expectedResult = [
      Book(2, "test")
    ]
    const dispatch = dispatcherFromRedux<Data>(store.dispatch)
    const first = async (_: Data) => {
      await wait(10)
      return (_: Data) => ({books: [Book(1, "test")]})
    }
    const second = async (_: Data) => {
      await wait(5)
      return (_: Data) => ({books: [Book(2, "test")]})
    }
    dispatch(takeLatest(first, "fetchBooks"))
    dispatch(takeLatest(second, "fetchBooks"))
    await wait(20)
    expect(store.getState().books).eql(expectedResult)
  })
})
