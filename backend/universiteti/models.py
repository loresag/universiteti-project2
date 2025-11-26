from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ("administrator", "Administrator"),
        ("profesor", "Profesor"),
        ("student", "Student"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)


class Person(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    class Meta:
        abstract = True


class Fakulteti(models.Model):
    DIRECTIONS = [
        ("CS", "Shkenca Kompjuterike"),
        ("EN", "Anglisht"),
    ]
    emri = models.CharField(max_length=100)
    drejtimi = models.CharField(max_length=2, choices=DIRECTIONS)


class Administrator(Person):
    pozita = models.CharField(max_length=100)


class Profesori(Person):
    titulli = models.CharField(max_length=100)
    fakulteti = models.ForeignKey(Fakulteti, on_delete=models.SET_NULL, null=True)


class Studenti(Person):
    nr_indeksit = models.CharField(max_length=20, unique=True)
    fakulteti = models.ForeignKey(Fakulteti, on_delete=models.SET_NULL, null=True)


class Lenda(models.Model):
    emri = models.CharField(max_length=150)
    kodi = models.CharField(max_length=30, unique=True)
    fakulteti = models.ForeignKey(Fakulteti, on_delete=models.CASCADE)
    profesori = models.ForeignKey(Profesori, on_delete=models.SET_NULL, null=True)
    studentet = models.ManyToManyField(Studenti, blank=True)
