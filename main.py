
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import logging
from rag_logic import RAGPipeline

# Initialize FastAPI app
app = FastAPI(
    title="FUUAST AI Academic Assistant Backend",
    description="Backend API for Retrieval-Augmented Generation (RAG) prototype",
    version="1.0.0"
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("system_logs.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("FUUAST-API")

# Data models
class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = "guest_session"

class KnowledgeSource(BaseModel):
    id: str
    category: str
    content: str
    sourceDocument: str
    pageNumber: int
    confidence_score: float

class QueryResponse(BaseModel):
    status: str
    timestamp: str
    context: List[KnowledgeSource]
    query_tokens: int

# Initialize the RAG Pipeline
# In production, this would load from a vector database or JSON store
rag = RAGPipeline(data_source="knowledge_base.json")

@app.get("/")
async def health_check():
    return {"status": "online", "system": "FUUAST Academic AI", "version": "1.0.0"}

@app.post("/api/v1/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    """
    Main endpoint for processing student queries.
    Performs: Preprocessing -> Semantic Search -> Context Retrieval
    """
    logger.info(f"Processing query from session {request.session_id}: {request.query}")
    
    try:
        # Step 1: Execute RAG Pipeline
        relevant_docs = rag.search(request.query, top_k=3)
        
        # Step 2: Prepare response
        return QueryResponse(
            status="success",
            timestamp=datetime.now().isoformat(),
            context=relevant_docs,
            query_tokens=len(request.query.split())
        )
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error during context retrieval")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
