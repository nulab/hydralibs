export interface Todo {
  id: number,
  name: string,
  created: Date
}

let curId = 0

const nextId = () => {
  curId += 1
  return curId
}

export const createTodo = (name: string): Todo => ({
  id: nextId(),
  name,
  created: new Date()
})