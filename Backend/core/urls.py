from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, DomainViewSet, SubjectViewSet, QuestionViewSet,
    AnswerViewSet, RoomViewSet, QuizQuestionViewSet, ParticipantViewSet,
    ResponseViewSet, ScoreViewSet
)
from .auth import login, register
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'domains', DomainViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'answers', AnswerViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'quiz-questions', QuizQuestionViewSet)  # Changed from 'room-questions'
router.register(r'participants', ParticipantViewSet)
router.register(r'responses', ResponseViewSet)
router.register(r'scores', ScoreViewSet)

urlpatterns = [
    path('auth/login/', login, name='login'),
    path('auth/register/', register, name='register'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]