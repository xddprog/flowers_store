from typing import Annotated
from fastapi import APIRouter, Depends

from infrastructure.errors.base import NotFoundException
from utils.error_extra import error_response
from core.services import InterviewService
from api.v1.dependencies import get_current_user_dependency, get_interview_service
from core.dto.user import BaseUserSchema


router = APIRouter()