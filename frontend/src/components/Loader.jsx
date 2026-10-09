function Loader({ label = "Loading..." }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export default Loader;
