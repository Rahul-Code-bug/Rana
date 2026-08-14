document.addEventListener("DOMContentLoaded", function () {

    const reportData = document.getElementById("report-data");

    if (!reportData) {
        return;
    }


    // ================= GET DATA FROM DJANGO =================

    const newLeads = Number(
        reportData.dataset.newLeads
    );

    const contactedLeads = Number(
        reportData.dataset.contactedLeads
    );

    const qualifiedLeads = Number(
        reportData.dataset.qualifiedLeads
    );

    const convertedLeads = Number(
        reportData.dataset.convertedLeads
    );


    const pendingTasks = Number(
        reportData.dataset.pendingTasks
    );

    const completedTasks = Number(
        reportData.dataset.completedTasks
    );


    // ================= LEAD CHART =================

    const leadCanvas = document.getElementById("leadChart");

    if (leadCanvas) {

        new Chart(leadCanvas, {

            type: "doughnut",

            data: {

                labels: [
                    "New",
                    "Contacted",
                    "Qualified",
                    "Converted"
                ],

                datasets: [

                    {

                        data: [
                            newLeads,
                            contactedLeads,
                            qualifiedLeads,
                            convertedLeads
                        ]

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        });

    }


    // ================= TASK CHART =================

    const taskCanvas = document.getElementById("taskChart");

    if (taskCanvas) {

        new Chart(taskCanvas, {

            type: "bar",

            data: {

                labels: [
                    "Pending",
                    "Completed"
                ],

                datasets: [

                    {

                        label: "Tasks",

                        data: [
                            pendingTasks,
                            completedTasks
                        ]

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        }

                    }

                },

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

    }

});