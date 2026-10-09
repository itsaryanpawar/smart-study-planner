import { useEffect, useState } from "react";

import Modal from "./Modal";

const defaultValues = {
  name: "",
  color: "#2563eb",
  description: "",
};

function SubjectForm({ initialValues, onClose, onSubmit, submitting }) {
  const [formValues, setFormValues] = useState(defaultValues);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormValues(
      initialValues
        ? {
            name: initialValues.name || "",
            color: initialValues.color || "#2563eb",
            description: initialValues.description || "",
          }
        : defaultValues
    );
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formValues.name.trim()) {
      setError("Subject name is required.");
      return;
    }

    await onSubmit({
      name: formValues.name.trim(),
      color: formValues.color,
      description: formValues.description.trim() || null,
    });
  };

  return (
    <Modal title={initialValues ? "Edit Subject" : "New Subject"} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        {error ? <p className="form-error">{error}</p> : null}

        <label>
          Name
          <input name="name" value={formValues.name} onChange={handleChange} />
        </label>

        <label>
          Color
          <input type="color" name="color" value={formValues.color} onChange={handleChange} />
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
            {submitting ? "Saving..." : "Save Subject"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SubjectForm;
