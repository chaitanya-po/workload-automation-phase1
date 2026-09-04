import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "http://localhost:8000/api";

type Job = {
  id: number; name: string; box_name: string; server: string; status: string;
  start_time?: string; end_time?: string; priority: number; exit_code?: number; run: number;
};

function Login({ onLogin }: { onLogin: (u: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const r = await fetch(`${API}/login`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
      });
      if (!r.ok) throw new Error("Invalid username or password");
      const data = await r.json();
      onLogin(data.username);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return <div className="login-page">
    <div className="login-card">
      <div className="brand"><span className="ca">CA</span><span>A Broadcom Company</span></div>
      <h1>Workload Automation</h1>
      <div className="environment">PROD</div>
      <form onSubmit={submit}>
        <label>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} autoFocus />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="error">{error}</div>}
        <button className="login-btn">Login</button>
      </form>
      <div className="copyright">Copyright © 2026 Workload Automation. All rights reserved.</div>
      <div className="demo">Demo: admin / admin123</div>
    </div>
  </div>
}

function App({ username, logout }: { username: string; logout: () => void }) {
  const [tab, setTab] = useState("Dashboard");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [server, setServer] = useState("");
  const [name, setName] = useState("");

  async function loadJobs() {
    const params = new URLSearchParams();
    if (server) params.set("server", server);
    if (name) params.set("name", name);
    const r = await fetch(`${API}/jobs?${params}`);
    setJobs(await r.json());
  }

  useEffect(() => { loadJobs(); }, []);

  const counts = {
    total: jobs.length,
    running: jobs.filter(j => j.status === "RUNNING").length,
    success: jobs.filter(j => j.status === "SUCCESS").length,
    failed: jobs.filter(j => j.status === "FAILED").length
  };

  function content() {
    if (tab === "Quick View") return <QuickView jobs={jobs} server={server} setServer={setServer} name={name} setName={setName} search={loadJobs} />;
    if (tab === "Monitoring") return <Monitoring jobs={jobs} />;
    if (tab === "Resources") return <Resources />;
    return <Dashboard counts={counts} jobs={jobs} />;
  }

  return <div className="app">
    <header>
      <div className="header-brand"><span className="brand-mark">CA</span><b>Workload Automation</b> <span>- PROD</span></div>
      <div className="user">👤 {username} &nbsp; | &nbsp; <button onClick={logout}>Logout</button> &nbsp; | &nbsp; My Profile &nbsp; | &nbsp; Help</div>
    </header>
    <nav>{["Dashboard", "Monitoring", "Quick View", "Enterprise Command Line", "Quick Edit", "Application Editor", "Resources"].map(t =>
      <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>
    )}</nav>
    <main>
      <div className="page-title">{tab}</div>
      {content()}
    </main>
    <footer>Copyright © 2026 Workload Automation. All rights reserved.</footer>
  </div>
}

function Dashboard({ counts, jobs }: { counts: any; jobs: Job[] }) {
  return <><section className="cards">
    <Card title="Total Jobs" value={counts.total} />
    <Card title="Running" value={counts.running} />
    <Card title="Successful" value={counts.success} />
    <Card title="Failed" value={counts.failed} />
  </section>
  <Panel title="Recent Jobs"><JobTable jobs={jobs} /></Panel></>
}

function Card({title, value}: {title: string; value: number}) {
  return <div className="stat-card"><div>{title}</div><strong>{value}</strong></div>
}

function QuickView({jobs, server, setServer, name, setName, search}: any) {
  return <><Panel title="Required"><div className="required">Search</div></Panel>
  <Panel title="Search"><div className="search-row">
    <label>Server:</label><select value={server} onChange={e => setServer(e.target.value)}><option>PA5</option><option>PA6</option><option value="">All</option></select>
    <label>Name:</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Job name" />
    <button onClick={search}>Go</button>
  </div></Panel>
  <Panel title="Search Results"><JobTable jobs={jobs} quick /></Panel></>
}

function Monitoring({jobs}: {jobs: Job[]}) {
  return <Panel title="Job Monitoring"><JobTable jobs={jobs} /></Panel>
}

function Resources() {
  return <Panel title="Resources"><div className="resource-grid">
    {["PA5", "PA6", "Worker-01", "Worker-02", "Database", "Job Queue"].map(x => <div className="resource" key={x}><b>{x}</b><span>Available</span></div>)}
  </div></Panel>
}

function JobTable({jobs, quick}: {jobs: Job[]; quick?: boolean}) {
  return <div className="table-wrap"><table><thead><tr>
    <th>Name</th><th>Box Name</th>{quick && <><th>Start Time</th><th>End Time</th></>}<th>Status</th><th>Run</th><th>Priority</th><th>Exit Code</th>
  </tr></thead><tbody>
    {jobs.length === 0 ? <tr><td colSpan={8}>No results found</td></tr> : jobs.map(j => <tr key={j.id}>
      <td>{j.name}</td><td>{j.box_name}</td>{quick && <><td>{j.start_time || "-"}</td><td>{j.end_time || "-"}</td></>}
      <td><span className={`status ${j.status.toLowerCase()}`}>{j.status}</span></td><td>{j.run}</td><td>{j.priority}</td><td>{j.exit_code ?? "-"}</td>
    </tr>)}
  </tbody></table></div>
}

function Panel({title, children}: {title: string; children: React.ReactNode}) {
  return <section className="panel"><div className="panel-title">{title}</div><div className="panel-body">{children}</div></section>
}

createRoot(document.getElementById("root")!).render(
  <Root />
);

function Root() {
  const [user, setUser] = useState<string | null>(null);
  return user ? <App username={user} logout={() => setUser(null)} /> : <Login onLogin={setUser} />;
}
