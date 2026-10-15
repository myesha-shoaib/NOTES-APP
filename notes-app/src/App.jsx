import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("my-notes")) || [];
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem("my-notes", JSON.stringify(notes));
  }, [notes]);

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingId(null);
    setShowForm(false);
  }

  function saveNote(e) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please enter both title and note.");
      return;
    }

    if (editingId !== null) {
      setNotes((previous) =>
        previous.map((note) =>
          note.id === editingId
            ? {
                ...note,
                title: title.trim(),
                content: content.trim(),
                updatedAt: Date.now(),
              }
            : note
        )
      );
    } else {
      setNotes((previous) => [
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          content: content.trim(),
          pinned: false,
          updatedAt: Date.now(),
        },
        ...previous,
      ]);
    }

    resetForm();
  }

  function editNote(note) {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
    setShowForm(true);
  }

  function deleteNote(id) {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes((previous) => previous.filter((note) => note.id !== id));

      if (editingId === id) {
        resetForm();
      }
    }
  }

  function togglePin(id) {
    setNotes((previous) =>
      previous.map((note) =>
        note.id === id
          ? { ...note, pinned: !note.pinned, updatedAt: Date.now() }
          : note
      )
    );
  }

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch = `${note.title} ${note.content}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "pinned" && note.pinned) ||
        (filter === "unpinned" && !note.pinned);

      return matchesSearch && matchesFilter;
    })
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        b.updatedAt - a.updatedAt
    );

  return (
    <main className="app">
      <header className="navbar">
        <a className="logo" href="#home">
          <span className="logo-icon">✎</span>
          Note<span>Flow</span>
        </a>

        <span className="saved-badge">
          <span className="status-dot"></span>
          Saved locally
        </span>
      </header>

      <section className="hero" id="home">
        <span className="eyebrow">YOUR SPACE, YOUR THOUGHTS</span>

        <h1>
          Ideas worth
          <br />
          <span>remembering.</span>
        </h1>

        <p className="subtitle">
          A peaceful place to capture everything on your mind.
        </p>
      </section>

      <section className="workspace">
        <div className="toolbar">
          <div>
            <h2>My Notes <span className="count">{notes.length}</span></h2>
            <p className="muted">Your thoughts, all in one place.</p>
          </div>

          <button
            className="primary-btn"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + New note
          </button>
        </div>

        {showForm && (
          <form className="note-form" onSubmit={saveNote}>
            <div className="form-heading">
              <h3>{editingId ? "Edit your note" : "Create a note"}</h3>
              <button
                type="button"
                className="close-btn"
                onClick={resetForm}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <label htmlFor="note-title">Title</label>
            <input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your note a title..."
              maxLength={100}
              required
            />

            <label htmlFor="note-content">Content</label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here..."
              rows={5}
              maxLength={5000}
              required
            />

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn">
                {editingId ? "Update note" : "Save note"}
              </button>
            </div>
          </form>
        )}

        <div className="search-row">
          <input
            className="search-input"
            type="search"
            placeholder="⌕  Search your notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search notes"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter notes"
          >
            <option value="all">All notes</option>
            <option value="pinned">Pinned</option>
            <option value="unpinned">Unpinned</option>
          </select>
        </div>

        <div className="section-heading">
          <h3>Your collection</h3>
          <span className="muted">{filteredNotes.length} notes</span>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <article className="note-card" key={note.id}>
                <div className="note-card-top">
                  <span className="note-tag">
                    {note.pinned ? "📌 Pinned" : "✦ Note"}
                  </span>

                  <button
                    className="icon-btn"
                    onClick={() => togglePin(note.id)}
                    aria-label={note.pinned ? "Unpin note" : "Pin note"}
                    title={note.pinned ? "Unpin note" : "Pin note"}
                  >
                    {note.pinned ? "📌" : "⌑"}
                  </button>
                </div>

                <h3>{note.title}</h3>
                <p className="note-content">{note.content}</p>

                <div className="note-date">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>

                <div className="note-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => editNote(note)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteNote(note.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <h3>
              {notes.length ? "No matching notes" : "Your story starts here"}
            </h3>
            <p>
              {notes.length
                ? "Try another search or filter."
                : "Create your first note and clear your mind."}
            </p>

            {notes.length === 0 && (
              <button
                className="primary-btn"
                onClick={() => setShowForm(true)}
              >
                + Create your first note
              </button>
            )}
          </div>
        )}
      </section>

      <footer className="footer">
        <span>MAKE SPACE FOR YOUR IDEAS.</span>
        <span>CRAFTED WITH ♥</span>
      </footer>
    </main>
  );
}

export default App;