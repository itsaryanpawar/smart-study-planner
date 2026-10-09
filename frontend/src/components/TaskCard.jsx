function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const dueLabel = task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date";
  const isCompleted = task.status === "completed";

  return (
    <article className="card task-card">
      <div className="task-card-top">
        <div>
          <span className={`priority-pill ${task.priority}`}>{task.priority}</span>
          <h3>{task.title}</h3>
          <p>{task.description || "No description provided."}</p>
        </div>
        <span className={`status-pill ${task.status}`}>{task.status}</span>
      </div>

      <div className="task-meta">
        <span>
          <strong>Subject:</strong> {task.subject.name}
        </span>
        <span>
          <strong>Due:</strong> {dueLabel}
        </span>
        <span>
          <strong>Duration:</strong> {task.estimated_duration ? `${task.estimated_duration} min` : "N/A"}
        </span>
      </div>

      <div className="card-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onToggleStatus(task)}
        >
          {isCompleted ? "Reopen" : "Mark Complete"}
        </button>
        <button type="button" className="ghost-button" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="danger-button" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
