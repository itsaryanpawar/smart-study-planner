def test_create_and_list_subjects(client):
    create_response = client.post(
        "/api/subjects",
        json={
            "name": "History",
            "color": "#f97316",
            "description": "Modern history revision",
        },
    )
    assert create_response.status_code == 201
    assert create_response.json()["name"] == "History"

    list_response = client.get("/api/subjects?page=1&page_size=5")
    assert list_response.status_code == 200
    payload = list_response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["color"] == "#f97316"


def test_update_and_delete_subject(client):
    create_response = client.post(
        "/api/subjects",
        json={"name": "Biology", "color": "#22c55e", "description": "Cells and systems"},
    )
    subject_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/subjects/{subject_id}",
        json={"name": "Biology Advanced", "color": "#16a34a", "description": "Updated"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Biology Advanced"

    delete_response = client.delete(f"/api/subjects/{subject_id}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/api/subjects/{subject_id}")
    assert missing_response.status_code == 404
