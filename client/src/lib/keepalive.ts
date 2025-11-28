// Keep-alive service untuk mencegah Replit temporary URL idle timeout
// Replit goes idle setelah 15 menit inactivity, jadi kami ping setiap 10 menit

const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes
let keepAliveTimer: NodeJS.Timeout | null = null;

async function pingServer() {
  try {
    // Simple health check request untuk signal activity ke Replit
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('[KeepAlive] Server pinged successfully at', new Date().toLocaleTimeString());
    }
  } catch (error) {
    console.warn('[KeepAlive] Ping failed:', error);
  }
}

export function startKeepAlive() {
  if (keepAliveTimer) return; // Jangan duplicate

  // Ping immediately saat app start
  pingServer();
  
  // Then ping setiap 10 menit
  keepAliveTimer = setInterval(() => {
    pingServer();
  }, KEEP_ALIVE_INTERVAL);
  
  console.log('[KeepAlive] Started - will ping server every 10 minutes to prevent idle timeout');
}

export function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
    console.log('[KeepAlive] Stopped');
  }
}

// Ping juga saat user kembali fokus ke halaman
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    console.log('[KeepAlive] Page regained focus, pinging server');
    pingServer();
  });
}
