import { useEffect, useState } from "react";

import Modal from "./Modal";

const defaultValues = {
  task_id: "",
  session_date: "",
  start_time: "",
  end_time: "",
  notes: "",
};

function SessionForm({ tasks, initialValues, selectedDate, onClose, onSubmit, submitting }) {
  const [formValues, setFormValues] = useState(defaultValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        task_id: String(initialValues.task_id || initialValues.task?.id || ""),
        session_date: initialValues.session_date || selectedDate,
        start_time: initialValues.start_time || "",
        end_time: initialValues.end_time || "",
        notes: initialValues.notes || "",
      });
      return;
    }

    setFormValues({
      ...defaultValues,
      task_id: tasks[0] ? String(tasks[0].id) : "",
      session_date: selectedDate,
    });
  }, [initialValues, selectedDate, tasks]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formValues.task_id || !formValues.session_date || !formValues.start_time || !formValues.end_time) {
      setError("Task, date, start time, and end time are required.");
      return;
    }
    if (formValues.end_time <= formValues.start_time) {
      setError("End time must be later than start time.");
      return;
    }

    await onSubmit({
      task_id: Number(formValues.task_id),
      session_date: formValues.session_date,
      start_time: formValues.start_time,
      end_time: formValues.end_time,
      notes: formValues.notes.trim() || null,
    });
  };

  return (
    <Modal title={initialValues ? "Edit Session" : "New Session"} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        {error ? <p className="form-error">{error}</p> : null}

        <label>
          Task
          <select name="task_id" value={formValues.task_id} onChange={handleChange}>
            <option value="">Select a task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            name="session_date"
            value={formValues.session_date}
            onChange={handleChange}
          />
        </label>

        <label>
          Start time
          <input
            type="time"
            name="start_time"
            value={formValues.start_time}
            onChange={handleChange}
          />
        </label>

        <label>
          End time
          <input type="time" name="end_time" value={formValues.end_time} onChange={handleChange} />
        </label>

        <label className="full-width">
          Notes
          <textarea rows="4" name="notes" value={formValues.notes} onChange={handleChange} />
        </label>

        <div className="modal-actions full-width">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Saving..." : "Save Session"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SessionForm;
