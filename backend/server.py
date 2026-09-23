import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, Field, field_validator

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Static card data + artwork shipped with the backend
CARDS: list = json.loads((ROOT_DIR / "data" / "cards.json").read_text(encoding="utf-8"))
for i, c in enumerate(CARDS):
    c["idx"] = i
IMAGES_DIR = ROOT_DIR / "assets" / "cards"


def _str_oid(v):
    return str(v)


PyObjectId = Annotated[str, BeforeValidator(_str_oid)]


class BaseDocument(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    model_config = {"populate_by_name": True}

    def to_mongo(self) -> dict:
        d = self.model_dump(by_alias=True, exclude_none=True)
        if d.get("_id") is None:
            d.pop("_id", None)
        return d

    @classmethod
    def from_mongo(cls, doc: Optional[dict]):
        if not doc:
            return None
        d = dict(doc)
        if d.get("_id") is not None:
            d["_id"] = str(d["_id"])
        return cls.model_validate(d)


class DuelCreate(BaseModel):
    device_id: str = Field(min_length=1, max_length=64)
    opponent: str = Field(min_length=1, max_length=60)
    mode: str = Field(max_length=16)
    difficulty: str = Field(max_length=16)
    result: str = Field(max_length=16)
    turns: int = Field(ge=0, le=5000)
    lp_player: int = Field(ge=0, le=1000000)
    lp_opponent: int = Field(ge=0, le=1000000)

    @field_validator("result")
    @classmethod
    def _valid_result(cls, v: str) -> str:
        if v not in ("vittoria", "sconfitta", "pareggio"):
            raise ValueError("result non valido")
        return v

    @field_validator("mode")
    @classmethod
    def _valid_mode(cls, v: str) -> str:
        if v not in ("bot", "hotseat", "online"):
            raise ValueError("mode non valido")
        return v


class DuelRecord(BaseDocument):
    device_id: str
    opponent: str
    mode: str
    difficulty: str
    result: str
    turns: int
    lp_player: int
    lp_opponent: int
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


@api_router.get("/")
async def root():
    return {"message": "Il Triage degli Arcani API"}


@api_router.get("/cards")
async def get_cards():
    return CARDS


@api_router.get("/cards/{idx}/image")
async def get_card_image(idx: int):
    if idx < 0 or idx >= len(CARDS):
        raise HTTPException(status_code=404, detail="Carta non trovata")
    path = IMAGES_DIR / f"card_{idx}.jpg"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Immagine non trovata")
    return FileResponse(
        path,
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


@api_router.post("/duels", response_model=DuelRecord, response_model_by_alias=False)
async def create_duel(input: DuelCreate):
    rec = DuelRecord(**input.model_dump())
    doc = rec.to_mongo()
    res = await db.duel_records.insert_one(doc)
    rec.id = str(res.inserted_id)
    return rec


@api_router.get(
    "/duels/{device_id}",
    response_model=List[DuelRecord],
    response_model_by_alias=False,
)
async def list_duels(device_id: str):
    if len(device_id) > 64:
        raise HTTPException(status_code=400, detail="device_id non valido")
    docs = (
        await db.duel_records.find({"device_id": device_id})
        .sort("created_at", -1)
        .to_list(50)
    )
    return [DuelRecord.from_mongo(d) for d in docs]


@api_router.get("/stats/{device_id}")
async def get_stats(device_id: str):
    if len(device_id) > 64:
        raise HTTPException(status_code=400, detail="device_id non valido")
    docs = await db.duel_records.find({"device_id": device_id}).to_list(2000)
    wins = losses = draws = 0
    by: dict = {}
    for d in docs:
        result = d.get("result")
        diff = d.get("difficulty") or "normal"
        by.setdefault(diff, {"wins": 0, "losses": 0})
        if result == "vittoria":
            wins += 1
            by[diff]["wins"] += 1
        elif result == "sconfitta":
            losses += 1
            by[diff]["losses"] += 1
        else:
            draws += 1
    total = wins + losses + draws
    return {
        "wins": wins,
        "losses": losses,
        "draws": draws,
        "total": total,
        "winrate": round(wins / total * 100) if total else 0,
        "by_difficulty": by,
    }


app.include_router(api_router)

app.add_middleware(
    __import__("starlette.middleware.cors", fromlist=["CORSMiddleware"]).CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
