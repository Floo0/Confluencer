const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  devtool : 'source-map',
  devServer: {
    contentBase: __dirname + "/dist",
    // host: "10.42.0.1",
    // host: "10.0.60.1",
    host: "0.0.0.0"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"]
          }
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {                
        test: [/.css$/],                
        use:[                    
         'style-loader',                  
         'css-loader'
        ]            
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    })
  ]
};