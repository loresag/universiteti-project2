from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import *
from .serializers import *

class FakultetiViewSet(viewsets.ModelViewSet):
    queryset = Fakulteti.objects.all()
    serializer_class = FakultetiSerializer
    permission_classes = [permissions.AllowAny]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer
    permission_classes = [permissions.AllowAny]

class ProfesoriViewSet(viewsets.ModelViewSet):
    queryset = Profesori.objects.all()
    serializer_class = ProfesoriSerializer
    permission_classes = [permissions.AllowAny]

class StudentiViewSet(viewsets.ModelViewSet):
    queryset = Studenti.objects.all()
    serializer_class = StudentiSerializer
    permission_classes = [permissions.AllowAny]

class LendaViewSet(viewsets.ModelViewSet):
    queryset = Lenda.objects.all()
    serializer_class = LendaSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'])
    def enroll_student(self, request, pk=None):
        """Enroll a student in a course"""
        course = self.get_object()
        student_id = request.data.get('student_id')
        
        try:
            # Try to get by Studenti ID first
            try:
                student = Studenti.objects.get(id=student_id)
            except Studenti.DoesNotExist:
                # If not found, try to get by User ID
                student = Studenti.objects.get(user_id=student_id)
            
            course.studentet.add(student)
            return Response({'status': 'student enrolled'})
        except Studenti.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def unenroll_student(self, request, pk=None):
        """Unenroll a student from a course"""
        course = self.get_object()
        student_id = request.data.get('student_id')
        
        try:
            # Try to get by Studenti ID first
            try:
                student = Studenti.objects.get(id=student_id)
            except Studenti.DoesNotExist:
                # If not found, try to get by User ID
                student = Studenti.objects.get(user_id=student_id)
            
            course.studentet.remove(student)
            return Response({'status': 'student unenrolled'})
        except Studenti.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def by_professor(self, request):
        """Get courses taught by a specific professor"""
        professor_id = request.query_params.get('professor_id')
        if professor_id:
            # Try to filter by Profesori ID first
            courses = Lenda.objects.filter(profesori_id=professor_id)
            if not courses.exists():
                # If not found, try to filter by User ID
                try:
                    profesor = Profesori.objects.get(user_id=professor_id)
                    courses = Lenda.objects.filter(profesori_id=profesor.id)
                except Profesori.DoesNotExist:
                    pass
            
            serializer = self.get_serializer(courses, many=True)
            return Response(serializer.data)
        return Response({'error': 'professor_id required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get courses enrolled by a specific student"""
        student_id = request.query_params.get('student_id')
        if student_id:
            try:
                # Try to get by Studenti ID first
                try:
                    student = Studenti.objects.get(id=student_id)
                except Studenti.DoesNotExist:
                    # If not found, try to get by User ID
                    student = Studenti.objects.get(user_id=student_id)
                
                courses = student.lenda_set.all()
                serializer = self.get_serializer(courses, many=True)
                return Response(serializer.data)
            except Studenti.DoesNotExist:
                return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'student_id required'}, status=status.HTTP_400_BAD_REQUEST)
