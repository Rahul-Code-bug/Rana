from django import forms
from .models import Lead


class LeadForm(forms.ModelForm):

    class Meta:
        model = Lead

        fields = [
            "name",
            "email",
            "phone",
            "company",
            "source",
            "status",
            "notes",
        ]

        widgets = {
            "name": forms.TextInput(attrs={
                "placeholder": "Lead name"
            }),

            "email": forms.EmailInput(attrs={
                "placeholder": "Email address"
            }),

            "phone": forms.TextInput(attrs={
                "placeholder": "Phone number"
            }),

            "company": forms.TextInput(attrs={
                "placeholder": "Company name"
            }),

            "source": forms.TextInput(attrs={
                "placeholder": "e.g. Website, Facebook, Referral"
            }),

            "notes": forms.Textarea(attrs={
                "placeholder": "Lead notes...",
                "rows": 5
            }),
        }