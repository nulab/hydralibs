
export interface Model {
  id: number
  name: string
  checked: boolean
  created: Date
}

let id = 0

const idGen = () => {
  id += 1
  return id
}

export const create = (name: string): Model => ({
  id: idGen(),
  name,
  checked: false,
  created: new Date
})

export const setName = (name: string) => (model: Model): Model => ({
  ...model,
  name
})

export const toggleChecked = (model: Model): Model => ({
  ...model,
  checked: !model.checked
})