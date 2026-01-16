import { useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

export default function FeedbackForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok: boolean, text: string }

  const errors = useMemo(() => {
    const e = {};
    if (!form.message.trim() || form.message.trim().length < 3) e.message = "Введи повідомлення (мін. 3 символи)";
    if (form.email.trim() && !isEmail(form.email)) e.email = "Некоректний email";
    return e;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    if (!canSubmit) {
      setResult({ ok: false, text: "Перевір поля форми." });
      return;
    }

    try {
      setLoading(true);

      const r = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
        }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok || !data?.ok) {
        throw new Error(data?.error || "Помилка сервера");
      }

      setResult({ ok: true, text: "Повідомлення надіслано ✅" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch  {
      setResult({ ok: false, text: "Не вдалося надіслати. Спробуй ще раз." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>Зворотний зв’язок</h2>

      <form onSubmit={onSubmit} style={styles.form}>
        <div style={styles.row}>
          <label style={styles.label}>
            Ім’я
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Наприклад, Наталія"
              style={styles.input}
              autoComplete="name"
            />
          </label>

          <label style={styles.label}>
            Email
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="name@email.com"
              style={{ ...styles.input, ...(errors.email ? styles.inputError : null) }}
              autoComplete="email"
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </label>
        </div>

        <label style={styles.label}>
          Тема
          <input
            name="subject"
            value={form.subject}
            onChange={onChange}
            placeholder="Про що повідомлення?"
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Повідомлення *
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            placeholder="Напиши деталі…"
            style={{ ...styles.textarea, ...(errors.message ? styles.inputError : null) }}
            required
          />
          {errors.message && <span style={styles.error}>{errors.message}</span>}
        </label>

        <button type="submit" disabled={!canSubmit} style={{ ...styles.btn, ...(canSubmit ? null : styles.btnDisabled) }}>
          {loading ? "Надсилаю..." : "Надіслати"}
        </button>

        {result && (
          <div style={{ ...styles.alert, ...(result.ok ? styles.alertOk : styles.alertBad) }}>
            {result.text}
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 720,
    margin: "40px auto",
    padding: 20,
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 16,
  },
  title: { margin: "0 0 16px", fontSize: 24 },
  form: { display: "grid", gap: 14 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.2)",
    outline: "none",
  },
  textarea: {
    minHeight: 140,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.2)",
    outline: "none",
    resize: "vertical",
  },
  inputError: { border: "1px solid #d33" },
  error: { color: "#d33", fontSize: 12 },
  btn: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  alert: { padding: 12, borderRadius: 12, fontSize: 14 },
  alertOk: { background: "rgba(0,150,0,0.12)", border: "1px solid rgba(0,150,0,0.25)" },
  alertBad: { background: "rgba(200,0,0,0.10)", border: "1px solid rgba(200,0,0,0.25)" },
};
