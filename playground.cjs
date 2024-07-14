const { transformAsync } = require("@babel/core")

// Change the following code and and run `pnpm run playground`
const javascriptSrc =/*javascript*/`
import { Component } from 'solid-js'
import { component } from 'undestructure-macros'

component(({ a, b, c, ...other }) => <div>{a} {b} {c} {other.d}</div>)

const ArrowComp = ({ a, b, c, ...other }) => <div>{a} {b} {c} {other.d}</div>

const FunctionExpressionComp = function ({ a, b, c, ...other }) { return <div>{a} {b} {c} {other.d}</div>; }

const NamedExpressionComp = function Comp({ a, b, c, ...other }) { return <div>{a} {b} {c} {other.d}</div>; }

function FunctionComp({ a, b, c, ...other }) { return <div>{a} {b} {c} {other.d}</div>; }

function notAComponent({ a, b, c, ...other }) { return 2 + 2; }
`;

// Change the following code and and run `pnpm run playground`
const typeScriptSrc =/*typescript*/`
import { Component } from 'solid-js'

const ArrowComp: Component<T> = ({ a, b, c, ...other }) => <div>{a} {b} {c} {other.d}</div>

const FunctionExpressionComp: Component<T> = function ({ a, b, c, ...other }) { return <div>{a} {b} {c} {other.d}</div>; }
`;

(async () => {
    const resTS = await transformAsync(
        typeScriptSrc,
        {
            plugins: [
                ["@babel/plugin-syntax-typescript", { isTSX: true }],
                ["./src/index.cjs", { uppercaseFuncNames: true  }],
            ]
        }
    )

    console.log(resTS.code);

    const resJS = await transformAsync(
        javascriptSrc,
        {
            plugins: [
                ["@babel/plugin-syntax-typescript", { isTSX: true }],
                ["./src/index.cjs", { uppercaseFuncNames: true  }],
            ]
        }
    );

    console.log(resJS.code);
})();
