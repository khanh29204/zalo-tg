#!/usr/bin/env bash
set -e

PLIST="$HOME/Library/LaunchAgents/com.zalo-tg.bot.plist"
SERVICE="com.zalo-tg.bot"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "⬇️  Pulling latest code..."
cd "$DIR"
git pull --rebase

echo "📦 Installing dependencies..."
npm ci --prefer-offline

echo "🔨 Building..."
npm run build

# Restart nếu đang chạy qua launchd
if launchctl list "$SERVICE" &>/dev/null 2>&1; then
  echo "🔄 Restarting service..."
  launchctl kickstart -k "gui/$(id -u)/$SERVICE"
  echo "✅ Done! Bot đã được cập nhật và restart."
else
  echo "⚠️  Service chưa chạy. Khởi động..."
  launchctl load "$PLIST" 2>/dev/null || true
  launchctl start "$SERVICE" 2>/dev/null || true
  echo "✅ Done! Bot đã được khởi động."
fi

echo ""
echo "📋 Log: tail -f $DIR/logs/bot.log"
