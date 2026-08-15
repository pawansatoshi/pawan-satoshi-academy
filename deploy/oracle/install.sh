#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/pawansatoshi/pawan-satoshi-academy.git"
APP_ROOT="/opt/pawan-satoshi-academy"
APP_USER="academybot"
ENV_FILE="/etc/pawan-satoshi-academy.env"
SERVICE_NAME="pawan-satoshi-academy"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script with sudo or as root."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y git curl ca-certificates build-essential

if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  echo "Node.js >=20 is required; found $(node -v)."
  exit 1
fi

if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --home "$APP_ROOT" --shell /usr/sbin/nologin "$APP_USER"
fi

mkdir -p "$(dirname "$APP_ROOT")"
if [[ ! -d "$APP_ROOT/.git" ]]; then
  git clone "$REPO_URL" "$APP_ROOT"
else
  git -C "$APP_ROOT" fetch origin main
  git -C "$APP_ROOT" reset --hard origin/main
fi

chown -R "$APP_USER:$APP_USER" "$APP_ROOT"

runuser -u "$APP_USER" -- bash -lc "cd '$APP_ROOT/bot' && npm install"

if [[ ! -f "$ENV_FILE" ]]; then
  umask 077
  read -r -s -p "Discord Bot Token: " DISCORD_BOT_TOKEN; echo
  read -r -p "Discord Application/Client ID: " DISCORD_CLIENT_ID
  read -r -p "Discord Server/Guild ID: " DISCORD_GUILD_ID
  read -r -p "Owner Discord User ID: " OWNER_DISCORD_ID

  cat > "$ENV_FILE" <<EOF
DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
DISCORD_GUILD_ID=$DISCORD_GUILD_ID
OWNER_DISCORD_ID=$OWNER_DISCORD_ID
NODE_ENV=production
LOG_LEVEL=info
DATABASE_PATH=./data/academy.db
WEBSITE_BASE_URL=https://pawansatoshi.github.io/pawan-satoshi-academy
AI_HELPER_MODE=retrieval
WEEKLY_MEETING_DAY=SUNDAY
WEEKLY_MEETING_HOUR_IST=19
EOF
  chown root:root "$ENV_FILE"
  chmod 600 "$ENV_FILE"
else
  echo "Environment file already exists: $ENV_FILE"
fi

mkdir -p "$APP_ROOT/bot/data"
chown -R "$APP_USER:$APP_USER" "$APP_ROOT/bot/data"

cat > "/etc/systemd/system/$SERVICE_NAME.service" <<EOF
[Unit]
Description=Pawan Satoshi Academy Discord Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_ROOT/bot
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=5
TimeoutStopSec=20
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=$APP_ROOT/bot/data

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

cat > /usr/local/bin/pawan-academy <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
APP_ROOT=/opt/pawan-satoshi-academy
ENV_FILE=/etc/pawan-satoshi-academy.env
SERVICE=pawan-satoshi-academy

case "${1:-}" in
  start) systemctl start "$SERVICE" ;;
  stop) systemctl stop "$SERVICE" ;;
  restart) systemctl restart "$SERVICE" ;;
  status) systemctl --no-pager status "$SERVICE" ;;
  logs) journalctl -u "$SERVICE" -n 100 --no-pager ;;
  follow) journalctl -u "$SERVICE" -f ;;
  deploy-commands) runuser -u academybot -- bash -lc "cd '$APP_ROOT/bot' && set -a && source '$ENV_FILE' && set +a && npm run deploy:commands" ;;
  bootstrap-dry-run) runuser -u academybot -- bash -lc "cd '$APP_ROOT/bot' && set -a && source '$ENV_FILE' && set +a && npm run bootstrap:server" ;;
  bootstrap-apply) runuser -u academybot -- bash -lc "cd '$APP_ROOT/bot' && set -a && source '$ENV_FILE' && set +a && npm run bootstrap:server -- --confirm" ;;
  update)
    systemctl stop "$SERVICE" || true
    cp -a "$APP_ROOT/bot/data/academy.db" "$APP_ROOT/bot/data/academy.db.bak.$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
    git -C "$APP_ROOT" fetch origin main
    git -C "$APP_ROOT" reset --hard origin/main
    chown -R academybot:academybot "$APP_ROOT"
    runuser -u academybot -- bash -lc "cd '$APP_ROOT/bot' && npm install"
    systemctl start "$SERVICE"
    ;;
  *)
    echo "Usage: pawan-academy {start|stop|restart|status|logs|follow|deploy-commands|bootstrap-dry-run|bootstrap-apply|update}"
    exit 2
    ;;
esac
EOF
chmod 755 /usr/local/bin/pawan-academy

echo
printf '%s\n' "Installation complete. The bot service is installed but NOT started yet."
printf '%s\n' "1) Review the environment: sudo cat $ENV_FILE (never share the output)"
printf '%s\n' "2) Run: sudo pawan-academy bootstrap-dry-run"
printf '%s\n' "3) Only after reviewing the dry-run: sudo pawan-academy bootstrap-apply"
printf '%s\n' "4) Register commands: sudo pawan-academy deploy-commands"
printf '%s\n' "5) Start the bot: sudo pawan-academy start"
printf '%s\n' "6) Check logs: sudo pawan-academy logs"
