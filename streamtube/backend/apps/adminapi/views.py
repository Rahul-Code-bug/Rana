from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.comments.models import Comment, Report
from apps.videos.models import Video, Category
from .permissions import IsAdminStaff
from .serializers import (
    AdminUserSerializer, AdminVideoSerializer, AdminCommentSerializer,
    AdminReportSerializer, AdminCategorySerializer,
)

User = get_user_model()


# --- Users -----------------------------------------------------------------

class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminStaff]

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(username__icontains=q) | qs.filter(email__icontains=q)
        return qs


class AdminUserDetailView(APIView):
    """PATCH {is_disabled, is_staff} to toggle account status/permissions. DELETE removes the account."""
    permission_classes = [IsAdminStaff]

    def patch(self, request, pk):
        user = generics.get_object_or_404(User, pk=pk)
        for field in ('is_disabled', 'is_staff'):
            if field in request.data:
                setattr(user, field, bool(request.data[field]))
        user.save()
        return Response(AdminUserSerializer(user).data)

    def delete(self, request, pk):
        User.objects.filter(pk=pk).exclude(pk=request.user.pk).delete()
        return Response(status=204)


# --- Videos ------------------------------------------------------------------

class AdminVideoListView(generics.ListAPIView):
    serializer_class = AdminVideoSerializer
    permission_classes = [IsAdminStaff]

    def get_queryset(self):
        qs = Video.objects.select_related('channel').all().order_by('-created_at')
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(title__icontains=q)
        return qs


class AdminVideoDetailView(APIView):
    """PATCH {visibility} to remove/hide a video. DELETE removes it entirely."""
    permission_classes = [IsAdminStaff]

    def patch(self, request, pk):
        video = generics.get_object_or_404(Video, pk=pk)
        if 'visibility' in request.data:
            video.visibility = request.data['visibility']
            video.save(update_fields=['visibility'])
        return Response(AdminVideoSerializer(video).data)

    def delete(self, request, pk):
        Video.objects.filter(pk=pk).delete()
        return Response(status=204)


# --- Comments ----------------------------------------------------------------

class AdminCommentListView(generics.ListAPIView):
    serializer_class = AdminCommentSerializer
    permission_classes = [IsAdminStaff]
    queryset = Comment.objects.select_related('user', 'video').order_by('-created_at')


class AdminCommentDeleteView(APIView):
    permission_classes = [IsAdminStaff]

    def delete(self, request, pk):
        comment = generics.get_object_or_404(Comment, pk=pk)
        comment.is_deleted = True
        comment.text = ''
        comment.save(update_fields=['is_deleted', 'text'])
        return Response(status=204)


# --- Reports -------------------------------------------------------------------

class AdminReportListView(generics.ListAPIView):
    serializer_class = AdminReportSerializer
    permission_classes = [IsAdminStaff]

    def get_queryset(self):
        qs = Report.objects.select_related('reporter').order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class AdminReportResolveView(APIView):
    """POST {action: 'resolve'|'reject', remove_content: bool}"""
    permission_classes = [IsAdminStaff]

    def post(self, request, pk):
        report = generics.get_object_or_404(Report, pk=pk)
        action = request.data.get('action')
        if action not in ('resolve', 'reject'):
            return Response({'detail': 'action must be resolve or reject'}, status=400)

        report.status = 'resolved' if action == 'resolve' else 'rejected'
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        report.admin_notes = request.data.get('admin_notes', '')
        report.save()

        if action == 'resolve' and request.data.get('remove_content'):
            if report.video_id:
                report.video.visibility = 'private'
                report.video.save(update_fields=['visibility'])
            if report.comment_id:
                report.comment.is_deleted = True
                report.comment.text = ''
                report.comment.save(update_fields=['is_deleted', 'text'])

        return Response(AdminReportSerializer(report).data)


# --- Categories (Homepage CMS) ------------------------------------------------

class AdminCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminStaff]
    queryset = Category.objects.all().order_by('order')


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminStaff]
    queryset = Category.objects.all()
