import Modal from "./Modal";

function ConfirmDialog({ title, message, confirmLabel = "Confirm", onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
