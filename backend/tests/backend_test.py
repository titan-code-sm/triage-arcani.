"""Backend regression tests for 'Il Triage degli Arcani' API."""
import os
import uuid
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load frontend .env to get the public URL used by the app
load_dotenv(Path(__file__).parent.parent.parent / "frontend" / ".env")

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def device_id():
    # unique device id per test run so stats are deterministic
    return f"TEST_{uuid.uuid4().hex[:10]}"


# --- Root / health ---
class TestRoot:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        assert "Arcani" in r.json().get("message", "")


# --- Cards catalogue ---
class TestCards:
    def test_get_cards_returns_45(self, api_client):
        r = api_client.get(f"{API}/cards")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 45, f"Expected 45 cards, got {len(data)}"

    def test_card_shape(self, api_client):
        r = api_client.get(f"{API}/cards")
        cards = r.json()
        c0 = cards[0]
        for field in ("name", "atk", "def", "effect", "rarity", "idx"):
            assert field in c0, f"missing field {field}"
        assert c0["idx"] == 0
        assert cards[44]["idx"] == 44
        assert isinstance(c0["atk"], int)
        assert isinstance(c0["def"], int)

    def test_card_image_first(self, api_client):
        r = api_client.get(f"{API}/cards/0/image")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/jpeg")
        assert len(r.content) > 100

    def test_card_image_last(self, api_client):
        r = api_client.get(f"{API}/cards/44/image")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/jpeg")

    def test_card_image_out_of_range(self, api_client):
        r = api_client.get(f"{API}/cards/99/image")
        assert r.status_code == 404


# --- Duels + stats ---
class TestDuels:
    def _post_duel(self, api_client, device_id, result, difficulty="normal"):
        payload = {
            "device_id": device_id,
            "opponent": "L'Adepto",
            "mode": "bot",
            "difficulty": difficulty,
            "result": result,
            "turns": 12,
            "lp_player": 4000 if result != "sconfitta" else 0,
            "lp_opponent": 0 if result == "vittoria" else 4000,
        }
        return api_client.post(f"{API}/duels", json=payload)

    def test_create_duel_returns_record(self, api_client, device_id):
        r = self._post_duel(api_client, device_id, "vittoria")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("id"), "id missing in create response"
        assert body["device_id"] == device_id
        assert body["result"] == "vittoria"
        assert "created_at" in body and body["created_at"]
        # Should NOT leak _id
        assert "_id" not in body

    def test_list_duels_after_multiple_posts(self, api_client, device_id):
        # Post a mix of results
        assert self._post_duel(api_client, device_id, "sconfitta", "hard").status_code == 200
        assert self._post_duel(api_client, device_id, "pareggio", "easy").status_code == 200
        assert self._post_duel(api_client, device_id, "vittoria", "easy").status_code == 200

        r = api_client.get(f"{API}/duels/{device_id}")
        assert r.status_code == 200
        duels = r.json()
        assert isinstance(duels, list)
        # At least 4 (1 from test above + 3 here)
        assert len(duels) >= 4
        # Ordered desc by created_at
        times = [d["created_at"] for d in duels]
        assert times == sorted(times, reverse=True), "Duels should be sorted desc by created_at"
        # No _id leakage
        for d in duels:
            assert "_id" not in d
            assert d["device_id"] == device_id

    def test_stats_reflects_results(self, api_client, device_id):
        r = api_client.get(f"{API}/stats/{device_id}")
        assert r.status_code == 200
        stats = r.json()
        # From posts above: 2 wins, 1 loss, 1 draw
        assert stats["wins"] >= 2
        assert stats["losses"] >= 1
        assert stats["draws"] >= 1
        assert stats["total"] == stats["wins"] + stats["losses"] + stats["draws"]
        assert 0 <= stats["winrate"] <= 100
        # by_difficulty should have entries for the difficulties used
        by = stats["by_difficulty"]
        assert "easy" in by
        assert "hard" in by
        assert by["easy"]["wins"] >= 1
        assert by["hard"]["losses"] >= 1

    def test_stats_empty_device(self, api_client):
        empty_id = f"TEST_EMPTY_{uuid.uuid4().hex[:8]}"
        r = api_client.get(f"{API}/stats/{empty_id}")
        assert r.status_code == 200
        s = r.json()
        assert s["wins"] == 0 and s["losses"] == 0 and s["draws"] == 0
        assert s["total"] == 0
        assert s["winrate"] == 0

    def test_create_duel_validation(self, api_client):
        r = api_client.post(f"{API}/duels", json={"device_id": "x"})
        assert r.status_code in (400, 422)
