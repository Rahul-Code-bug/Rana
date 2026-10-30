import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock3, ListTodo, LogOut, Plus, Search, Trash2, Pencil, X, CalendarDays, Flag } from "lucide-react";
import { api } from "./api";

const blank = { title: "", description: "", status: "Pending", priority: "Medium", due_date: "" };

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const data = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(form) });
      onAuth(data);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <main className="auth-wrap">
    <section className="auth-card">
      <div className="brand-mark"><ListTodo size={23}/></div>
      <p className="eyebrow">YOUR WORKSPACE</p><h1>Make room for<br/><span>great work.</span></h1>
      <p className="muted auth-copy">Plan your day, keep priorities clear, and move every task forward.</p>
      <div className="tabs"><button className={mode==="login"?"tab active":"tab"} onClick={()=>{setMode("login");setError("");}}>Sign in</button><button className={mode==="register"?"tab active":"tab"} onClick={()=>{setMode("register");setError("");}}>Create account</button></div>
      <form onSubmit={submit} className="form-stack">
        {mode==="register" && <label>Full name<input required minLength="2" placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}
        <label>Email address<input required type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
        <label>Password<input required minLength="8" type="password" placeholder="At least 8 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
        {error && <p className="error">{error}</p>}
        <button className="primary full" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in to workspace":"Create my account"}</button>
      </form>
      <p className="fine-print">Your tasks are private to your account.</p>
    </section>
    <aside className="auth-aside"><div className="aside-orb orb-one"/><div className="aside-orb orb-two"/><div className="aside-content"><span className="aside-kicker">FOCUS ON WHAT MATTERS</span><h2>Less juggling.<br/>More <em>doing.</em></h2><p>A calmer way to keep all your work in one place.</p><div className="mini-task"><span className="mini-check"><CheckCircle2 size={18}/></span><div><strong>Ship the next big thing</strong><small>One task at a time</small></div><span className="mini-tag">DONE</span></div></div></aside>
  </main>;
}

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task || blank);
  const [error, setError] = useState("");
  const submit = async e => { e.preventDefault(); setError(""); try { await onSave(form); onClose(); } catch(err) { setError(err.message); } };
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="modal">
    <div className="modal-head"><div><p className="eyebrow">{task?"UPDATE TASK":"NEW TASK"}</p><h2>{task?"Edit task":"Add a task"}</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div>
    <form onSubmit={submit} className="form-stack">
      <label>Task title<input autoFocus required maxLength="180" placeholder="What needs to get done?" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label>Description<textarea rows="3" placeholder="Add a few details…" value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <div className="form-grid"><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Pending</option><option>In Progress</option><option>Completed</option></select></label><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label></div>
      <label>Due date<input type="date" value={form.due_date||""} onChange={e=>setForm({...form,due_date:e.target.value})}/></label>
      {error&&<p className="error">{error}</p>}
      <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary">{task?"Save changes":"Create task"}</button></div>
    </form>
  </section></div>;
}

function Dashboard({ session, onLogout }) {
  const [tasks,setTasks]=useState([]), [loading,setLoading]=useState(true), [error,setError]=useState("");
  const [search,setSearch]=useState(""), [status,setStatus]=useState("All tasks"), [priority,setPriority]=useState("All priorities");
  const [modal,setModal]=useState(null);
  const load = async () => {
    setLoading(true); setError("");
    try {
      const params=new URLSearchParams();
      if(search.trim()) params.set("search",search.trim());
      if(status!=="All tasks") params.set("status",status);
      if(priority!=="All priorities") params.set("priority",priority);
      const data=await api(`/tasks?${params}`,{token:session.token}); setTasks(data.tasks);
    } catch(err){setError(err.message);} finally{setLoading(false);}
  };
  useEffect(()=>{const timer=setTimeout(load,250);return()=>clearTimeout(timer);},[search,status,priority]);
  const counts=useMemo(()=>({total:tasks.length,progress:tasks.filter(t=>t.status==="In Progress").length,done:tasks.filter(t=>t.status==="Completed").length,pending:tasks.filter(t=>t.status==="Pending").length}),[tasks]);
  const save = async form => {
    if(modal?.id) await api(`/tasks/${modal.id}`,{token:session.token,method:"PUT",body:JSON.stringify(form)});
    else await api("/tasks",{token:session.token,method:"POST",body:JSON.stringify(form)});
    await load();
  };
  const remove = async id => {if(!window.confirm("Delete this task permanently?"))return;try{await api(`/tasks/${id}`,{token:session.token,method:"DELETE"});await load();}catch(err){setError(err.message);}};
  const initials=(session.user.name||"U").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase();
  return <div className="app-shell">
    <header className="topbar"><div className="top-brand"><div className="brand-mark small"><ListTodo size={19}/></div><span>task<span className="brand-accent">flow</span></span></div><div className="top-right"><span className="today-label"><span className="live-dot"/> PERSONAL WORKSPACE</span><div className="user-chip"><span className="avatar">{initials}</span><span>{session.user.name}</span></div><button className="logout-btn" onClick={onLogout} title="Sign out"><LogOut size={17}/></button></div></header>
    <main className="dashboard">
      <div className="welcome-row"><div><p className="eyebrow">YOUR OVERVIEW</p><h1>Good work starts <span>here.</span></h1><p className="muted">A clear view of your priorities, all in one place.</p></div><button className="primary add-main" onClick={()=>setModal({})}><Plus size={18}/> Add new task</button></div>
      <section className="stats-grid">
        <Stat icon={<ListTodo/>} label="Total tasks" value={counts.total} tone="purple"/>
        <Stat icon={<Clock3/>} label="In progress" value={counts.progress} tone="orange"/>
        <Stat icon={<Circle/>} label="Pending" value={counts.pending} tone="blue"/>
        <Stat icon={<CheckCircle2/>} label="Completed" value={counts.done} tone="green"/>
      </section>
      <section className="task-panel">
        <div className="panel-heading"><div><h2>Your tasks</h2><p className="muted">Keep your momentum going.</p></div><span className="task-count">{tasks.length} shown</span></div>
        <div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Search tasks…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option>All tasks</option><option>Pending</option><option>In Progress</option><option>Completed</option></select><select value={priority} onChange={e=>setPriority(e.target.value)}><option>All priorities</option><option>Low</option><option>Medium</option><option>High</option></select></div>
        {error&&<p className="error banner-error">{error}</p>}
        {loading?<div className="empty-state">Loading your tasks…</div>:tasks.length===0?<div className="empty-state"><div className="empty-icon"><ListTodo size={25}/></div><h3>No tasks found</h3><p>{search||status!=="All tasks"||priority!=="All priorities"?"Try changing your search or filters.":"Add your first task and make today count."}</p>{!search&&status==="All tasks"&&priority==="All priorities"&&<button className="primary" onClick={()=>setModal({})}><Plus size={17}/> Create your first task</button>}</div>:<div className="task-list">{tasks.map(task=><article className="task-row" key={task.id}><div className={`status-symbol ${task.status==="Completed"?"is-done":""}`}>{task.status==="Completed"?<CheckCircle2 size={20}/>:<Circle size={20}/>}</div><div className="task-main"><div className="task-title-line"><h3 className={task.status==="Completed"?"completed-title":""}>{task.title}</h3><span className={`priority priority-${task.priority.toLowerCase()}`}><i/>{task.priority}</span></div>{task.description&&<p className="task-description">{task.description}</p>}<div className="task-meta"><span className={`status-pill status-${task.status.toLowerCase().replace(" ","-")}`}>{task.status}</span>{task.due_date&&<span className="due-date"><CalendarDays size={13}/>{new Date(`${task.due_date}T00:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}</span>}</div></div><div className="task-actions"><button className="icon-btn" title="Edit task" onClick={()=>setModal(task)}><Pencil size={16}/></button><button className="icon-btn danger-hover" title="Delete task" onClick={()=>remove(task.id)}><Trash2 size={16}/></button></div></article>)}</div>}
      </section>
      <footer className="footer-note">Built to help you focus on what matters. <span>TaskFlow © {new Date().getFullYear()}</span></footer>
    </main>
    {modal&&<TaskModal task={modal.id?modal:null} onClose={()=>setModal(null)} onSave={save}/>}
  </div>;
}

function Stat({icon,label,value,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong></div></div>; }

export default function App(){
  const [session,setSession]=useState(()=>{try{return JSON.parse(localStorage.getItem("taskflow-session"))}catch{return null}});
  const auth=data=>{localStorage.setItem("taskflow-session",JSON.stringify(data));setSession(data);};
  const logout=()=>{localStorage.removeItem("taskflow-session");setSession(null);};
  useEffect(()=>{if(!session?.token)return;api("/auth/me",{token:session.token}).then(data=>setSession(s=>({...s,user:data.user}))).catch(logout);},[]);
  return session?.token?<Dashboard session={session} onLogout={logout}/>:<AuthScreen onAuth={auth}/>;
}