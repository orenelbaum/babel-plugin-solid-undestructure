import { Component } from "solid-js"


export const undestructurePlugin: (mode?: "ts" | "vanilla-js") => any

export const component: <
   Props extends Record<string, any>
>(component: Component<Props>) => Component<Props>
