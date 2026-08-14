from django.shortcuts import render, redirect
from .models import Customer, Lead, Task
from .forms import LeadForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required


def login_view(request):

    if request.method == "POST":

        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:

            login(request, user)

            return redirect("dashboard")

        return render(
            request,
            "crm/login.html",
            {
                "error": "Invalid username or password."
            }
        )

    return render(
        request,
        "crm/login.html"
    )

def logout_view(request):

    logout(request)

    return redirect("login")

@login_required(login_url="login")
def dashboard(request):

    total_customers = Customer.objects.count()

    total_leads = Lead.objects.count()

    pending_tasks = Task.objects.filter(
        status="Pending"
    ).count()

    recent_customers = Customer.objects.order_by(
        "-created_at"
    )[:5]

    recent_leads = Lead.objects.order_by(
        "-created_at"
    )[:5]
    recent_tasks = Task.objects.order_by(
        "-created_at"
    )[:5]

    context = {
        "total_customers": total_customers,
        "total_leads": total_leads,
        "pending_tasks": pending_tasks,
        "recent_customers": recent_customers,
        "recent_leads": recent_leads,
        "recent_tasks": recent_tasks,
    }

    return render(
        request,
        "crm/dashboard.html",
        context
    )


@login_required(login_url="login")
def customer_list(request):

    search = request.GET.get("search", "")

    customers = Customer.objects.all()

    if search:
        customers = customers.filter(
            name__icontains=search
        )

    context = {
        "customers": customers,
        "search": search,
    }

    return render(
        request,
        "crm/customers.html",
        context
    )

@login_required(login_url="login")
def customer_detail(request, id):

    customer = Customer.objects.get(id=id)

    context = {
        "customer": customer,
    }

    return render(
        request,
        "crm/customer_detail.html",
        context
    )


@login_required(login_url="login")
def customer_create(request):

    if request.method == "POST":

        name = request.POST.get("name")
        email = request.POST.get("email")
        phone = request.POST.get("phone")
        company = request.POST.get("company")

        Customer.objects.create(
            name=name,
            email=email,
            phone=phone,
            company=company
        )

        return redirect("customer_list")

    return render(
        request,
        "crm/customer_form.html"
    )

@login_required(login_url="login")
def customer_edit(request, id):

    customer = Customer.objects.get(id=id)

    if request.method == "POST":

        customer.name = request.POST.get("name")
        customer.email = request.POST.get("email")
        customer.phone = request.POST.get("phone")
        customer.company = request.POST.get("company")

        customer.save()

        return redirect("customer_list")

    context = {
        "customer": customer,
    }

    return render(
        request,
        "crm/customer_edit.html",
        context
    )

@login_required(login_url="login")
def customer_delete(request, id):

    customer = Customer.objects.get(id=id)

    if request.method == "POST":

        customer.delete()

        return redirect("customer_list")

    context = {
        "customer": customer,
    }

    return render(
        request,
        "crm/customer_delete.html",
        context
    )

@login_required(login_url="login")
def lead_create(request):

    if request.method == "POST":
        form = LeadForm(request.POST)

        if form.is_valid():
            form.save()

            return redirect("lead_list")

    else:
        form = LeadForm()

    return render(
        request,
        "crm/lead_form.html",
        {"form": form}
    )


@login_required(login_url="login")
def lead_list(request):

    leads = Lead.objects.order_by("-created_at")

    context = {
        "leads": leads,
    }

    return render(
        request,
        "crm/lead_list.html",
        context
    )


@login_required(login_url="login")
def lead_detail(request, id):

    lead = Lead.objects.get(id=id)

    return render(
        request,
        "crm/lead_detail.html",
        {"lead": lead}
    )


@login_required(login_url="login")
def lead_edit(request, id):

    lead = Lead.objects.get(id=id)

    if request.method == "POST":

        lead.name = request.POST.get("name")
        lead.email = request.POST.get("email")
        lead.phone = request.POST.get("phone")
        lead.company = request.POST.get("company")
        lead.source = request.POST.get("source")
        lead.status = request.POST.get("status")
        lead.notes = request.POST.get("notes")

        lead.save()

        return redirect("lead_detail", id=lead.id)

    return render(
        request,
        "crm/lead_edit.html",
        {"lead": lead}
    )


@login_required(login_url="login")
def lead_delete(request, id):

    lead = Lead.objects.get(id=id)

    if request.method == "POST":
        lead.delete()
        return redirect("lead_list")

    return render(
        request,
        "crm/lead_delete.html",
        {"lead": lead}
    )


@login_required(login_url="login")
def task_list(request):

    tasks = Task.objects.all().order_by("-created_at")

    return render(
        request,
        "crm/tasks.html",
        {
            "tasks": tasks
        }
    )



@login_required(login_url="login")
def task_create(request):

    leads = Lead.objects.all().order_by("name")

    if request.method == "POST":

        lead_id = request.POST.get("lead")

        lead = None

        if lead_id:
            lead = Lead.objects.get(id=lead_id)

        Task.objects.create(
            lead=lead,
            title=request.POST.get("title"),
            description=request.POST.get("description"),
            due_date=request.POST.get("due_date"),
            priority=request.POST.get("priority"),
            status=request.POST.get("status"),
        )

        return redirect("task_list")

    return render(
        request,
        "crm/task_form.html",
        {
            "leads": leads
        }
    )



@login_required(login_url="login")
def task_edit(request, id):

    task = Task.objects.get(id=id)

    if request.method == "POST":

        task.title = request.POST.get("title")
        task.description = request.POST.get("description")
        task.due_date = request.POST.get("due_date")
        task.priority = request.POST.get("priority")
        task.status = request.POST.get("status")

        task.save()

        return redirect("task_list")

    return render(
        request,
        "crm/task_edit.html",
        {
            "task": task
        }
    )



@login_required(login_url="login")
def task_delete(request, id):

    task = Task.objects.get(id=id)

    if request.method == "POST":

        task.delete()

        return redirect("task_list")

    return render(
        request,
        "crm/task_delete.html",
        {
            "task": task
        }
    )



@login_required(login_url="login")
def reports(request):

    total_customers = Customer.objects.count()

    total_leads = Lead.objects.count()

    total_tasks = Task.objects.count()

    pending_tasks = Task.objects.filter(
        status="Pending"
    ).count()

    completed_tasks = Task.objects.filter(
        status="Completed"
    ).count()

    new_leads = Lead.objects.filter(
        status="New"
    ).count()

    contacted_leads = Lead.objects.filter(
        status="Contacted"
    ).count()

    qualified_leads = Lead.objects.filter(
        status="Qualified"
    ).count()

    converted_leads = Lead.objects.filter(
        status="Converted"
    ).count()

    context = {
        "total_customers": total_customers,
        "total_leads": total_leads,
        "total_tasks": total_tasks,

        "pending_tasks": pending_tasks,
        "completed_tasks": completed_tasks,

        "new_leads": new_leads,
        "contacted_leads": contacted_leads,
        "qualified_leads": qualified_leads,
        "converted_leads": converted_leads,
    }

    return render(
        request,
        "crm/reports.html",
        context
    )