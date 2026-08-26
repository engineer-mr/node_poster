const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");
const QRCode = require("qrcode");

function defaultPoster({
  title = "夏日新品发布会",
  subtitle = `SUMMER LAUNCH ${new Date().getFullYear()}`,
  date = "Mr.Li",
  location = "1752146907",
} = {}) {
  return {
    width: 1080,
    height: 1640,
    title,
    subtitle,
    date,
    location,
    price: "不用因为走得太远，而忘记我们为什么而出发",
    cta: "关注我的 GitHub",
    qrUrl: "https://github.com/1752146907",
    backgroundImage: path.join(__dirname, "bg.png"),
  };
}

const basePoster = defaultPoster();

const outputDir = path.join(__dirname, "output");
const outputFile = path.join(outputDir, "poster.svg");
const port = Number(process.env.PORT || 3000);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function text(value, x, y, options = {}) {
  const {
    size = 42,
    weight = 400,
    fill = "#111827",
    anchor = "start",
    opacity = 1,
    family = "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    letterSpacing = 0,
  } = options;

  return `<text x="${x}" y="${y}" fill="${fill}" opacity="${opacity}" font-size="${size}" font-weight="${weight}" font-family="${family}" text-anchor="${anchor}" letter-spacing="${letterSpacing}">${escapeXml(value)}</text>`;
}

async function makeQrDataUri(value) {
  const qrSvg = await QRCode.toString(value, {
    type: "svg",
    margin: 1,
    width: 174,
    color: {
      dark: "#111827",
      light: "#ffffff",
    },
  });

  return `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString("base64")}`;
}

function makeImageDataUri(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  const mimeType = mimeTypes[ext] || "application/octet-stream";
  const imageBuffer = fs.readFileSync(filePath);

  return `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
}

function makePoster(data) {
  const { width, height } = data;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#1f2937" flood-opacity="0.18"/>
    </filter>
    <clipPath id="cover">
      <rect width="${width}" height="${height}"/>
    </clipPath>
    <clipPath id="heroCover">
      <rect x="138" y="188" width="804" height="420" rx="28"/>
    </clipPath>
  </defs>

  <image href="${escapeXml(data.backgroundImage)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#cover)"/>
  <rect width="${width}" height="${height}" fill="#020617" opacity="0.34"/>
  <rect width="${width}" height="${height}" fill="#fff7ed" opacity="0.18"/>

  <g filter="url(#shadow)">
    <rect x="90" y="140" width="900" height="1110" rx="36" fill="#ffffff" opacity="0.88"/>
  </g>

  <image href="${escapeXml(data.backgroundImage)}" x="138" y="188" width="804" height="420" preserveAspectRatio="xMidYMid slice" clip-path="url(#heroCover)"/>
  <rect x="138" y="188" width="804" height="420" rx="28" fill="#111827" opacity="0.2"/>

  ${text(data.subtitle, 140, 705, { size: 32, weight: 700, fill: "#ef4444", letterSpacing: 3 })}
  ${text(data.title, 140, 795, { size: 82, weight: 900, fill: "#111827" })}
  ${text("用一张海报，把我的信息讲清楚。", 144, 870, { size: 36, fill: "#4b5563" })}

  <line x1="140" y1="940" x2="940" y2="940" stroke="#d1d5db" stroke-width="2"/>
  ${text("姓名", 140, 1010, { size: 30, fill: "#6b7280" })}
  ${text(data.date, 260, 1010, { size: 44, weight: 800, fill: "#111827" })}
  ${text("账号", 140, 1085, { size: 30, fill: "#6b7280" })}
  ${text(data.location, 260, 1085, { size: 44, weight: 800, fill: "#111827" })}
  ${text(data.price, 140, 1180, { size: 26, weight: 600, fill: "#ef4444" })}

  <rect x="140" y="1238" width="515" height="90" rx="45" fill="#111827"/>
  ${text(data.cta, 398, 1296, { size: 34, weight: 800, fill: "#ffffff", anchor: "middle" })}

  <rect x="735" y="1180" width="190" height="190" rx="18" fill="#ffffff" stroke="#111827" stroke-width="8"/>
  <image href="${escapeXml(data.qrDataUri)}" x="743" y="1188" width="174" height="174"/>
</svg>`;
}

async function renderPoster(data) {
  return makePoster({
    ...data,
    backgroundImage: makeImageDataUri(data.backgroundImage),
    qrDataUri: await makeQrDataUri(data.qrUrl),
  });
}

function buildPosterFromParams(params = {}) {
  return defaultPoster({
    title: params.title ?? undefined,
    subtitle: params.subtitle ?? undefined,
    date: params.date ?? undefined,
    location: params.location ?? undefined,
  });
}

async function writePosterFile() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, await renderPoster(basePoster), "utf8");

  console.log(`海报已生成: ${outputFile}`);
}

function startServer() {
  const server = http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    try {
      if (requestUrl.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(
          [
            "Poster service is running.",
            "Try:",
            `/poster.svg?title=${encodeURIComponent(basePoster.title)}&subtitle=${encodeURIComponent(basePoster.subtitle)}&date=${encodeURIComponent(basePoster.date)}&location=${encodeURIComponent(basePoster.location)}`,
          ].join("\n")
        );
        return;
      }

      if (requestUrl.pathname === "/poster.svg") {
        const svg = await renderPoster(
          buildPosterFromParams({
            title: requestUrl.searchParams.get("title"),
            subtitle: requestUrl.searchParams.get("subtitle"),
            date: requestUrl.searchParams.get("date"),
            location: requestUrl.searchParams.get("location"),
          })
        );

        res.writeHead(200, {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        });
        res.end(svg);
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Poster render failed");
    }
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`海报服务已启动: http://localhost:${port}`);
    console.log(
      `示例: http://localhost:${port}/poster.svg?title=${encodeURIComponent(basePoster.title)}&subtitle=${encodeURIComponent(basePoster.subtitle)}&date=${encodeURIComponent(basePoster.date)}&location=${encodeURIComponent(basePoster.location)}`
    );
  });
}

if (process.argv.includes("--server")) {
  startServer();
} else {
  writePosterFile().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}