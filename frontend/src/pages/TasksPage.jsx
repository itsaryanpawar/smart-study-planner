import { useEffect, useMemo, useState } from "react";

import ConfirmDialog from "../components/ConfirmDialog";
import FilterBar from "../components/FilterBar";
import Loader from "../components/Loader";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import { useToast } from "../context/ToastContext";
import useDebounce from "../hooks/useDebounce";
import { getErrorMessage } from "../services/api";
import { fetchSubjects } from "../services/subjects";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  updateTaskStatus,
} from "../services/tasks";

const initialFilters = {
  search: "",
  subject_id: "",
  status: "",
  priority: "",
  due_from: "",
  due_to: "",
  sort_by: "due_date",
  sort_order: "asc",
};

function TasksPage() {
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [tasksPayload, setTasksPayload] = useState({
    items: [],
    total: 0,
    page: 1,
    page_size: 6,
    total_pages: 1,
  });
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const debouncedSearch = useDebounce(filters.search);

  const queryParams = useMemo(
    () => ({
      page: tasksPayload.page,
      page_size: tasksPayload.page_size,
      subject_id: filters.subject_id || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      due_from: filters.due_from || undefined,
      due_to: filters.due_to || undefined,
      search: debouncedSearch || undefined,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    }),
    [debouncedSearch, filters, tasksPayload.page, tasksPayload.page_size]
  );

  const loadSubjects = async () => {
    const response = await fetchSubjects({ page: 1, page_size: 100 });
    setSubjects(response.items);
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchTasks(queryParams);
      setTasksPayload((current) => ({
        ...current,
        ...response,
      }));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function bootstrap() {
      try {
        await loadSubjects();
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [queryParams]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setTasksPayload((current) => ({ ...current, page: 1 }));
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleResetFilters = () => {
    setTasksPayload((current) => ({ ...current, page: 1 }));
    setFilters(initialFilters);
  };

  const handleSubmitTask = async (payload) => {
    try {
      setSaving(true);
      if (editingTask) {
        await updateTask(editingTask.id, payload);
        addToast("Task updated successfully.");
      } else {
        await createTask(payload);
        addToast("Task created successfully.");
      }
      setIsFormOpen(false);
      setEditingTask(null);
      await loadTasks();
    } catch (requestError) {
      addToast(getErrorMessage(requestError), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(deletingTask.id);
      addToast("Task deleted successfully.");
      setDeletingTask(null);
      await loadTasks();
    } catch (requestError) {
      addToast(getErrorMessage(requestError), "error");
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateTaskStatus(task.id, nextStatus);
      addToast(`Task marked as ${nextStatus}.`);
      await loadTasks();
    } catch (requestError) {
      addToast(getErrorMessage(requestError), "error");
    }
  };

  return (
    <div className="page-grid">
      <section className="page-header-row">
        <div>
          <h2>Tasks</h2>
          <p>Track, filter, and update your study workload.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          disabled={!subjects.length}
        >
          Add Task
        </button>
      </section>

      {!subjects.length && !loading ? (
        <div className="state-card">Create at least one subject before adding tasks.</div>
      ) : null}

      <FilterBar
        filters={filters}
        subjects={subjects}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {loading ? <Loader label="Loading tasks..." /> : null}
      {error ? <div className="state-card error-state">{error}</div> : null}

      {!loading && !error ? (
        <>
          {tasksPayload.items.length ? (
            <div className="card-grid">
              {tasksPayload.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(selectedTask) => {
                    setEditingTask(selectedTask);
                    setIsFormOpen(true);
                  }}
                  onDelete={setDeletingTask}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state card">No tasks match the current filters.</div>
          )}

          <div className="pagination-bar">
            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                setTasksPayload((current) => ({ ...current, page: Math.max(1, current.page - 1) }))
              }
              disabled={tasksPayload.page === 1}
            >
              Previous
            </button>
            <span>
              Page {tasksPayload.page} of {tasksPayload.total_pages}
            </span>
            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                setTasksPayload((current) => ({
                  ...current,
                  page: Math.min(current.total_pages, current.page + 1),
                }))
              }
              disabled={tasksPayload.page === tasksPayload.total_pages}
            >
              Next
            </button>
          </div>
        </>
      ) : null}

      {isFormOpen ? (
        <TaskForm
          subjects={subjects}
          initialValues={editingTask}
          onClose={() => {
            setEditingTask(null);
            setIsFormOpen(false);
          }}
          onSubmit={handleSubmitTask}
          submitting={saving}
        />
      ) : null}

      {deletingTask ? (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${deletingTask.title}"?`}
          confirmLabel="Delete"
          onClose={() => setDeletingTask(null)}
          onConfirm={handleDeleteTask}
        />
      ) : null}
    </div>
  );
}

export default TasksPage;
