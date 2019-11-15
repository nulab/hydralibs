
import {List} from "functools-ts"
import {mockSetState, dispatcherFromReact} from "./index"
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
const data: Data = {
  books: []
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(() => resolve(), ms))

describe("Test dispatch", () => {
  it("should dispatch a function", () => {
    const store = mockSetState(data)
    const dispatch = dispatcherFromReact(store.setState)
    const update = () => ({books: [Book(1, "test")]})
    dispatch(update)
    expect(store.state.books[0].id).eq(1)
  })

  it("should dispatch a async function", async () => {
    const store = mockSetState(data)
    const dispatch = dispatcherFromReact(store.setState)
    const asyncUpdate = async () => {
      await wait(0)
      return (state: Data) => ({books: [...state.books, Book(1, "test")]})
    }
    dispatch(asyncUpdate)
    await wait(5)
    expect(store.state.books[0].id).eq(1)
  })

  it("should dispatch a transitions", async () => {
    const store = mockSetState(data)
    const expectedResult = [
      Book(1, "test"),
      Book(2, "test")
    ]
    const dispatch = dispatcherFromReact(store.setState)
    const firstUpdate = (state: Data) => ({books: [...state.books, Book(1, "test")]})
    const secondUpdate = (state: Data) => ({books: [...state.books, Book(2, "test")]})
    dispatch(transitions(firstUpdate, secondUpdate))
    await wait(5)
    expect(store.state.books).eql(expectedResult)
  })

  it("should dispatch a transitions with async function", async () => {
    const store = mockSetState(data)
    const expectedResult = [
      Book(1, "test"),
      Book(2, "test")
    ]
    const dispatch = dispatcherFromReact(store.setState)
    const firstUpdate = (state: Data) => ({books: [...state.books, Book(1, "test")]})
    const secondUpdate = async (_: Data) => {
      await wait(0)
      return (state: Data) => ({books: [...state.books, Book(2, "test")]})
    }
    dispatch(transitions(firstUpdate, secondUpdate))
    await wait(5)
    expect(store.state.books).eql(expectedResult)
  })

  it("should dispatch a transitions of 4 function", async () => {
    const store = mockSetState(data)
    const expectedResult = [
      Book(1, "test"),
      Book(2, "test"),
      Book(3, "test"),
      Book(4, "test")
    ]
    const dispatch = dispatcherFromReact(store.setState)
    const firstUpdate = (state: Data) => ({books: [...state.books, Book(1, "test")]})
    const secondUpdate = async (_: Data) => {
      await wait(0)
      return (state: Data) => ({books: [...state.books, Book(2, "test")]})
    }
    const thirdUpdate = async (_: Data) => {
      await wait(0)
      return (state: Data) => ({books: [...state.books, Book(3, "test")]})
    }
    const fourthUpdate = (state: Data) => ({books: [...state.books, Book(4, "test")]})
    dispatch(transitions(firstUpdate, secondUpdate, thirdUpdate, fourthUpdate))
    await wait(5)
    expect(store.state.books).eql(expectedResult)
  })

  it("should dispatch a stream of function", async () => {
    const store = mockSetState(data)
    const expectedResult = [
      Book(1, "test"),
      Book(2, "test"),
      Book(3, "test"),
      Book(4, "test")
    ]
    const dispatch = dispatcherFromReact(store.setState)
    const updates = (_: Data) => from([
      (state: Data): Data => ({books: [...state.books, Book(1, "test")]}),
      (state: Data) => ({books: [...state.books, Book(2, "test")]}),
      (state: Data) => ({books: [...state.books, Book(3, "test")]}),
      (state: Data) => ({books: [...state.books, Book(4, "test")]})
    ])
    dispatch(updates)
    await wait(10)
    expect(store.state.books).eql(expectedResult)
  })

  it("dispatch should takeLatest result if specified", async () => {
    const store = mockSetState(data)
    const expectedResult = [
      Book(2, "test")
    ]
    const dispatch = dispatcherFromReact(store.setState)
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
    expect(store.state.books).eql(expectedResult)
  })
})
