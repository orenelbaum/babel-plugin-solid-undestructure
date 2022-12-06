import { Component } from "solid-js"


export const component: <
   Props extends Record<string, any>
>(component: Component<Props>) => Component<Props>
