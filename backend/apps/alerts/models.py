from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.bins.models import WasteBin

class Alert(models.Model):
    class AlertType(models.TextChoices):
        NEAR_FULL = 'NEAR_FULL', _('Near Full (75%)')
        CRITICAL = 'CRITICAL', _('Critical (90%)')
        FULL = 'FULL', _('Full (100%)')
        OFFLINE = 'OFFLINE_SENSOR', _('Offline / Sensor Failure')

    class Severity(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        CRITICAL = 'CRITICAL', _('Critical')

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        ACKNOWLEDGED = 'ACKNOWLEDGED', _('Acknowledged')
        RESOLVED = 'RESOLVED', _('Resolved')

    bin = models.ForeignKey(WasteBin, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=30, choices=AlertType.choices)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MEDIUM)
    fill_level = models.IntegerField()
    threshold = models.IntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_time = models.DateTimeField(auto_now_add=True)
    acknowledged_by = models.CharField(max_length=150, null=True, blank=True)
    acknowledged_time = models.DateTimeField(null=True, blank=True)
    resolved_by = models.CharField(max_length=150, null=True, blank=True)
    resolved_time = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-created_time']

    def __str__(self):
        return f"[{self.severity}] {self.bin.bin_id} - {self.alert_type} ({self.status})"
