import {List} from "functools-ts"

export interface DeepList<T> extends List<T | DeepList<T>> {}
export type Deep<T> = T | DeepList<T>

export interface DeepArray<T> extends List<T | DeepArray<T>> {}
export type DeepA<T> = T | DeepArray<T>
