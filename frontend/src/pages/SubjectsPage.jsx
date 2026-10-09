import { useEffect, useState } from "react";

import ConfirmDialog from "../components/ConfirmDialog";
import Loader from "../components/Loader";
import SubjectForm from "../components/SubjectForm";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../services/api";
import {
  createSubject,
  deleteSubject,
  fetchSubjects,
  updateSubject,
} from "../services/subjects";

function SubjectsPage() {
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchSubjects({ page: 1, page_size: 100 });
      setSubjects(response.items);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
        addToast("Subject updated successfully.");
      } else {
        await createSubject(payload);
        addToast("Subject created successfully.");
      }
      setIsFormOpen(false);
      setEditingSubject(null);
      await loadSubjects();
    } catch (requestError) {
      addToast(getErrorMessage(requestError), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubject(deletingSubject.id);
      addToast("Subject deleted successfully.");
      setDeletingSubject(null);
      await loadSubjects();
    } catch (requestError) {
      addToast(getErrorMessage(requestError), "error");
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header-row">
        <div>
          <h2>Subjects</h2>
          <p>Group tasks by topic and keep revision areas organized.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setEditingSubject(null);
            setIsFormOpen(true);
          }}
        >
          Add Subject
        </button>
      </section>

      {loading ? <Loader label="Loading subjects..." /> : null}
      {error ? <div className="state-card error-state">{error}</div> : null}

      {!loading && !error ? (
        subjects.length ? (
          <div className="card-grid subjects-grid">
            {subjects.map((subject) => (
              <article key={subject.id} className="card subject-card">
                <div className="subject-title">
                  <span className="color-dot" style={{ backgroundColor: subject.color }} />
                  <h3>{subject.name}</h3>
                </div>
                <p>{subject.description || "No description provided."}</p>
                <div className="card-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setEditingSubject(subject);
                      setIsFormOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => setDeletingSubject(subject)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state card">No subjects found. Add your first subject to begin.</div>
        )
      ) : null}

      {isFormOpen ? (
        <SubjectForm
          initialValues={editingSubject}
          onClose={() => {
            setEditingSubject(null);
            setIsFormOpen(false);
          }}
          onSubmit={handleSubmit}
          submitting={saving}
        />
      ) : null}

      {deletingSubject ? (
        <ConfirmDialog
          title="Delete Subject"
          message={`Deleting "${deletingSubject.name}" will also remove its tasks and sessions.`}
          confirmLabel="Delete"
          onClose={() => setDeletingSubject(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}

export default SubjectsPage;
