import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  ArrowRight, BookOpen, BookMarked, Bookmark, CheckCircle2, ChevronDown,
  CircleUserRound, Clock3, Compass, LayoutDashboard, LibraryBig, LogOut,
  Menu, Search, ShieldCheck, Sparkles, Users, X, Plus, Pencil, Trash2,
  RotateCcw, TrendingUp, CalendarDays, AlertCircle
} from "lucide-react";
import api from "./api";

const demoBooks = [
  { id: 1, title: "Atomic Habits", author: "James Clear", category: "Personal Growth", year: 2018, availableCopies: 4, totalCopies: 5, description: "A practical guide to building good habits and breaking bad ones.", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80" },
  { id: 2, title: "The Design of Everyday Things", author: "Don Norman", category: "Design", year: 2013, availableCopies: 2, totalCopies: 3, description: "A classic exploration of human-centered design and usability.", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80" },
  { id: 3, title: "Clean Code", author: "Robert C. Martin", category: "Technology", year: 2008, availableCopies: 0, totalCopies: 4, description: "Principles and practices for writing readable, maintainable software.", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80" },
  { id: 4, title: "Sapiens", author: "Yuval Noah Harari", category: "History", year: 2011, availableCopies: 3, totalCopies: 4, description: "A sweeping account of the history and development of humankind.", cover: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80" },
  { id: 5, title: "Deep Work", author: "Cal Newport", category: "Personal Growth", year: 2016, availableCopies: 5, totalCopies: 5, description: "Rules for focused success in a distracted world.", cover: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80" },
  { id: 6, title: "The Pragmatic Programmer", author: "David Thomas & Andrew Hunt", category: "Technology", year: 2019, availableCopies: 1, totalCopies: 2, description: "Timeless advice for becoming a more effective software developer.", cover: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80" }
];

function getSession() {
  try { return JSON.parse(localStorage.getItem("library_user") || "null"); }
  catch { return null; }
}

function App() {
  const [user, setUser] = useState(getSession);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function signOut() {
    localStorage.removeItem("library_token");
    localStorage.removeItem("library_user");
    setUser(null);
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark"><LibraryBig size={21} /></span>
          <span>OpenShelf<span className="brand-dot">.</span><small>YOUR DIGITAL LIBRARY</small></span>
        </Link>
        <button className="mobile-menu" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/books" onClick={() => setMenuOpen(false)}>Explore books</NavLink>
          {user && <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>}
          {user?.role === "ADMIN" && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Administration</NavLink>}
        </nav>
        <div className="header-actions">
          {user ? <>
            <span className="user-chip"><CircleUserRound size={17} /> {user.name || user.email}</span>
            <button className="button button-quiet button-small" onClick={signOut}><LogOut size={15} /> Sign out</button>
          </> : <>
            <Link className="login-link" to="/login">Log in</Link>
            <Link className="button button-primary button-small" to="/register">Create account <ArrowRight size={15} /></Link>
          </>}
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BooksPage user={user} />} />
          <Route path="/login" element={<AuthPage mode="login" onAuth={setUser} />} />
          <Route path="/register" element={<AuthPage mode="register" onAuth={setUser} />} />
          <Route path="/dashboard" element={<Protected user={user}><Dashboard user={user} /></Protected>} />
          <Route path="/admin" element={<Protected user={user} admin><AdminPage user={user} /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="footer-brand"><span className="brand-mark"><LibraryBig size={18} /></span><strong>OpenShelf</strong></div>
        <p>A little more knowledge, every day.</p>
        <span>© {new Date().getFullYear()} OpenShelf Library</span>
      </footer>
    </div>
  );
}

function Home() {
  const [stats, setStats] = useState({ books: 1200, members: 850, categories: 24 });
  const [featured, setFeatured] = useState(demoBooks);
  useEffect(() => {
    api.get("/books").then(({ data }) => {
      const list = Array.isArray(data) ? data : data.content || [];
      if (list.length) setFeatured(list.slice(0, 6).map(normalizeBook));
      setStats(s => ({ ...s, books: list.length || s.books }));
    }).catch(() => {});
  }, []);
  return <>
    <section className="hero">
      <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15} /> A world of knowledge awaits</div>
        <h1>Discover your<br /><em>next great read.</em></h1>
        <p className="hero-lede">A thoughtful space for curious minds. Explore a growing collection, keep track of your reading, and find the book that changes your perspective.</p>
        <div className="hero-actions">
          <Link className="button button-light" to="/books">Explore the collection <ArrowRight size={17} /></Link>
          <Link className="hero-secondary" to="/register">Join the library <span>↗</span></Link>
        </div>
        <div className="hero-proof"><div className="avatar-stack"><span>R</span><span>M</span><span>A</span><span>+</span></div><div><strong>A community of readers</strong><small>Learn something new every day</small></div></div>
      </div>
      <div className="hero-art">
        <div className="art-note note-top"><Sparkles size={15} /> Find your next favorite</div>
        <div className="book-stage">
          <div className="book book-back"><div className="book-spine" /><div className="cover-illustration lines" /><span>THE ART OF<br />THINKING</span><small>THOUGHTFUL PRESS</small></div>
          <div className="book book-front"><div className="cover-sun" /><div className="cover-plant">✳</div><span>THE<br />QUIET<br /><b>POWER</b></span><small>A GUIDE TO FOCUS & CLARITY</small><div className="cover-author">ELENA WATTS</div></div>
          <div className="book book-side"><span>IDEAS THAT LAST</span></div>
        </div>
        <div className="art-note note-bottom"><BookOpen size={16} /><span><b>Read. Discover. Grow.</b><small>Your personal reading journey</small></span></div>
      </div>
      <div className="hero-bottom-label">A BETTER WAY TO READ <span>✳</span> SINCE DAY ONE</div>
    </section>

    <section className="stats-strip">
      <div><strong>{stats.books.toLocaleString()}<i>+</i></strong><span>Books to discover</span></div>
      <div><strong>{stats.members.toLocaleString()}<i>+</i></strong><span>Curious readers</span></div>
      <div><strong>{stats.categories}<i></i></strong><span>Ways to explore</span></div>
      <div className="stats-note"><span className="mini-spark">✳</span><p>Every book opens a door.<br /><b>Which one will you open?</b></p></div>
    </section>

    <section className="section section-featured">
      <div className="section-heading"><div><div className="eyebrow eyebrow-muted">HANDPICKED FOR YOU</div><h2>Books worth your time<span>.</span></h2><p>Thought-provoking reads for wherever curiosity takes you.</p></div><Link className="text-link" to="/books">View all books <ArrowRight size={16} /></Link></div>
      <div className="book-grid">{featured.slice(0, 4).map((book, i) => <BookCard key={book.id || book.title} book={book} index={i} />)}</div>
    </section>

    <section className="discover-banner">
      <div className="banner-symbol"><BookMarked size={34} /></div>
      <div><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2>Make room for a little wonder.</h2><p>Join OpenShelf and make your reading life a little more intentional.</p></div>
      <Link className="button button-light" to="/register">Enter the library <ArrowRight size={16} /></Link>
    </section>
  </>;
}

function normalizeBook(book) {
  return {
    ...book,
    id: book.id ?? book.bookId,
    title: book.title || book.name || "Untitled book",
    author: book.author || book.authorName || "Unknown author",
    category: book.category || "General",
    year: book.year || book.publicationYear || "—",
    availableCopies: book.availableCopies ?? book.available ?? 0,
    totalCopies: book.totalCopies ?? book.quantity ?? 1,
    description: book.description || "Discover more about this title in the library catalogue.",
    cover: book.coverUrl || book.cover || book.imageUrl || ""
  };
}

function BookCard({ book: raw, index = 0, onBorrow }) {
  const book = normalizeBook(raw);
  const [saved, setSaved] = useState(false);
  const colors = ["cover-cream", "cover-green", "cover-lilac", "cover-blue"];
  return <article className="book-card">
    <div className={`book-cover ${colors[index % colors.length]}`}>
      {book.cover ? <img src={book.cover} alt={`Cover of ${book.title}`} /> : <div className="generated-cover"><span className="cover-mark">✳</span><strong>{book.title}</strong><small>{book.author}</small><i>OPENSHELF EDITION</i></div>}
      <button className={`save-book ${saved ? "saved" : ""}`} aria-label="Save book" onClick={() => setSaved(!saved)}><Bookmark size={17} fill={saved ? "currentColor" : "none"} /></button>
      <span className="book-category">{book.category}</span>
    </div>
    <div className="book-card-info"><div className="book-meta">{book.year} <span>·</span> {book.availableCopies > 0 ? "Available" : "Currently borrowed"}</div><h3>{book.title}</h3><p>by {book.author}</p><div className="book-card-bottom"><span className={book.availableCopies > 0 ? "availability available" : "availability unavailable"}><span />{book.availableCopies > 0 ? `${book.availableCopies} available` : "Waitlist"}</span><button className="round-arrow" onClick={() => onBorrow ? onBorrow(book) : window.location.assign("/books")} aria-label={`View ${book.title}`}><ArrowRight size={17} /></button></div></div>
  </article>;
}

function BooksPage({ user }) {
  const [books, setBooks] = useState(demoBooks);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const categories = useMemo(() => ["All categories", ...new Set(books.map(b => normalizeBook(b).category))], [books]);
  useEffect(() => { api.get("/books").then(({ data }) => { const list = Array.isArray(data) ? data : data.content || []; if (list.length) setBooks(list.map(normalizeBook)); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  const filtered = books.map(normalizeBook).filter(b => `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(query.toLowerCase()) && (category === "All categories" || b.category === category));
  async function borrow(book) {
    if (!user) { window.location.assign("/login"); return; }
    try {
      await api.post(`/borrowings/${book.id}`);
      setNotice(`Request submitted for “${book.title}”.`);
    } catch (e) {
      setNotice(e.response?.data?.message || "Borrowing is not available right now. Please sign in again or contact the librarian.");
    }
  }
  return <div className="page-wrap">
    <div className="page-title-row"><div><div className="eyebrow eyebrow-muted">THE COLLECTION</div><h1>Find your next read<span>.</span></h1><p>Browse the shelves, follow your curiosity, and discover something unexpected.</p></div><div className="catalogue-count"><BookOpen size={19} /><span><b>{filtered.length}</b> titles shown</span></div></div>
    <div className="catalogue-tools"><label className="search-box"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, author, or topic..." /></label><label className="select-box"><Compass size={17} /><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={15} /></label></div>
    {notice && <div className="notice"><CheckCircle2 size={18} />{notice}<button onClick={() => setNotice("")}><X size={15} /></button></div>}
    {loading && <div className="inline-loading">Checking the library catalogue…</div>}
    <div className="book-grid catalogue-grid">{filtered.map((b, i) => <BookCard key={b.id || b.title} book={b} index={i} onBorrow={borrow} />)}</div>
    {!filtered.length && <div className="empty-state"><BookOpen size={34} /><h3>No books found</h3><p>Try a different title, author, or category.</p><button className="button button-outline" onClick={() => { setQuery(""); setCategory("All categories"); }}>Clear filters</button></div>}
  </div>;
}

function AuthPage({ mode, onAuth }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const path = isRegister ? "/auth/register" : "/auth/login";
      const { data } = await api.post(path, form);
      const token = data.token || data.accessToken || data.jwt;
      const rawUser = data.user || data;
      if (token) localStorage.setItem("library_token", token);
      const session = { id: rawUser.id, name: rawUser.name || rawUser.fullName || form.name || rawUser.email || form.email, email: rawUser.email || form.email, role: String(rawUser.role || "USER").replace("ROLE_", "").toUpperCase() };
      localStorage.setItem("library_user", JSON.stringify(session)); onAuth(session);
      navigate(session.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data || "We couldn't complete that request. Check your details and try again.");
    } finally { setBusy(false); }
  }
  return <div className="auth-layout">
    <div className="auth-aside"><div className="eyebrow"><Sparkles size={14} /> A space for curious minds</div><h2>Good books.<br /><em>New perspectives.</em></h2><p>Make every page count. Your next discovery is closer than you think.</p><div className="auth-quote"><span>“</span><p>A reader lives a thousand lives before he dies.</p><small>— George R. R. Martin</small></div><div className="auth-aside-art"><BookOpen size={100} strokeWidth={0.8} /></div></div>
    <div className="auth-form-wrap"><div className="auth-form-card"><div className="auth-form-icon"><LibraryBig size={22} /></div><div className="eyebrow eyebrow-muted">{isRegister ? "JOIN OUR COMMUNITY" : "WELCOME BACK"}</div><h1>{isRegister ? "Create your account" : "Good to see you again."}</h1><p className="auth-subtitle">{isRegister ? "Start your own reading journey with OpenShelf." : "Sign in to continue your reading journey."}</p>
      {error && <div className="error-message"><AlertCircle size={17} />{typeof error === "string" ? error : "Please check your details and try again."}</div>}
      <form onSubmit={submit} className="form-stack">
        {isRegister && <label>Full name<input required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" minLength={2} /></label>}
        <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
        <label>Password<input required type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : 1} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} /></label>
        {isRegister && <p className="form-hint">Use at least 8 characters for a stronger password.</p>}
        <button className="button button-primary button-full" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"} <ArrowRight size={17} /></button>
      </form>
      <div className="auth-switch">{isRegister ? "Already a member?" : "New to OpenShelf?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create an account"}</Link></div>
      <div className="secure-note"><ShieldCheck size={15} /> Your information is handled securely.</div>
    </div></div>
  </div>;
}

function Protected({ user, admin = false, children }) {
  if (!user) return <div className="access-denied"><ShieldCheck size={36} /><h2>Sign in to continue</h2><p>This page is available to library members.</p><Link className="button button-primary" to="/login">Log in <ArrowRight size={16} /></Link></div>;
  if (admin && user.role !== "ADMIN") return <div className="access-denied"><ShieldCheck size={36} /><h2>Administrator access required</h2><p>Your account does not have permission to view this page.</p><Link className="button button-outline" to="/dashboard">Return to dashboard</Link></div>;
  return children;
}

function Dashboard({ user }) {
  const [borrowings, setBorrowings] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/borrowings/my").then(({ data }) => setBorrowings(Array.isArray(data) ? data : data.content || [])).catch(() => setError("Borrowing records are not available yet. The dashboard is ready to connect to your backend API.")); }, []);
  const active = borrowings.filter(b => !["RETURNED", "CANCELLED"].includes(String(b.status).toUpperCase()));
  return <div className="dashboard-layout">
    <aside className="dashboard-sidebar"><div className="sidebar-label">YOUR LIBRARY</div><NavLink to="/dashboard" className="sidebar-link active"><LayoutDashboard size={18} /> Overview</NavLink><NavLink to="/books" className="sidebar-link"><BookOpen size={18} /> Browse books</NavLink><div className="sidebar-label sidebar-spaced">ACCOUNT</div><button className="sidebar-link" onClick={() => document.getElementById("borrowing-history")?.scrollIntoView({ behavior: "smooth" })}><Clock3 size={18} /> Reading history</button><div className="sidebar-help"><BookMarked size={22} /><b>Keep turning pages.</b><p>Your next favorite book is waiting on the shelves.</p><Link to="/books">Explore books <ArrowRight size={14} /></Link></div></aside>
    <section className="dashboard-main"><div className="dashboard-welcome"><div><div className="eyebrow eyebrow-muted">MEMBER OVERVIEW</div><h1>Welcome back, {user.name?.split(" ")[0] || "reader"}<span>.</span></h1><p>Here's a little snapshot of your reading journey.</p></div><div className="today-chip"><CalendarDays size={16} /> {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div></div>
      <div className="metric-grid"><Metric icon={<BookOpen />} label="Active borrowings" value={active.length} note="Books currently checked out" /><Metric icon={<Bookmark />} label="Reading history" value={borrowings.length} note="Total borrowing records" /><Metric icon={<CheckCircle2 />} label="Returned books" value={borrowings.filter(b => String(b.status).toUpperCase() === "RETURNED").length} note="Books returned so far" /><Metric icon={<TrendingUp />} label="Member status" value="Active" note="Welcome to your library" /></div>
      {error && <div className="notice notice-muted"><AlertCircle size={18} />{error}</div>}
      <div className="dashboard-panel" id="borrowing-history"><div className="panel-heading"><div><h2>Your borrowing activity</h2><p>Keep an eye on the books you're exploring.</p></div><Link className="text-link" to="/books">Find more books <ArrowRight size={15} /></Link></div>
        {borrowings.length ? <div className="table-scroll"><table><thead><tr><th>Book</th><th>Borrowed on</th><th>Due date</th><th>Status</th></tr></thead><tbody>{borrowings.map((b, i) => <tr key={b.id || i}><td><strong>{b.book?.title || b.bookTitle || "Library book"}</strong></td><td>{formatDate(b.borrowDate || b.borrowedAt)}</td><td>{formatDate(b.dueDate)}</td><td><span className={`status-pill ${String(b.status).toLowerCase()}`}>{b.status || "Pending"}</span></td></tr>)}</tbody></table></div> : <div className="empty-state compact"><BookOpen size={30} /><h3>Your next chapter starts here</h3><p>Books you borrow will appear in this space.</p><Link className="button button-primary" to="/books">Browse the collection <ArrowRight size={15} /></Link></div>}
      </div>
    </section>
  </div>;
}

function Metric({ icon, label, value, note }) {
  return <div className="metric-card"><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-dot" /></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><small>{note}</small></div>;
}

function AdminPage({ user }) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState("books");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", author: "", category: "General", year: "", totalCopies: 1, availableCopies: 1, description: "" });
  const [busy, setBusy] = useState(false);
  async function load() {
    try { const [b, m] = await Promise.all([api.get("/books"), api.get("/admin/members")]); setBooks((Array.isArray(b.data) ? b.data : b.data.content || []).map(normalizeBook)); setMembers(Array.isArray(m.data) ? m.data : m.data.content || []); setError(""); }
    catch { try { const b = await api.get("/books"); setBooks((Array.isArray(b.data) ? b.data : b.data.content || []).map(normalizeBook)); } catch {} setError("Some admin endpoints may not exist in your backend yet. Add the endpoints listed in README.md to enable all management actions."); }
  }
  useEffect(() => { load(); }, []);
  function startEdit(book = null) {
    setEditing(book?.id ?? "new");
    setForm(book ? { title: book.title, author: book.author, category: book.category, year: book.year === "—" ? "" : book.year, totalCopies: book.totalCopies, availableCopies: book.availableCopies, description: book.description } : { title: "", author: "", category: "General", year: "", totalCopies: 1, availableCopies: 1, description: "" });
    setNotice("");
  }
  async function saveBook(e) {
    e.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const payload = { ...form, publicationYear: Number(form.year) || null, year: Number(form.year) || null, totalCopies: Number(form.totalCopies), availableCopies: Number(form.availableCopies) };
      if (editing === "new") await api.post("/books", payload); else await api.put(`/books/${editing}`, payload);
      setNotice(editing === "new" ? "Book added successfully." : "Book updated successfully."); setEditing(null); await load();
    } catch (e) { setError(e.response?.data?.message || "Could not save the book. Confirm that the backend has admin-authorized POST/PUT /api/books endpoints."); }
    finally { setBusy(false); }
  }
  async function deleteBook(book) {
    if (!window.confirm(`Delete "${book.title}"? This action may not be reversible.`)) return;
    try { await api.delete(`/books/${book.id}`); setNotice("Book deleted."); await load(); }
    catch (e) { setError(e.response?.data?.message || "Could not delete this book. Check backend permissions and borrowing constraints."); }
  }
  const counts = [{ label: "Catalogue titles", value: books.length, icon: <BookOpen /> }, { label: "Registered members", value: members.length || "—", icon: <Users /> }, { label: "Available copies", value: books.reduce((sum, b) => sum + Number(b.availableCopies || 0), 0), icon: <CheckCircle2 /> }, { label: "Out of circulation", value: books.filter(b => !b.availableCopies).length, icon: <Clock3 /> }];
  return <div className="admin-wrap"><div className="dashboard-welcome"><div><div className="eyebrow eyebrow-muted">LIBRARY OPERATIONS</div><h1>Administrator console<span>.</span></h1><p>Manage your catalogue and keep the library running smoothly.</p></div><button className="button button-primary" onClick={() => startEdit()}><Plus size={17} /> Add a book</button></div>
    <div className="metric-grid admin-metrics">{counts.map(c => <Metric key={c.label} {...c} note={c.label === "Catalogue titles" ? "Books in the catalogue" : c.label === "Registered members" ? "Member accounts" : c.label === "Available copies" ? "Ready to borrow" : "No copies available"} />)}</div>
    {error && <div className="error-message"><AlertCircle size={17} />{error}</div>}{notice && <div className="notice"><CheckCircle2 size={18} />{notice}<button onClick={() => setNotice("")}><X size={15} /></button></div>}
    <div className="admin-panel"><div className="admin-tabs"><button className={tab === "books" ? "active" : ""} onClick={() => setTab("books")}><BookOpen size={17} /> Book catalogue</button><button className={tab === "members" ? "active" : ""} onClick={() => setTab("members")}><Users size={17} /> Members</button><button className="tab-refresh" onClick={load}><RotateCcw size={15} /> Refresh</button></div>
      {editing !== null && <form className="book-edit-form" onSubmit={saveBook}><div className="panel-heading"><div><h2>{editing === "new" ? "Add a new book" : "Edit book details"}</h2><p>Fields marked * are required.</p></div><button type="button" className="icon-button" onClick={() => setEditing(null)}><X size={18} /></button></div><div className="edit-grid">
        <label>Book title *<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label><label>Author *<input required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></label><label>Category<input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label><label>Publication year<input type="number" min="0" max="2100" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></label><label>Total copies<input required type="number" min="1" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })} /></label><label>Available copies<input required type="number" min="0" max={form.totalCopies} value={form.availableCopies} onChange={e => setForm({ ...form, availableCopies: e.target.value })} /></label><label className="full-field">Description<textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label></div><div className="form-actions"><button type="button" className="button button-outline" onClick={() => setEditing(null)}>Cancel</button><button disabled={busy} className="button button-primary">{busy ? "Saving…" : "Save book"} <ArrowRight size={15} /></button></div></form>}
      {tab === "books" ? <div className="table-scroll"><table><thead><tr><th>Book details</th><th>Category</th><th>Year</th><th>Available</th><th>Actions</th></tr></thead><tbody>{books.map(b => <tr key={b.id}><td><strong>{b.title}</strong><small className="table-subline">{b.author}</small></td><td>{b.category}</td><td>{b.year}</td><td><span className={`status-pill ${b.availableCopies ? "available" : "unavailable"}`}>{b.availableCopies}/{b.totalCopies}</span></td><td><div className="row-actions"><button title="Edit book" onClick={() => startEdit(b)}><Pencil size={15} /></button><button title="Delete book" className="danger-action" onClick={() => deleteBook(b)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{!books.length && <div className="empty-state compact"><BookOpen size={28} /><h3>No catalogue records found</h3><p>Add a book to get started.</p></div>}</div> : <div className="table-scroll"><table><thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Account</th></tr></thead><tbody>{members.map((m, i) => <tr key={m.id || i}><td><strong>{m.name || m.fullName || "Library member"}</strong></td><td>{m.email || "—"}</td><td><span className="status-pill">{m.role || "USER"}</span></td><td><span className={`status-pill ${m.enabled === false ? "unavailable" : "available"}`}>{m.enabled === false ? "Inactive" : "Active"}</span></td></tr>)}</tbody></table>{!members.length && <div className="empty-state compact"><Users size={28} /><h3>Member list not available</h3><p>Confirm the admin members endpoint exists in your backend.</p></div>}</div>}
    </div>
  </div>;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function NotFound() { return <div className="access-denied"><BookOpen size={38} /><h2>Page not found</h2><p>Looks like this page isn't on our shelves.</p><Link to="/" className="button button-primary">Return home <ArrowRight size={16} /></Link></div>; }

export default App;