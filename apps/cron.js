function scheduler() {
  createWindow(
    "Scheduler",
    `
        <div class="scheduler">
            <div class="form-container">
                <form id="schedulerForm">
                    <div class="form-group">
                        <label for="jobName">Job Name</label>
                        <input type="text" id="jobName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="command">Command/Script</label>
                        <textarea id="command" required></textarea>
                    </div>
                    
                    <div class="cron-inputs">
                        <div class="form-group cron-field">
                            <label for="second">Second</label>
                            <input type="text" id="second" placeholder="0-59" value="0">
                        </div>
                        
                        <div class="form-group cron-field">
                            <label for="minute">Minute</label>
                            <input type="text" id="minute" placeholder="0-59" value="*">
                        </div>
                        
                        <div class="form-group cron-field">
                            <label for="hour">Hour</label>
                            <input type="text" id="hour" placeholder="0-23" value="*">
                        </div>
                        
                        <div class="form-group cron-field">
                            <label for="day">Day</label>
                            <input type="text" id="day" placeholder="1-31" value="*">
                        </div>
                        
                        <div class="form-group cron-field">
                            <label for="month">Month</label>
                            <input type="text" id="month" placeholder="1-12" value="*">
                        </div>
                        
                        <div class="form-group cron-field">
                            <label for="weekday">Weekday</label>
                            <input type="text" id="weekday" placeholder="0-6" value="*">
                        </div>
                    </div>
                    
                    <div class="cron-preview">
                        <span>Cron Expression:</span>
                        <code id="cronPreview">0 * * * * *</code>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Add Job</button>
                    </div>
                </form>
            </div>
            
            <div class="quick-templates">
                <div class="templates-title">Quick Templates</div>
                <div class="templates-grid">
                    <button class="template-btn" data-template="0 */30 * * * *">Every 30 minutes</button>
                    <button class="template-btn" data-template="0 0 * * * *">Daily at midnight</button>
                    <button class="template-btn" data-template="0 0 12 * * *">Daily at noon</button>
                    <button class="template-btn" data-template="0 0 0 * * 1">Weekly on Monday</button>
                    <button class="template-btn" data-template="0 0 0 1 * *">Monthly (1st day)</button>
                </div>
            </div>
            
            <div class="jobs-container">
                <div class="table-header">
                    <h3>Scheduled Jobs</h3>
                    <button id="refreshBtn" class="btn btn-secondary">Refresh</button>
                </div>
                <div class="table-container">
                    <table class="jobs-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Schedule</th>
                                <th>Command</th>
                                <th>Next Run</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="jobsTableBody">
                            <tr>
                                <td colspan="6" class="loading-cell">Loading jobs...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <style>
            .scheduler {
                color: var(--text);
                padding: 16px;
                max-width: 100%;
            }
            
            .form-container {
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid var(--border);
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                font-size: 14px;
            }
            
            textarea {
                min-height: 80px;
                resize: vertical;
            }
			
            .cron-inputs {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-bottom: 15px;
            }
            
            .cron-field {
                flex: 1;
                min-width: 80px;
            }
            
            .cron-preview {
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .cron-preview code {
                font-family: monospace;
                color: var(--accent);
                font-size: 14px;
            }
            
            .form-actions {
                display: flex;
                justify-content: flex-end;
            }
            
            .quick-templates {
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                border: 1px solid var(--border);
            }
            
            .templates-title {
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 10px;
            }
            
            .templates-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .template-btn {
                border: 1px solid var(--border);
                color: var(--text);
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s ease;
            }
            
            .template-btn:hover {
                background-color: var(--accent);
                border-color: var(--accent);
            }
            
            .btn {
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
            }
            
            .btn-primary {
                background-color: var(--accent);
                color: var(--window-bg);
            }
            
            .btn-primary:hover {
                background-color: var(--accent);
                box-shadow: 0 0 8px rgba(137, 180, 250, 0.5);
            }
            
            .btn-secondary {
                background-color: var(--windowbg);
                color: var(--accent);
                border: 1px solid var(--accent);
            }
            
            .btn-secondary:hover {
                background-color: var(--accent);
				color: var(--windowbg);
            }
            
            .btn-danger {
                background-color: #f38ba8;
                color: var(--window-bg);
            }
            
            .btn-danger:hover {
                background-color: #f5a9be;
                box-shadow: 0 0 8px rgba(243, 139, 168, 0.5);
            }
            
            .jobs-container {
                border-radius: 8px;
                border: 1px solid var(--border);
                overflow: hidden;
            }
            
            .table-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 16px;
                border-bottom: 1px solid var(--border);
            }
            
            .table-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
            }
            
            .table-container {
                overflow-x: auto;
            }
            
            .jobs-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
            }
            
            .jobs-table th {
                padding: 12px 16px;
                font-weight: 600;
                font-size: 14px;
            }
            
            .jobs-table td {
                padding: 10px 16px;
                border-bottom: 1px solid var(--border);
                font-size: 14px;
            }
            
            .jobs-table tr:last-child td {
                border-bottom: none;
            }
            
            .loading-cell {
                text-align: center;
                padding: 20px !important;
                color: var(--accent);
            }
            
            .actions {
                display: flex;
                gap: 8px;
            }
            
            .action-btn {
                border: none;
                background: none;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s ease;
                font-size: 12px;
            }
            
            .edit-btn {
                color: var(--accent);
            }
            
            .edit-btn:hover {
                background-color: var(--windowbg);
            }
            
            .delete-btn {
                color: #f38ba8;
            }
            
            .delete-btn:hover {
                background-color: rgba(243, 139, 168, 0.2);
            }
            
            .pause-btn {
                color: #fab387;
            }
            
            .pause-btn:hover {
                background-color: rgba(250, 179, 135, 0.2);
            }
            
            .resume-btn {
                color: #a6e3a1;
            }
            
            .resume-btn:hover {
                background-color: rgba(166, 227, 161, 0.2);
            }
            
            .command-cell {
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .tooltip {
                position: relative;
                display: inline-block;
            }
            
            .tooltip .tooltip-text {
                visibility: hidden;
                width: 200px;
                background-color: rgba(30, 30, 46, 0.95);
                color: var(--text);
                text-align: left;
                border-radius: 6px;
                padding: 8px;
                position: absolute;
                z-index: 1;
                bottom: 125%;
                left: 50%;
                margin-left: -100px;
                opacity: 0;
                transition: opacity 0.3s;
                font-family: monospace;
                font-size: 12px;
                border: 1px solid var(--border);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .tooltip:hover .tooltip-text {
                visibility: visible;
                opacity: 1;
            }
            
            .status-active {
                color: #a6e3a1;
            }
            
            .status-paused {
                color: #fab387;
            }

            .status-error {
                color: #f38ba8;
            }
        </style>
    `,
    400,
    300,
    false,
    "⏲️",
  );

  const secondEl = document.getElementById("second");
  const minuteEl = document.getElementById("minute");
  const hourEl = document.getElementById("hour");
  const dayEl = document.getElementById("day");
  const monthEl = document.getElementById("month");
  const weekdayEl = document.getElementById("weekday");
  const jobNameEl = document.getElementById("jobName");
  const commandEl = document.getElementById("command");
  const cronPreviewEl = document.getElementById("cronPreview");
  const schedulerForm = document.getElementById("schedulerForm");
  const refreshBtn = document.getElementById("refreshBtn");
  const templateBtns = document.querySelectorAll(".template-btn");
  let currentJobId = null;
  function updateCronPreview() {
    const cronExpression = `${secondEl.value} ${minuteEl.value} ${hourEl.value} ${dayEl.value} ${monthEl.value} ${weekdayEl.value}`;
    cronPreviewEl.textContent = cronExpression;
  }

  [secondEl, minuteEl, hourEl, dayEl, monthEl, weekdayEl].forEach((element) => {
    element.addEventListener("input", updateCronPreview);
  });

  templateBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const template = this.getAttribute("data-template");
      const parts = template.split(" ");
      if (parts.length === 6) {
        secondEl.value = parts[0];
        minuteEl.value = parts[1];
        hourEl.value = parts[2];
        dayEl.value = parts[3];
        monthEl.value = parts[4];
        weekdayEl.value = parts[5];
        updateCronPreview();
      }
    });
  });

  function fetchJobs() {
    fetch("http://" + window.location.hostname + ":9091/api/cron/jobs")
      .then((response) => response.json())
      .then((data) => {
        const tableBody = document.getElementById("jobsTableBody");
        tableBody.innerHTML = "";
        if (data.jobs && data.jobs.length > 0) {
          data.jobs.forEach((job) => {
            const row = document.createElement("tr");
            const statusClass = job.running ? "status-active" : "status-paused";
            const statusText = job.running ? "Active" : "Paused";
            const toggleBtnText = job.running ? "Pause" : "Resume";
            const toggleBtnClass = job.running ? "pause-btn" : "resume-btn";
            row.innerHTML = `
              <td>${job.name}</td>
              <td>${job.schedule}</td>
              <td class="command-cell">
                <div class="tooltip">
                  ${job.command.length > 30 ? job.command.substring(0, 30) + "..." : job.command}
                  <span class="tooltip-text">${job.command}</span>
                </div>
              </td>
              <td>${job.nextRun || "N/A"}</td>
              <td class="${statusClass}">${statusText}</td>
              <td class="actions">
                <button class="action-btn edit-btn" data-id="${job.id}">Edit</button>
                <button class="action-btn ${toggleBtnClass}" data-id="${job.id}" data-running="${job.running}">${toggleBtnText}</button>
                <button class="action-btn delete-btn" data-id="${job.id}">Delete</button>
              </td>
            `;
            tableBody.appendChild(row);
          });

          document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", () =>
              editJob(btn.getAttribute("data-id")),
            );
          });

          document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", () =>
              deleteJob(btn.getAttribute("data-id")),
            );
          });

          document
            .querySelectorAll(".pause-btn, .resume-btn")
            .forEach((btn) => {
              btn.addEventListener("click", () =>
                toggleJobStatus(
                  btn.getAttribute("data-id"),
                  btn.getAttribute("data-running") === "true",
                ),
              );
            });
        } else {
          tableBody.innerHTML = `
            <tr>
              <td colspan="6" class="loading-cell">No scheduled jobs found</td>
            </tr>
          `;
        }
      })
      .catch((error) => {
        document.getElementById("jobsTableBody").innerHTML = `
          <tr>
            <td colspan="6" class="loading-cell" style="color: #f38ba8;">
              Error loading jobs: ${error.message}
            </td>
          </tr>
        `;
        notify("Scheduler", NotificationType.ERROR, error.message);
      });
  }

  function addJob(event) {
    event.preventDefault();
    const jobData = {
      name: jobNameEl.value,
      command: commandEl.value,
      schedule: `${secondEl.value} ${minuteEl.value} ${hourEl.value} ${dayEl.value} ${monthEl.value} ${weekdayEl.value}`,
    };
    const apiEndpoint = currentJobId
      ? `http://${window.location.hostname}:9091/api/cron/update/${currentJobId}`
      : `http://${window.location.hostname}:9091/api/cron/add`;
    const method = currentJobId ? "PUT" : "POST";
    fetch(apiEndpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          resetForm();
          fetchJobs();
          notify(
            "Scheduler",
            NotificationType.SUCCESS,
            currentJobId
              ? `Job "${jobData.name}" updated successfully`
              : `Job "${jobData.name}" scheduled successfully`,
          );
        } else {
          notify(
            "Scheduler",
            NotificationType.ERROR,
            data.error || "Failed to process job",
          );
        }
      })
      .catch((error) => {
        notify("Scheduler", NotificationType.ERROR, error.message);
      });
  }

  function resetForm() {
    schedulerForm.reset();
    secondEl.value = "0";
    minuteEl.value =
      hourEl.value =
      dayEl.value =
      monthEl.value =
      weekdayEl.value =
        "*";
    currentJobId = null;
    updateCronPreview();
    const submitBtn = schedulerForm.querySelector("button[type='submit']");
    submitBtn.textContent = "Add Job";
  }

  function editJob(jobId) {
    fetch(`http://${window.location.hostname}:9091/api/cron/job/${jobId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.job) {
          const job = data.job;
          jobNameEl.value = job.name;
          commandEl.value = job.command;
          const scheduleParts = job.schedule.split(" ");
          if (scheduleParts.length === 6) {
            secondEl.value = scheduleParts[0];
            minuteEl.value = scheduleParts[1];
            hourEl.value = scheduleParts[2];
            dayEl.value = scheduleParts[3];
            monthEl.value = scheduleParts[4];
            weekdayEl.value = scheduleParts[5];
          }

          updateCronPreview();
          currentJobId = jobId;
          const submitBtn = schedulerForm.querySelector(
            "button[type='submit']",
          );
          submitBtn.textContent = "Update Job";
        } else {
          notify("Scheduler", NotificationType.ERROR, "Job not found");
        }
      })
      .catch((error) => {
        notify("Scheduler", NotificationType.ERROR, error.message);
      });
  }

  function deleteJob(jobId) {
    if (confirm("Are you sure you want to delete this job?")) {
      fetch(
        `http://${window.location.hostname}:9091/api/cron/delete/${jobId}`,
        {
          method: "DELETE",
        },
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            fetchJobs();
            notify(
              "Scheduler",
              NotificationType.SUCCESS,
              "Job deleted successfully",
            );
            if (currentJobId === jobId) {
              resetForm();
            }
          } else {
            notify(
              "Scheduler",
              NotificationType.ERROR,
              data.error || "Failed to delete job",
            );
          }
        })
        .catch((error) => {
          notify("Scheduler", NotificationType.ERROR, error.message);
        });
    }
  }

  function toggleJobStatus(jobId, isRunning) {
    const action = isRunning ? "pause" : "resume";
    fetch(
      `http://${window.location.hostname}:9091/api/cron/${action}/${jobId}`,
      {
        method: "POST",
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          fetchJobs();
          notify(
            "Scheduler",
            NotificationType.SUCCESS,
            `Job ${isRunning ? "paused" : "resumed"} successfully`,
          );
        } else {
          notify(
            "Scheduler",
            NotificationType.ERROR,
            data.error || `Failed to ${action} job`,
          );
        }
      })
      .catch((error) => {
        notify("Scheduler", NotificationType.ERROR, error.message);
      });
  }

  schedulerForm.addEventListener("submit", addJob);
  refreshBtn.addEventListener("click", fetchJobs);
  updateCronPreview();
  fetchJobs();
  setInterval(() => {
    fetchJobs();
  }, 30000);
}
