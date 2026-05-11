import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Telegraf } from 'telegraf';

import { config } from './config.js';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Hash of the commit we already sent a notification for (avoid spam)
let _notifiedCommit: string | null = null;

function gitExec(cmd: string): string {
  return execSync(cmd, { cwd: PROJECT_ROOT, stdio: 'pipe' }).toString().trim();
}

/** Returns the short hash of origin/main if it's ahead of HEAD, else null. */
function getNewCommit(): string | null {
  try {
    gitExec('git fetch origin main --quiet');
    const behind = gitExec('git log HEAD..origin/main --oneline');
    if (!behind) return null;
    return gitExec('git rev-parse --short origin/main');
  } catch {
    return null;
  }
}

/** Human-readable list of new commits (max 10 lines). */
function getChangelog(): string {
  try {
    return gitExec('git log HEAD..origin/main --oneline --no-merges');
  } catch {
    return '';
  }
}

export function startUpdateChecker(bot: Telegraf): void {

  // ── Periodic check mỗi 10 phút ───────────────────────────────────────────
  const check = async () => {
    const commit = getNewCommit();
    if (!commit) return;                    // không có gì mới
    if (_notifiedCommit === commit) return; // đã nhắn rồi

    _notifiedCommit = commit;
    const changelog = getChangelog();

    try {
      await bot.telegram.sendMessage(
        config.telegram.groupId,
        `🔔 <b>Có bản cập nhật mới!</b> (<code>${commit}</code>)\n\n${
          changelog
            ? changelog.split('\n').slice(0, 10).map(l => `• ${l}`).join('\n')
            : ''
        }`,
        { parse_mode: 'HTML' },
      );
    } catch (err) {
      console.error('[Updater] Failed to send notification:', err);
      _notifiedCommit = null;
    }
  };

  // Kiểm tra 1 phút sau khi khởi động, sau đó mỗi 10 phút
  setTimeout(check, 60_000);
  setInterval(check, 10 * 60_000);
}
