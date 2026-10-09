import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ProgressChart({ completed, pending, studyTimePerSubject }) {
  const summaryData = [
    { name: "Completed", value: completed, color: "#10b981" },
    { name: "Pending", value: pending, color: "#f59e0b" },
  ];

  return (
    <div className="charts-grid">
      <section className="card chart-card">
        <div className="section-heading">
          <h3>Task Completion</h3>
          <p>Completed vs active tasks</p>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={summaryData} dataKey="value" nameKey="name" outerRadius={90} label>
                {summaryData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card chart-card">
        <div className="section-heading">
          <h3>Study Time by Subject</h3>
          <p>Total scheduled minutes</p>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={studyTimePerSubject}>
              <XAxis dataKey="subject_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_minutes" radius={[8, 8, 0, 0]}>
                {studyTimePerSubject.map((entry) => (
                  <Cell key={entry.subject_id} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default ProgressChart;
