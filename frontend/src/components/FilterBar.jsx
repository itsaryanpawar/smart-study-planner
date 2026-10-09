function FilterBar({ filters, subjects, onChange, onReset }) {
  return (
    <section className="card filter-bar">
      <label>
        Search
        <input
          name="search"
          placeholder="Search by task title"
          value={filters.search}
          onChange={onChange}
        />
      </label>

      <label>
        Subject
        <select name="subject_id" value={filters.subject_id} onChange={onChange}>
          <option value="">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Status
        <select name="status" value={filters.status} onChange={onChange}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>

      <label>
        Priority
        <select name="priority" value={filters.priority} onChange={onChange}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label>
        Due from
        <input type="date" name="due_from" value={filters.due_from} onChange={onChange} />
      </label>

      <label>
        Due to
        <input type="date" name="due_to" value={filters.due_to} onChange={onChange} />
      </label>

      <label>
        Sort by
        <select name="sort_by" value={filters.sort_by} onChange={onChange}>
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </label>

      <label>
        Order
        <select name="sort_order" value={filters.sort_order} onChange={onChange}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>

      <div className="filter-actions">
        <button type="button" className="ghost-button" onClick={onReset}>
          Reset Filters
        </button>
      </div>
    </section>
  );
}

export default FilterBar;
