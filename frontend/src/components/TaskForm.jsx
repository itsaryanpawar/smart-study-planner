import { useEffect, useState } from "react";

import Modal from "./Modal";

const defaultValues = {
  title: "",
  description: "",
  subject_id: "",
  priority: "medium",
  status: "pending",
  due_date: "",
  estimated_duration: "",
};

function TaskForm({ subjects, initialValues, onClose, onSubmit, submitting }) {
  const [formValues, setFormValues] = useState(defaultValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        title: initialValues.title || "",
        description: initialValues.description || "",
        subject_id: String(initialValues.subject_id || ""),
        priority: initialValues.priority || "medium",
        status: initialValues.status || "pending",
        due_date: initialValues.due_date || "",
        estimated_duration: initialValues.estimated_duration
          ? String(initialValues.estimated_duration)
          : "",
      });
      return;
    }

    setFormValues((current) => ({
      ...defaultValues,
      subject_id: subjects[0] ? String(subjects[0].id) : "",
    }));
  }, [initialValues, subjects]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formValues.title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (!formValues.subject_id) {
      setError("Please select a subject.");
      return;
    }

    await onSubmit({
      title: formValues.title.trim(),
      description: formValues.description.trim() || null,
      subject_id: Number(formValues.subject_id),
      priority: formValues.priority,
      status: formValues.status,
      due_date: formValues.due_date || null,
      estimated_duration: formValues.estimated_duration
        ? Number(formValues.estimated_duration)
        : null,
    });
  };

  return (
    <Modal title={initialValues ? "Edit Task" : "New Task"} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        {error ? <p className="form-error">{error}</p> : null}

        <label>
          Title
          <input name="title" value={formValues.title} onChange={handleChange} />
        </label>

        <label>
          Subject
          <select name="subject_id" value={formValues.subject_id} onChange={handleChange}>
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Priority
          <select name="priority" value={formValues.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label>
          Status
          <select name="status" value={formValues.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label>
          Due date
          <input type="date" name="due_date" value={formValues.due_date} onChange={handleChange} />
        </label>

        <label>
          Estimated duration (minutes)
          <input
            type="number"
            min="1"
            name="estimated_duration"
            value={formValues.estimated_duration}
            onChange={handleChange}
          />
        </label>

        <label className="full-width">
          Description
          <textarea
            rows="4"
            name="description"
            value={formValues.description}
            onChange={handleChange}
          />
        </label>

        <div className="modal-actions full-width">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Saving..." : "Save Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskForm;
