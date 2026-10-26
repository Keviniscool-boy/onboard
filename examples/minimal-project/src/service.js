// 重试服务：拉取远端价格并缓存。刻意保持简单，供 onboarding 练习阅读。
const config = { retries: 2, timeoutMs: 800 };

async function fetchPrice(url) {
  let lastError;
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(config.timeoutMs) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function startServer(port) {
  return { port, config }; // 演示用途：不真正监听
}

module.exports = { startServer, fetchPrice, config };
