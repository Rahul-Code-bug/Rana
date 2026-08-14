import os

from django.core.mail import EmailMessage
from django.shortcuts import render, redirect

from .models import ContactMessage


def home(request):

    if request.method == "POST":

        name = request.POST.get("name")
        email = request.POST.get("email")
        subject = request.POST.get("subject")
        message = request.POST.get("message")

        # Save message to database
        ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message
        )

        # Send email notification
        email_message = EmailMessage(
            subject=f"New Portfolio Contact: {subject}",

            body=f"""
You received a new message from your portfolio website.

Name: {name}
Email: {email}
Subject: {subject}

Message:

{message}
""",

            from_email=os.getenv("EMAIL_HOST_USER"),

            to=[
                os.getenv("EMAIL_HOST_USER")
            ],

            reply_to=[
                email
            ],
        )

        email_message.send(fail_silently=False)

        return redirect("/#contact")

    return render(request, "portfolio/index.html")