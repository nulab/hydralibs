import {CSSObject} from "@emotion/core"
import {F1, List} from "functools-ts"
import isEmpty from "lodash-es/isEmpty"

export type DefaultTag = "div"
export type CSSInterpolation<T> = BoxedCSSObject | T
export type Tag = keyof JSX.IntrinsicElements
export type WithPseudo<P> = P & {[key in PseudoProp]?: Partial<WithPseudo<P>>}
export type Style<I, O> = F1<I, CSSInterpolation<O>>
export type StyleArg<I, O> =
  | Style<I, Partial<WithPseudo<O>>>
  | Partial<WithPseudo<O>>
  | BoxedCSSObject
export type StyledArg<I, O, T extends Tag> =
  | StyledComponent<I, T>
  | StyleArg<I, O>
export type RootStyle<I> = F1<I, BoxedCSSObject>
export type RootStyleArg<I> = RootStyle<I> | BoxedCSSObject
export type RootStyledArg<I, T extends Tag> =
  | StyledComponent<I, T>
  | RootStyleArg<I>
export type JSXChild = JSX.Element | string | number | null
export interface DeepArrayI<T> extends Array<T | DeepArrayI<T>> {}
export type DeepArray<T> = T | DeepArrayI<T>
export type JSXChildren = DeepArray<JSXChild>

export const DefaultTag = "div"

export type PseudoProp =
  | "$active"
  | "$checked"
  | "$default"
  | "$disabled"
  | "$empty"
  | "$enabled"
  | "$focus"
  | "$focusWithin"
  | "$fullscreen"
  | "$hover"
  | "$inderminate"
  | "$inRange"
  | "$invalid"
  | "$optional"
  | "$outOfRange"
  | "$readOnly"
  | "$readWrite"
  | "$required"
  | "$valid"
  | "$visited"
  | "$after"
  | "$before"
  | "$start"
  | "$end"

export type PseudoProps = {[key in PseudoProp]?: CSSObject}

export interface BoxedCSSObject {
  __type: "BoxedCSSObject"
  __css: CSSObject
}
export const BoxedCSSObject = (css: CSSObject): BoxedCSSObject => ({
  __type: "BoxedCSSObject",
  __css: css
})
export const isBoxedCss = (obj: any): obj is BoxedCSSObject =>
  obj && obj.__type && obj.__type === "BoxedCSSObject"

export type OneOrMany<T> = T | List<T>
export type ListProps<T> = {[P in keyof T]: OneOrMany<T[P]>}
export type StyleOf<A extends StyledComponent<{}, any>> = Partial<
  A["__styleProps"]
>
export type PropsOf<A extends StyledComponent<{}, any>> = Partial<A["__props"]>

export type Props<P, T extends Tag = DefaultTag> = WithPseudo<Partial<P>> &
  JSX.IntrinsicElements[T] & {
    tag?: Tag
    children?: JSXChildren
    onMount?: (el: HTMLElement) => void
    onRender?: (el: HTMLElement) => void
    onClickOutside?: (evt: MouseEvent) => void
    focusable?: boolean
    autoFocus?: boolean
  }

export interface StyledComponent<P, T extends Tag = DefaultTag> {
  (props: Props<P, T>): JSX.Element
  __props: Props<P, T>
  __styleProps: P
  __tag: Tag
  __defaults?: Partial<P>
  __styles: List<StyledArg<{}, {}, DefaultTag>>
  withDefaults: F1<Partial<P>, StyledComponent<P, T>>
  withTag: <U extends Tag>(u: U) => StyledComponent<P, U>
}

export const hasCSSTransitions = (css: CSSObject): boolean =>
  !isEmpty(css["&:start"]) || !isEmpty(css["&:end"])

export const hasTransition = (props: any): boolean =>
  !!props.start || !!props.end

export const isProps = (obj: any): obj is {} =>
  !isBoxedCss(obj) && typeof obj !== "function"

export const isStyledComponent = <I, O, T extends Tag>(
  styledArg: StyledArg<I, O, T>
): styledArg is StyledComponent<I, T> => !!(styledArg as any).__styles

export interface StyledFn {
  <A, T extends Tag = DefaultTag>(a: RootStyledArg<A, T>): StyledComponent<A, T>
  <A, B, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>
  ): StyledComponent<A & B, T>
  <A, B, C, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>
  ): StyledComponent<A & B & C, T>
  <A, B, C, D, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>
  ): StyledComponent<A & B & C & D, T>
  <A, B, C, D, E, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>
  ): StyledComponent<A & B & C & D & E, T>
  <A, B, C, D, E, F, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>
  ): StyledComponent<A & B & C & D & E & F, T>
  <A, B, C, D, E, F, G, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>
  ): StyledComponent<A & B & C & D & E & F & G, T>
  <A, B, C, D, E, F, G, H, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>
  ): StyledComponent<A & B & C & D & E & F & G & H, T>
  <A, B, C, D, E, F, G, H, I, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>
  ): StyledComponent<A & B & C & D & E & F & G & H & I, T>
  <A, B, C, D, E, F, G, H, I, J, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>,
    j: StyledArg<J, A & B & C & D & E & F & G & H & I, T>
  ): StyledComponent<A & B & C & D & E & F & G & H & I & J, T>
  <A, B, C, D, E, F, G, H, I, J, K, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>,
    j: StyledArg<J, A & B & C & D & E & F & G & H & I, T>,
    k: StyledArg<K, A & B & C & D & E & F & G & H & I & J, T>
  ): StyledComponent<A & B & C & D & E & F & G & H & I & J & K, T>
  <A, B, C, D, E, F, G, H, I, J, K, L, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>,
    j: StyledArg<J, A & B & C & D & E & F & G & H & I, T>,
    k: StyledArg<K, A & B & C & D & E & F & G & H & I & J, T>,
    l: StyledArg<L, A & B & C & D & E & F & G & H & I & J & K, T>
  ): StyledComponent<A & B & C & D & E & F & G & H & I & J & K & L, T>
  <A, B, C, D, E, F, G, H, I, J, K, L, M, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>,
    j: StyledArg<J, A & B & C & D & E & F & G & H & I, T>,
    k: StyledArg<K, A & B & C & D & E & F & G & H & I & J, T>,
    l: StyledArg<L, A & B & C & D & E & F & G & H & I & J & K, T>,
    m: StyledArg<M, A & B & C & D & E & F & G & H & I & J & K & L, T>
  ): StyledComponent<A & B & C & D & E & F & G & H & I & J & K & L & M, T>
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>,
    j: StyledArg<J, A & B & C & D & E & F & G & H & I, T>,
    k: StyledArg<K, A & B & C & D & E & F & G & H & I & J, T>,
    l: StyledArg<L, A & B & C & D & E & F & G & H & I & J & K, T>,
    m: StyledArg<M, A & B & C & D & E & F & G & H & I & J & K & L, T>,
    n: StyledArg<N, A & B & C & D & E & F & G & H & I & J & K & L & M, T>
  ): StyledComponent<A & B & C & D & E & F & G & H & I & J & K & L & M & N, T>
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>,
    j: StyledArg<J, A & B & C & D & E & F & G & H & I, T>,
    k: StyledArg<K, A & B & C & D & E & F & G & H & I & J, T>,
    l: StyledArg<L, A & B & C & D & E & F & G & H & I & J & K, T>,
    m: StyledArg<M, A & B & C & D & E & F & G & H & I & J & K & L, T>,
    n: StyledArg<N, A & B & C & D & E & F & G & H & I & J & K & L & M, T>,
    o: StyledArg<O, A & B & C & D & E & F & G & H & I & J & K & L & M & N, T>
  ): StyledComponent<
    A & B & C & D & E & F & G & H & I & J & K & L & M & N & O,
    T
  >
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, T extends Tag = DefaultTag>(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>,
    j: StyledArg<J, A & B & C & D & E & F & G & H & I, T>,
    k: StyledArg<K, A & B & C & D & E & F & G & H & I & J, T>,
    l: StyledArg<L, A & B & C & D & E & F & G & H & I & J & K, T>,
    m: StyledArg<M, A & B & C & D & E & F & G & H & I & J & K & L, T>,
    n: StyledArg<N, A & B & C & D & E & F & G & H & I & J & K & L & M, T>,
    o: StyledArg<O, A & B & C & D & E & F & G & H & I & J & K & L & M & N, T>,
    p: StyledArg<P, A & B & C & D & E & F & G & H & I & J & K & L & M & N, T>
  ): StyledComponent<
    A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P,
    T
  >
  <
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    T extends Tag = DefaultTag
  >(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>,
    j: StyledArg<J, A & B & C & D & E & F & G & H & I, T>,
    k: StyledArg<K, A & B & C & D & E & F & G & H & I & J, T>,
    l: StyledArg<L, A & B & C & D & E & F & G & H & I & J & K, T>,
    m: StyledArg<M, A & B & C & D & E & F & G & H & I & J & K & L, T>,
    n: StyledArg<N, A & B & C & D & E & F & G & H & I & J & K & L & M, T>,
    o: StyledArg<O, A & B & C & D & E & F & G & H & I & J & K & L & M & N, T>,
    p: StyledArg<
      P,
      A & B & C & D & E & F & G & H & I & J & K & L & M & N & O,
      T
    >,
    q: StyledArg<
      Q,
      A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P,
      T
    >
  ): StyledComponent<
    A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q,
    T
  >
  <
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    T extends Tag = DefaultTag
  >(
    a: RootStyledArg<A, T>,
    b: StyledArg<B, A, T>,
    c: StyledArg<C, A & B, T>,
    d: StyledArg<D, A & B & C, T>,
    e: StyledArg<E, A & B & C & D, T>,
    f: StyledArg<F, A & B & C & D & E, T>,
    g: StyledArg<G, A & B & C & D & E & F, T>,
    h: StyledArg<H, A & B & C & D & E & F & G, T>,
    i: StyledArg<I, A & B & C & D & E & F & G & H, T>,
    j: StyledArg<J, A & B & C & D & E & F & G & H & I, T>,
    k: StyledArg<K, A & B & C & D & E & F & G & H & I & J, T>,
    l: StyledArg<L, A & B & C & D & E & F & G & H & I & J & K, T>,
    m: StyledArg<M, A & B & C & D & E & F & G & H & I & J & K & L, T>,
    n: StyledArg<N, A & B & C & D & E & F & G & H & I & J & K & L & M, T>,
    o: StyledArg<O, A & B & C & D & E & F & G & H & I & J & K & L & M & N, T>,
    p: StyledArg<
      P,
      A & B & C & D & E & F & G & H & I & J & K & L & M & N & O,
      T
    >,
    q: StyledArg<
      Q,
      A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P,
      T
    >,
    r: StyledArg<
      R,
      A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q,
      T
    >
  ): StyledComponent<
    A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R,
    T
  >
}
