from django.db import models
from django.utils.translation import gettext_lazy as _

class Organization(models.Model):
    name = models.CharField(max_length=255, default="CUSAT Smart Waste Management")
    campus = models.CharField(max_length=255, default="Cochin University of Science and Technology")
    address = models.TextField(default="Kalamassery, South Kalamassery, Kochi, Kerala 682022")
    contact_email = models.EmailField(default="smartwaste@cusat.ac.in")
    contact_phone = models.CharField(max_length=50, default="+91 484 257 5396")
    alert_threshold_warning = models.IntegerField(default=75)
    alert_threshold_critical = models.IntegerField(default=90)
    alert_threshold_full = models.IntegerField(default=100)
    offline_timeout_minutes = models.IntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Location(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    zone = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class WasteBin(models.Model):
    class Status(models.TextChoices):
        NORMAL = 'NORMAL', _('Normal')
        WARNING = 'WARNING', _('Near Full')
        CRITICAL = 'CRITICAL', _('Critical')
        FULL = 'FULL', _('Full')
        OFFLINE = 'OFFLINE', _('Offline')

    bin_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='bins')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    fill_level = models.IntegerField(default=0)
    capacity_liters = models.IntegerField(default=240)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NORMAL)
    device_id = models.CharField(max_length=100, unique=True)
    device_status = models.CharField(max_length=20, default='ONLINE')
    battery_level = models.IntegerField(default=100)
    temperature_c = models.DecimalField(max_digits=4, decimal_places=1, default=28.0)
    last_updated = models.DateTimeField(auto_now=True)
    bin_image = models.CharField(max_length=500, blank=True)
    location_image = models.CharField(max_length=500, blank=True)
    today_collections = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.bin_id} - {self.name} ({self.fill_level}%)"
