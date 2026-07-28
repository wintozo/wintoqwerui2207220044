import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

const s = {
  overlay: { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '16px' },
  container: { width: '100%', maxWidth: '800px', height: '80vh', background: '#111827', borderRadius: '16px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  header: { padding: '12px 16px', borderBottom: '1px solid #374151', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  headerIcon: { color: '#4ade80', width: '20px', height: '20px' },
  headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: '14px' },
  closeBtn: { padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#9ca3af', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  closeBtnHover: { background: '#374151' },
  output: { flex: 1, overflowY: 'auto', padding: '16px', fontFamily: 'monospace', fontSize: '14px' },
  inputBar: { padding: '12px 16px', borderTop: '1px solid #374151', background: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' },
  prompt: { color: '#4ade80', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 },
  input: { flex: 1, background: 'transparent', color: '#fff', fontFamily: 'monospace', fontSize: '14px', border: 'none', outline: 'none', placeholderColor: '#4b5563' },
  sendBtn: { padding: '8px', background: 'rgba(74,222,128,0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  sendIcon: { width: '16px', height: '16px', color: '#4ade80' }
};

const msgStyles = {
  command: { color: '#6b7280', marginBottom: '4px' },
  success: { color: '#4ade80', marginBottom: '4px' },
  error: { color: '#f87171', marginBottom: '4px' },
  info: { color: '#d1d5db', marginBottom: '4px' }
};

export default function AdminTerminal({ onClose }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    { type: "info", text: "Wintozo Admin Terminal v1.0" },
    { type: "info", text: "Введите 'help' для списка команд" },
    { type: "info", text: "────────────────────────────────" },
  ]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hoverClose, setHoverClose] = useState(false);
  const [hoverSend, setHoverSend] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const addHistory = (type, text) => {
    setHistory((prev) => [...prev, { type, text }]);
  };

  const getUserById = async (id) => {
    const { data } = await supabase
      .from("wintozo_users")
      .select("username, avatar, banned, title")
      .eq("username", id)
      .single();
    return data;
  };

  const getAllUsers = async () => {
    const { data } = await supabase
      .from("wintozo_users")
      .select("username, avatar, banned, title, is_admin, avatar_url, description, created_at")
      .order("created_at", { ascending: false });
    return data || [];
  };

  const commands = {
    help: {
      name: "help",
      execute: async () => {
        return `Доступные команды:
  /ban [ID] [причина]     — Блокировка пользователя
  /unban [ID]             — Разблокировка пользователя
  /mute [ID] [время]      — Ограничение на отправку сообщений (10m, 1h, 1d)
  /warn [ID]              — Выдать предупреждение (3 варна = бан)
  /kick [ID]              — Исключить из общего чата
  /delete [ID]            — Удалить пользователя навсегда
  /give w-pro (ник) X     — Выдать Wintozo Pro на X дней
  /remove w-pro (ник)     — Забрать Wintozo Pro
  /tittle give (ник) X    — Выдать титул (owner, tester, Spidi)
  /tittle remove (ник) X  — Забрать титул
  /users                  — Показать всех пользователей
  /clear                  — Очистить терминал`;
      }
    },

    ban: {
      name: "ban",
      execute: async (args) => {
        const id = args[0];
        const reason = args.slice(1).join(" ") || "без причины";
        if (!id) return "❌ Ошибка: укажите ID пользователя. Пример: /ban Admin причина";

        const user = await getUserById(id);
        if (!user) return `❌ Пользователь ${id} не найден`;

        const { error: banError } = await supabase
          .from("wintozo_users")
          .update({ banned: true })
          .eq("username", id);

        if (banError) return `❌ Ошибка бана: ${banError.message}`;

        await supabase
          .from("wintozo_messages")
          .delete()
          .or(`from_user.eq.${id},to_user.eq.${id}`);
        await supabase
          .from("wintozo_group_messages")
          .delete()
          .eq("from_user", id);
        await supabase
          .from("wintozo_battle_users")
          .delete()
          .eq("username", id);
        await supabase
          .from("wintozo_pro")
          .delete()
          .eq("username", id);

        addHistory("error", `🚫 Пользователь ${id} заблокирован. Причина: ${reason}`);
        return `✅ Пользователь ${id} заблокирован. Причина: ${reason}\nВсе сообщения с этим пользователем удалены из чатов.`;
      }
    },

    unban: {
      name: "unban",
      execute: async (args) => {
        const id = args[0];
        if (!id) return "❌ Ошибка: укажите ID пользователя. Пример: /unban Admin";

        const user = await getUserById(id);
        if (!user) return `❌ Пользователь ${id} не найден`;

        if (!user.banned) return `ℹ️ Пользователь ${id} не забанен`;

        const { error } = await supabase.rpc("unban_user", {
          p_target_username: id,
          p_admin_username: "Admin"
        });

        if (error) return `❌ Ошибка: ${error.message}`;

        return `✅ Пользователь ${id} разблокирован`;
      }
    },

    mute: {
      name: "mute",
      execute: async (args) => {
        const id = args[0];
        const time = args[1] || "10m";
        if (!id) return "❌ Ошибка: укажите ID и время. Пример: /mute Admin 10m";

        const user = await getUserById(id);
        if (!user) return `❌ Пользователь ${id} не найден`;

        return `✅ Пользователь ${id} замучен на ${time}`;
      }
    },

    warn: {
      name: "warn",
      execute: async (args) => {
        const id = args[0];
        if (!id) return "❌ Ошибка: укажите ID пользователя. Пример: /warn Admin";

        const user = await getUserById(id);
        if (!user) return `❌ Пользователь ${id} не найден`;

        const { data, error } = await supabase.rpc("warn_user", {
          p_target_username: id,
          p_admin_username: "Admin",
          p_reason: "Ручной варн через терминал"
        });

        if (error) return `❌ Ошибка: ${error.message}`;

        return data.message;
      }
    },

    kick: {
      name: "kick",
      execute: async (args) => {
        const id = args[0];
        if (!id) return "❌ Ошибка: укажите ID пользователя. Пример: /kick Admin";

        const user = await getUserById(id);
        if (!user) return `❌ Пользователь ${id} не найден`;

        const { error } = await supabase.rpc("kick_user", {
          p_target_username: id,
          p_admin_username: "Admin"
        });

        if (error) return `❌ Ошибка: ${error.message}`;

        return `✅ Пользователь ${id} исключён из всех чатов. Сообщения удалены.`;
      }
    },

    "give": {
      name: "give",
      execute: async (args) => {
        if (args[0] !== "w-pro") return "❌ Используйте: /give w-pro (ник) X days";

        const nick = args[1];
        const days = parseInt(args[2]) || 30;

        if (!nick) return "❌ Ошибка: укажите ник. Пример: /give w-pro Admin 30 days";

        const { error } = await supabase.rpc("grant_pro", {
          p_target_username: nick,
          p_admin_username: "Admin",
          p_days: days,
          p_reason: "admin_give"
        });

        if (error) return `❌ Ошибка: ${error.message}`;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        return `✅ Пользователю ${nick} выдан Wintozo Pro на ${days} дней (до ${endDate.toLocaleDateString("ru-RU")})`;
      }
    },

    "remove": {
      name: "remove",
      execute: async (args) => {
        if (args[0] !== "w-pro") return "❌ Используйте: /remove w-pro (ник)";

        const nick = args[1];
        if (!nick) return "❌ Ошибка: укажите ник. Пример: /remove w-pro Admin";

        const { error } = await supabase.rpc("revoke_pro", {
          p_target_username: nick,
          p_admin_username: "Admin"
        });

        if (error) return `❌ Ошибка: ${error.message}`;

        return `✅ У пользователя ${nick} забран Wintozo Pro`;
      }
    },

    "tittle": {
      name: "tittle",
      execute: async (args) => {
        if (args[0] === "give") {
          const nick = args[1];
          const title = args[2];

          if (!nick || !title) return "❌ Используйте: /tittle give (ник) (title)";

          const validTitles = ["owner", "tester", "Spidi"];
          if (!validTitles.includes(title)) return `❌ Неверный титул. Доступные: ${validTitles.join(", ")}`;

          const user = await getUserById(nick);
          if (!user) return `❌ Пользователь ${nick} не найден`;

          await supabase
            .from("wintozo_users")
            .update({ title: title })
            .eq("username", nick);

          return `✅ Титул "${title}" выдан пользователю ${nick}`;
        }

        if (args[0] === "remove") {
          const nick = args[1];
          const title = args[2];

          if (!nick || !title) return "❌ Используйте: /tittle remove (ник) (title)";

          const user = await getUserById(nick);
          if (!user) return `❌ Пользователь ${nick} не найден`;

          await supabase
            .from("wintozo_users")
            .update({ title: null })
            .eq("username", nick);

          return `✅ Титул удалён у пользователя ${nick}`;
        }

        return "❌ Используйте: /tittle give/remove (ник) (title)";
      }
    },

    "delete": {
      name: "delete",
      execute: async (args) => {
        const id = args[0];
        if (!id) return "❌ Ошибка: укажите ID пользователя. Пример: /delete Admin";

        const user = await getUserById(id);
        if (!user) return `❌ Пользователь ${id} не найден`;
        if (id === "Admin") return "❌ Нельзя удалить админа";

        const { error } = await supabase.rpc("delete_user", {
          p_target_username: id,
          p_admin_username: "Admin"
        });

        if (error) return `❌ Ошибка: ${error.message}`;

        return `🗑 Пользователь ${id} удалён навсегда`;
      }
    },

    users: {
      name: "users",
      execute: async () => {
        const users = await getAllUsers();
        
        const { data: proData } = await supabase
          .from("wintozo_pro")
          .select("username, end_date, reason");
        
        const proMap = {};
        (proData || []).forEach((p) => {
          proMap[p.username] = p;
        });

        if (users.length === 0) return "ℹ️ Пользователей нет";

        const lines = users.map((u) => {
          const status = u.banned ? "🚫" : "✅";
          const admin = u.is_admin ? "👑" : "";
          const pro = proMap[u.username] ? "👑" : "";
          const title = u.title ? ` [${u.title}]` : "";
          return `${status} ${admin}${u.username}${title} ${pro}`;
        });

        return `Всего пользователей: ${users.length}\n${lines.join("\n")}`;
      }
    },

    clear: {
      name: "clear",
      execute: async () => {
        setHistory([]);
        return "";
      }
    },
  };

  const handleCommand = async (cmd) => {
    if (!cmd.trim()) return;

    addHistory("command", `$ ${cmd}`);

    const parts = cmd.trim().split(/\s+/);
    const commandName = parts[0].toLowerCase().replace("/", "");
    const args = parts.slice(1);

    if (commandName === "clear") {
      await commands.clear.execute(args);
      return;
    }

    const command = commands[commandName];
    if (!command) {
      addHistory("error", `❌ Неизвестная команда: ${commandName}. Введите 'help' для списка команд.`);
      return;
    }

    try {
      const result = await command.execute(args);
      if (result) {
        const resultType = result.startsWith("✅") ? "success" : result.startsWith("❌") ? "error" : "info";
        addHistory(resultType, result);
      }
    } catch (err) {
      addHistory("error", `❌ Ошибка: ${err.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCommand(input);
    setInput("");
    setCommandHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.container} onClick={(e) => e.stopPropagation()}>
        {/* Шапка терминала */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <svg style={s.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span style={s.headerTitle}>Wintozo Terminal</span>
          </div>
          <button
            style={{ ...s.closeBtn, ...(hoverClose ? { background: '#374151' } : {}) }}
            onMouseEnter={() => setHoverClose(true)}
            onMouseLeave={() => setHoverClose(false)}
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Вывод терминала */}
        <div ref={terminalRef} style={s.output}>
          {history.map((line, i) => (
            <div key={i} style={msgStyles[line.type] || msgStyles.info}>
              {line.text}
            </div>
          ))}
        </div>

        {/* Ввод команды */}
        <form onSubmit={handleSubmit} style={s.inputBar}>
          <span style={s.prompt}>❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите команду..."
            style={s.input}
            autoFocus
          />
          <button
            type="submit"
            style={{ ...s.sendBtn, ...(hoverSend ? { background: 'rgba(74,222,128,0.3)' } : {}) }}
            onMouseEnter={() => setHoverSend(true)}
            onMouseLeave={() => setHoverSend(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

