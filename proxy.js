const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());

app.use(
  "/api/did",
  createProxyMiddleware({
    target: "https://api.d-id.com",
    changeOrigin: true,
    pathRewrite: { "^/api/did": "" },
  })
);

app.listen(5000, () => {
  console.log("Proxy запущен на http://localhost:5000");
});
