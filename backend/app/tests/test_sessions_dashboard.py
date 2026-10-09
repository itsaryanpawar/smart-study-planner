from datetime import date


def test_prevent_overlapping_sessions(client, seeded_data):
    task_id = seeded_data["tasks"][0].id

    response = client.post(
        "/api/sessions",
        json={
            "task_id": task_id,
            "session_date": str(date.today()),
            "start_time": "10:00",
            "end_time": "11:00",
            "notes": "This should overlap",
        },
    )
    assert response.status_code == 409
    assert "overlaps" in response.json()["message"]


def test_list_sessions_and_dashboard_stats(client, seeded_data):
    response = client.get(f"/api/sessions?date={date.today()}&view=day")
    assert response.status_code == 200
    assert response.json()["total"] == 1

    stats_response = client.get("/api/dashboard/stats")
    assert stats_response.status_code == 200
    payload = stats_response.json()
    assert payload["completed_tasks"] == 1
    assert payload["pending_tasks"] == 1
    assert payload["total_study_minutes"] == 90
    assert len(payload["study_time_per_subject"]) == 2
