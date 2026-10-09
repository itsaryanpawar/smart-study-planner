import { useEffect, useMemo, useState } from "react";

import ConfirmDialog from "../components/ConfirmDialog";
import Loader from "../components/Loader";
import SessionForm from "../components/SessionForm";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../services/api";
import { createSession, deleteSession, fetchSessions, updateSession } from "../services/sessions";
import { fetchTasks } from "../services/tasks";

function groupSessionsByDate(sessions) {
  return sessions.reduce((groups, session) => {
    if (!groups[session.session_date]) {
      groups[session.session_date] = [];
    }
    groups[session.session_date].push(session);
    return groups;
  }, {});
}

function SchedulePage() {
  const { addToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState("day");
  const [tasks, setTasks] = useState([]);
  const [sessionsPayload, setSessionsPayload] = useState({
    items: [],
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);

  const groupedSessions = useMemo(
    () => groupSessionsByDate(sessionsPayload.items),
    [sessionsPayload.items]
  );

  const loadTasks = async () => {
    const response = await fetchTasks({ page: 1, page_size: 100, sort_by: "due_date", sort_order: "asc" });
    setTasks(response.items);
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchSessions({
        page: 1,
        page_size: 50,
        date: selectedDate,
        view: viewMode,
      });
      setSessionsPayload(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function bootstrap() {
      try {
        await loadTasks();
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    loadSessions();
  }, [selectedDate, viewMode]);

  const handleSubmitSession = async (payload) => {
    try {
      setSaving(true);
      if (editingSession) {
        await updateSession(editingSession.id, payload);
        addToast("Session updated successfully.");
      } else {
        await createSession(payload);
        addToast("Session scheduled successfully.");
      }
      setIsFormOpen(false);
      setEditingSession(null);
      await loadSessions();
    } catch (requestError) {
      addToast(getErrorMessage(requestError), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      await deleteSession(deletingSession.id);
      addToast("Session deleted successfully.");
      setDeletingSession(null);
      await loadSessions();
    } catch (requestError) {
      addToast(getErrorMessage(requestError), "error");
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header-row">
        <div>
          <h2>Schedule</h2>
          <p>Plan focused study blocks and review your daily or weekly calendar.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setEditingSession(null);
            setIsFormOpen(true);
          }}
          disabled={!tasks.length}
        >
          Add Session
        </button>
      </section>

      <section className="card schedule-toolbar">
        <label>
          Reference date
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>

        <div className="view-toggle">
          <button
            type="button"
            className={viewMode === "day" ? "primary-button" : "ghost-button"}
            onClick={() => setViewMode("day")}
          >
            Day View
          </button>
          <button
            type="button"
            className={viewMode === "week" ? "primary-button" : "ghost-button"}
            onClick={() => setViewMode("week")}
          >
            Week View
          </button>
        </div>
      </section>

      {!tasks.length && !loading ? (
        <div className="state-card">Create tasks before scheduling study sessions.</div>
      ) : null}

      {loading ? <Loader label="Loading schedule..." /> : null}
      {error ? <div className="state-card error-state">{error}</div> : null}

      {!loading && !error ? (
        Object.keys(groupedSessions).length ? (
          <div className="schedule-groups">
            {Object.entries(groupedSessions).map(([sessionDate, sessions]) => (
              <section key={sessionDate} className="card">
                <div className="section-heading">
                  <h3>{sessionDate}</h3>
                  <p>{sessions.length} planned session(s)</p>
                </div>

                <div className="list-stack">
                  {sessions.map((session) => (
                    <div key={session.id} className="session-row">
                      <div>
                        <strong>{session.task.title}</strong>
                        <p>{session.task.subject.name}</p>
                        <p>
                          {session.start_time} - {session.end_time}
                        </p>
                        {session.notes ? <p>{session.notes}</p> : null}
                      </div>
                      <div className="card-actions">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => {
                            setEditingSession({
                              ...session,
                              task_id: session.task.id,
                            });
                            setIsFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => setDeletingSession(session)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="empty-state card">No study sessions found for this view.</div>
        )
      ) : null}

      {isFormOpen ? (
        <SessionForm
          tasks={tasks}
          initialValues={editingSession}
          selectedDate={selectedDate}
          onClose={() => {
            setEditingSession(null);
            setIsFormOpen(false);
          }}
          onSubmit={handleSubmitSession}
          submitting={saving}
        />
      ) : null}

      {deletingSession ? (
        <ConfirmDialog
          title="Delete Session"
          message={`Delete the ${deletingSession.start_time} session for "${deletingSession.task.title}"?`}
          confirmLabel="Delete"
          onClose={() => setDeletingSession(null)}
          onConfirm={handleDeleteSession}
        />
      ) : null}
    </div>
  );
}

export default SchedulePage;
