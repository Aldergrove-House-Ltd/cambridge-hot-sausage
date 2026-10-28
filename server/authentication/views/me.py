from django.middleware.csrf import get_token
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.serializers import UserSerializer


class MeView(APIView):
    """GET /api/v1/auth/me — Return current authenticated user."""

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        get_token(request)  # Ensure csrftoken cookie is set
        return Response(UserSerializer(request.user).data)
