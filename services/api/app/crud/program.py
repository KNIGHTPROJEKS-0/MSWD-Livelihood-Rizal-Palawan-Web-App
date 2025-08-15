from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from ..models.program import Program
from ..models.user import Application
from ..schemas.program import ProgramCreate, ProgramUpdate, ApplicationCreate
from .base import CRUDBase


class CRUDProgram(CRUDBase[Program, ProgramCreate, ProgramUpdate]):
    async def get_multi_with_filters(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Program]:
        query = select(Program)
        
        # Apply filters
        conditions = []
        if category:
            conditions.append(Program.category == category)
        if status:
            conditions.append(Program.status == status)
        if search:
            conditions.append(
                or_(
                    Program.name.ilike(f"%{search}%"),
                    Program.description.ilike(f"%{search}%")
                )
            )
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_user_application(
        self, db: AsyncSession, *, user_id: int, program_id: int
    ) -> Optional[Application]:
        result = await db.execute(
            select(Application).where(
                and_(
                    Application.user_id == user_id,
                    Application.program_id == program_id
                )
            )
        )
        return result.scalar_one_or_none()

    async def create_application(
        self, db: AsyncSession, *, user_id: int, program_id: int
    ) -> Application:
        db_obj = Application(
            user_id=user_id,
            program_id=program_id,
            status="pending"
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_user_applications(
        self, db: AsyncSession, *, user_id: int
    ) -> List[Application]:
        result = await db.execute(
            select(Application)
            .options(selectinload(Application.program))
            .where(Application.user_id == user_id)
        )
        return result.scalars().all()

    async def get_program_applications(
        self, db: AsyncSession, *, program_id: int
    ) -> List[Application]:
        result = await db.execute(
            select(Application)
            .options(selectinload(Application.user))
            .where(Application.program_id == program_id)
        )
        return result.scalars().all()


program = CRUDProgram(Program)