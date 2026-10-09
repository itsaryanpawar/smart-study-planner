import { useEffect, useState } from "react";

import Loader from "../components/Loader";
import ProgressChart from "../components/ProgressChart";
import { fetchDashboardStats } from "../services/dashboard";
import { getErrorMessage } from "../services/api";

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError("");
        const response = await fetchDashboardStats();
        setStats(response);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  if (error) {
    return <div className="state-card error-state">{error}</div>;
  }

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <article className="stat-card">
          <span>Completed Tasks</span>
          <strong>{stats.completed_tasks}</strong>
        </article>
        <article className="stat-card">
          <span>Pending Tasks</span>
          <strong>{stats.pending_tasks}</strong>
        </article>
        <article className="stat-card">
          <span>Completion Rate</span>
          <strong>{stats.completion_percentage}%</strong>
        </article>
        <article className="stat-card">
          <span>Total Study Time</span>
          <strong>{stats.total_study_minutes} min</strong>
        </article>
      </section>

      <ProgressChart
        completed={stats.completed_tasks}
        pending={stats.pending_tasks}
        studyTimePerSubject={stats.study_time_per_subject}
      />

      <section className="dashboard-columns">
        <div className="card">
          <div className="section-heading">
            <h3>Today's Tasks</h3>
            <p>Tasks due today</p>
          </div>
          {stats.today_tasks.length ? (
            <div className="list-stack">
              {stats.today_tasks.map((task) => (
                <div key={task.id} className="list-item">
                  <strong>{task.title}</strong>
                  <span>{task.subject.name}</span>
                  <span>{task.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No tasks due today.</div>
          )}
        </div>

        <div className="card">
          <div className="section-heading">
            <h3>Today's Sessions</h3>
            <p>Scheduled study blocks</p>
          </div>
          {stats.today_sessions.length ? (
            <div className="list-stack">
              {stats.today_sessions.map((session) => (
                <div key={session.id} className="list-item">
                  <strong>{session.task.title}</strong>
                  <span>
                    {session.start_time} - {session.end_time}
                  </span>
                  <span>{session.task.subject.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No sessions scheduled today.</div>
          )}
        </div>
      </section>

      <section className="dashboard-columns">
        <div className="card">
          <div className="section-heading">
            <h3>Upcoming Deadlines</h3>
            <p>Due in the next 7 days</p>
          </div>
          {stats.upcoming_deadlines.length ? (
            <div className="list-stack">
              {stats.upcoming_deadlines.map((task) => (
                <div key={task.id} className="list-item">
                  <strong>{task.title}</strong>
                  <span>{task.subject.name}</span>
                  <span>{task.due_date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No upcoming deadlines.</div>
          )}
        </div>

        <div className="card">
          <div className="section-heading">
            <h3>Overdue Tasks</h3>
            <p>Tasks that still need attention</p>
          </div>
          {stats.overdue_tasks.length ? (
            <div className="list-stack">
              {stats.overdue_tasks.map((task) => (
                <div key={task.id} className="list-item">
                  <strong>{task.title}</strong>
                  <span>{task.subject.name}</span>
                  <span>{task.due_date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No overdue tasks right now.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
