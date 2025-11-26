from django.contrib import admin
from .models import User, Administrator, Profesori, Studenti, Fakulteti, Lenda

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    search_fields = ('username', 'email')
    fields = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active', 'password')

@admin.register(Administrator)
class AdministratorAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'pozita')
    search_fields = ('user__username',)
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'

@admin.register(Profesori)
class ProfesoriAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'titulli', 'fakulteti')
    list_filter = ('fakulteti',)
    search_fields = ('user__username', 'titulli')
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'

@admin.register(Studenti)
class StudentiAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'nr_indeksit', 'fakulteti')
    list_filter = ('fakulteti',)
    search_fields = ('user__username', 'nr_indeksit')
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'

@admin.register(Fakulteti)
class FakultetiAdmin(admin.ModelAdmin):
    list_display = ('emri', 'drejtimi')
    list_filter = ('drejtimi',)
    search_fields = ('emri',)

@admin.register(Lenda)
class LendaAdmin(admin.ModelAdmin):
    list_display = ('emri', 'kodi', 'profesori', 'fakulteti')
    list_filter = ('fakulteti',)
    search_fields = ('emri', 'kodi')
    filter_horizontal = ('studentet',)
