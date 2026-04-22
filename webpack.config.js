const path = require("path");
const copyPlugin = require('copy-webpack-plugin');

// only transpile and minify the stuff hosted on the web ...
//   server backend can be ran with typescript directly

module.exports = {
    mode: 'production',
    entry: {
        app: "./src/client/app.tsx",
        login: "./src/client/login.tsx",
        settings: "./src/client/settings.tsx",
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    plugins: [
        new copyPlugin({
            patterns: [
                { from: "./src/client/img", to: "./img" }
            ]
        })
    ],
    watchOptions: {
        aggregateTimeout: 200,
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name]Bundle.js',
    },
};
