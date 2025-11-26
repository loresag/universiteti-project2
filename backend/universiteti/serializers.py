from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "first_name", "last_name", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def validate_password(self, value):
        """Ensure password is provided during creation"""
        if not value and not self.instance:  # Create operation
            raise serializers.ValidationError("Password is required when creating a new user")
        return value

class FakultetiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fakulteti
        fields = "__all__"

class AdministratorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Administrator
        fields = ["id", "user", "user_id", "phone", "address", "pozita"]
        read_only_fields = ["id"]

class ProfesoriSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    fakulteti = FakultetiSerializer(read_only=True)
    fakulteti_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Profesori
        fields = ["id", "user", "user_id", "phone", "address", "titulli", "fakulteti", "fakulteti_id"]
        read_only_fields = ["id"]

class StudentiSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    fakulteti = FakultetiSerializer(read_only=True)
    fakulteti_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Studenti
        fields = ["id", "user", "user_id", "phone", "address", "nr_indeksit", "fakulteti", "fakulteti_id"]
        read_only_fields = ["id"]

class LendaSerializer(serializers.ModelSerializer):
    profesori = ProfesoriSerializer(read_only=True)
    profesori_id = serializers.IntegerField(write_only=True, required=False)
    fakulteti = FakultetiSerializer(read_only=True)
    fakulteti_id = serializers.IntegerField(write_only=True, required=False)
    studentet = StudentiSerializer(read_only=True, many=True)

    class Meta:
        model = Lenda
        fields = ["id", "emri", "kodi", "fakulteti", "fakulteti_id", "profesori", "profesori_id", "studentet"]
        read_only_fields = ["id", "studentet"]
