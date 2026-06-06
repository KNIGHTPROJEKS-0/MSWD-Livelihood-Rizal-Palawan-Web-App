from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

from app.core.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()


class MessageCreate(BaseModel):
    receiver_id: int
    content: str


def msg_to_dict(m, sender=None, receiver=None):
    return {
        "id": m.id,
        "sender_id": m.sender_id,
        "sender_name": f"{sender.first_name or ''} {sender.last_name or ''}".strip() or (sender.email if sender else None),
        "sender_role": sender.role if sender else None,
        "receiver_id": m.receiver_id,
        "receiver_name": f"{receiver.first_name or ''} {receiver.last_name or ''}".strip() or (receiver.email if receiver else None),
        "receiver_role": receiver.role if receiver else None,
        "content": m.content,
        "is_read": m.is_read,
        "created_at": str(m.created_at) if m.created_at else None,
    }


@router.get("/staff")
def list_staff(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.user import User
    staff = db.query(User).filter(
        User.role.in_(["admin", "superadmin"]),
        User.is_active == True,
    ).all()
    return [
        {
            "id": s.id,
            "name": f"{s.first_name or ''} {s.last_name or ''}".strip() or s.email,
            "role": s.role,
        }
        for s in staff
    ]


@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.message import Message
    from app.models.user import User

    sent_ids = [r[0] for r in db.query(Message.receiver_id).filter(Message.sender_id == current_user.id).distinct().all()]
    recv_ids = [r[0] for r in db.query(Message.sender_id).filter(Message.receiver_id == current_user.id).distinct().all()]
    partner_ids = list(set(sent_ids + recv_ids))

    conversations = []
    for pid in partner_ids:
        partner = db.query(User).filter(User.id == pid).first()
        if not partner:
            continue
        last_msg = db.query(Message).filter(
            or_(
                (Message.sender_id == current_user.id) & (Message.receiver_id == pid),
                (Message.sender_id == pid) & (Message.receiver_id == current_user.id),
            )
        ).order_by(Message.created_at.desc()).first()

        unread = db.query(Message).filter(
            Message.sender_id == pid,
            Message.receiver_id == current_user.id,
            Message.is_read == False,
        ).count()

        conversations.append({
            "partner_id": pid,
            "partner_name": f"{partner.first_name or ''} {partner.last_name or ''}".strip() or partner.email,
            "partner_role": partner.role,
            "last_message": (last_msg.content[:80] + "...") if last_msg and len(last_msg.content) > 80 else (last_msg.content if last_msg else None),
            "last_message_at": str(last_msg.created_at) if last_msg else None,
            "unread_count": unread,
        })

    conversations.sort(key=lambda x: x["last_message_at"] or "", reverse=True)
    return conversations


@router.get("/with/{partner_id}")
def get_conversation(partner_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.message import Message
    from app.models.user import User

    msgs = db.query(Message).filter(
        or_(
            (Message.sender_id == current_user.id) & (Message.receiver_id == partner_id),
            (Message.sender_id == partner_id) & (Message.receiver_id == current_user.id),
        )
    ).order_by(Message.created_at.asc()).all()

    unread = db.query(Message).filter(
        Message.sender_id == partner_id,
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).all()
    for m in unread:
        m.is_read = True
    if unread:
        db.commit()

    result = []
    for m in msgs:
        sender = db.query(User).filter(User.id == m.sender_id).first()
        receiver = db.query(User).filter(User.id == m.receiver_id).first()
        result.append(msg_to_dict(m, sender, receiver))
    return result


@router.post("/")
def send_message(data: MessageCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.message import Message
    from app.models.user import User

    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    msg = Message(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        content=data.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg_to_dict(msg, current_user, receiver)


@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.message import Message
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).count()
    return {"unread_count": count}
