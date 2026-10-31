from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import ChatMessage
from app.schemas.chat_schema import FeedbackRequest, FeedbackResponse

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse)
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    msg = db.query(ChatMessage).filter(ChatMessage.id == req.message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message record not found")
        
    msg.feedback_rating = req.rating
    if req.comment:
        msg.feedback_comment = req.comment
    if req.flagged is not None:
        msg.feedback_flagged = req.flagged
        
    db.commit()
    
    return FeedbackResponse(
        status="success",
        message="Thank you! Your feedback has been recorded to improve Department of Justice knowledge accuracy."
    )
