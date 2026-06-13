// ─────────────────────────────────────────────
// PM2 Ecosystem Config
// Place this file in your backend root folder
//
// Commands:
//   pm2 start ecosystem.config.cjs --env production
//   pm2 stop thcstore
//   pm2 restart thcstore
//   pm2 logs thcstore
//   pm2 monit
//   pm2 startup && pm2 save  (auto-start on reboot)
// ─────────────────────────────────────────────
module.exports = {
  apps: [
    {
      name:               "thcstore",
      script:             "server.js",
      instances:          "max",        // ✅ use all CPU cores
      exec_mode:          "cluster",    // ✅ load balancing across cores
      watch:              false,        // ❌ never watch in production
      max_memory_restart: "500M",       // ✅ restart if memory exceeds 500MB

      // ── Environment ──────────────────────
      env: {
        NODE_ENV: "development",
        PORT:     8000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT:     5000,
      },

      // ── Logging ──────────────────────────
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      out_file:        "./logs/out.log",
      error_file:      "./logs/error.log",
      merge_logs:      true,

      // ── Auto-restart ─────────────────────
      autorestart:   true,
      restart_delay: 3000,  // wait 3s before restarting
      max_restarts:  10,    // stop after 10 consecutive crashes
      min_uptime:    "10s", // must stay up 10s to count as successful
    },
  ],
};
