from fastapi import FastAPI

from infrastructure.api.routes import router

app = FastAPI(title="Finanzas API")
app.include_router(router)
