// Import necessary modules
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Define the entry point and HTML templates for each view
const entryDir = './src/index.ts';

module.exports = {
    entry: {
        index: entryDir // Entry point for the main application
    },
    plugins: [
        new CleanWebpackPlugin(), // Clean the dist folder before building
        new MiniCssExtractPlugin({ filename: '[name].css' }), // Extract CSS into separate files
        // Generate HTML files for each view with specific titles and content
        /*
        new HtmlWebpackPlugin({
            title: 'Video Component View',
            template: '',
            filename: 'video_component.html'
        }),
		*/
        new HtmlWebpackPlugin({
            title: 'Panel View',
            template: './src/html/panel.html',
            filename: 'panel.html'
        }),
        /*
        new HtmlWebpackPlugin({
            title: 'Mobile View',
            template: '',
            filename: 'mobile.html'
        }),
		*/
        new HtmlWebpackPlugin({
            title: 'Broadcaster Configuration View',
            template: './src/html/config.html',
            filename: 'config.html'
        }),
        new HtmlWebpackPlugin({
            title: 'Live Configuration View',
            template: './src/html/live_config.html',
            filename: 'live_config.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/, // Match CSS files
                use: [MiniCssExtractPlugin.loader, 'css-loader'] // Use MiniCssExtractPlugin to extract CSS into separate files and css-loader to load the CSS
            },
            {
                test: /\.(png|svg|jpg|gif)$/, // Match image files
                use: ['file-loader'] // Use file-loader to copy image files to the dist folder
            },
            {
                test: /\.tsx?$/, // Match TypeScript and TypeScript React files
                use: 'ts-loader', // Use ts-loader to transpile TypeScript files
                exclude: /node_modules/ // Exclude node_modules folder from transpilation
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'] // Add support for .tsx and .ts files
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/, // Match modules from node_modules folder
                    name: 'vendors', // Name the chunk for vendor libraries
                    chunks: 'all' // Include all chunks that import these modules
                },
                styles: {
                    name: 'styles', // Name the chunk for CSS files
                    test: /\.css$/, // Match only CSS files
                    chunks: 'all', // Include all chunks that import these files
                    enforce: true // Ensure that styles are extracted before other code
                }
            }
        }
    },
    output: {
        filename: '[name].bundle.js', // Name the output file as [name].bundle.js
        path: path.resolve(__dirname, 'dist') // Set the output folder to dist
    }
};
