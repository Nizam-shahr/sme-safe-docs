"""Smoke test for the FastAPI application object."""

from fastapi.testclient import TestClient

from app.main import app


def test_app_serves_openapi_schema_with_title() -> None:
    """The app starts and publishes its OpenAPI schema under the SafeDocs title."""
    client = TestClient(app)

    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert response.json()["info"]["title"] == "SafeDocs API"
