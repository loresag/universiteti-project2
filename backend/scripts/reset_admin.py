from universiteti.models import User

u = User.objects.filter(username='admin').first()
if u:
    u.set_password('admin123')
    u.role = 'administrator'
    u.is_superuser = True
    u.is_staff = True
    u.save()
    print('Updated existing admin password to admin123')
else:
    User.objects.create_superuser(username='admin', email='admin@example.com', password='admin123', role='administrator')
    print('Created admin user admin/admin123')
