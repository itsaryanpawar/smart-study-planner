def test_filter_search_and_sort_tasks(client, seeded_data):
    subject_id = seeded_data["subjects"][0].id

    response = client.get(
        f"/api/tasks?subject_id={subject_id}&search=derivatives&sort_by=priority&sort_order=desc"
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["title"] == "Review derivatives"


def test_create_update_and_patch_task_status(client, seeded_data):
    subject_id = seeded_data["subjects"][1].id

    create_response = client.post(
        "/api/tasks",
        json={
            "title": "Lab report outline",
            "description": "Prepare the report structure",
            "subject_id": subject_id,
            "priority": "low",
            "status": "pending",
            "due_date": "2026-10-15",
            "estimated_duration": 45,
        },
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/tasks/{task_id}",
        json={"priority": "high", "estimated_duration": 75},
    )
    assert update_response.status_code == 200
    assert update_response.json()["priority"] == "high"

    patch_response = client.patch(f"/api/tasks/{task_id}/status", json={"status": "completed"})
    assert patch_response.status_code == 200
    assert patch_response.json()["status"] == "completed"
