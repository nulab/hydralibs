declare module "fastextend" {
  export function merge<A extends {}>(...toMerge: A[]): A
}
