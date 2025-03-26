const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());

app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://api.d-id.com",
    changeOrigin: true,
    pathRewrite: { "^/proxy": "" },
  })
);

app.listen(5000, () => console.log("Server running on port 5000"));
