// proxy/server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

// libera CORS para o Expo Web
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, *");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// encaminha /api -> backend Java (ajuste se sua porta for outra)
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:8080",
    changeOrigin: true,
    xfwd: true,
    pathRewrite: { "^/api": "/api" },
  })
);

const PORT = 8082; // porta do proxy
app.listen(PORT, () => console.log("Proxy ON em http://localhost:" + PORT));
