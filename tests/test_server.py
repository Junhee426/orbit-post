from fastapi.testclient import TestClient

from server import app

client = TestClient(app)


def test_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_index_and_assets_are_served():
    index = client.get("/")
    assert index.status_code == 200
    assert "Orbit Post Alpha" in index.text
    for path, kind in (("/game.js", "javascript"), ("/style.css", "css")):
        response = client.get(path)
        assert response.status_code == 200
        assert kind in response.headers["content-type"]


def test_unknown_path_is_404():
    assert client.get("/missing.js").status_code == 404


def test_static_files_revalidate_after_deploys():
    for path in ("/", "/game.js", "/style.css"):
        response = client.get(path)
        assert response.headers["cache-control"] == "no-cache"
        assert response.headers["x-content-type-options"] == "nosniff"
        cached = client.get(path, headers={"If-None-Match": response.headers["etag"]})
        assert cached.status_code == 304
