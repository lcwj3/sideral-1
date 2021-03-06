const webpack   = require("webpack"),
    path        = require("path");


module.exports = {
    output: {
        path: path.join(__dirname, "../projects"),
        filename: "[name].js"
    },

    entry: {
        "balljammers": "./projects/balljammers/src/main.ts"
    },

    resolve: {
        extensions: [".js", ".json", ".jsx", ".ts", ".tsx"],
        modules: ["node_modules"],
        alias: {
            sideral: path.resolve(__dirname, "../src/")
        }
    },

    devtool: "source-map",

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: "awesome-typescript-loader"
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                query: {
                    presets: ["es2015", "react"]
                }
            }
        ]
    },

    devServer: {
        contentBase : path.join(__dirname, "../projects"),
        compress    : true,
        port        : 3332,
    },

    plugins: [
        new webpack.ProvidePlugin({
            PIXI: path.join(__dirname, "../node_modules/pixi.js")
        })
    ]
};
