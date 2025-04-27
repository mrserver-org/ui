function processmanager() {
  createWindow(
    "Process Manager",
    `
        <div class="process-manager">
            <div class="action-bar">
                <button id="refreshBtn" class="btn btn-primary">
                    Refresh
                </button>
                <button id="killBtn" class="btn btn-danger">
                    Kill Process
                </button>
            </div>
            
            <div class="table-container">
                <table class="process-table">
                    <thead>
                        <tr>
                            <th>PID</th>
                            <th>Name</th>
                            <th>CPU %</th>
                            <th>Memory %</th>
                            <th>Status</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody id="processTableBody">
                        <tr>
                            <td colspan="6" class="loading-cell">Loading processes...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <style>
            .process-manager {
                color: var(--text);
                padding: 16px;
                max-width: 100%;
            }
            
            .title {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 16px;
                border-bottom: 1px solid var(--border);
                padding-bottom: 8px;
            }
            
            .action-bar {
                display: flex;
                justify-content: space-between;
                margin-bottom: 16px;
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
            
            .btn-danger {
                background-color: #f38ba8;
                color: var(--window-bg);
            }
            
            .btn-danger:hover {
                background-color: #f5a9be;
                box-shadow: 0 0 8px rgba(243, 139, 168, 0.5);
            }
            
            .table-container {
                overflow-x: auto;
                border-radius: 8px;
                border: 1px solid var(--border);
                background-color: rgba(49, 50, 68, 0.3);
            }
            
            .process-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
            }
            
            .process-table th {
                background-color: var(--accent);
                padding: 12px 16px;
                font-weight: 600;
                border-bottom: 2px solid var(--border);
            }
            
            .process-table td {
                padding: 10px 16px;
                border-bottom: 1px solid var(--border);
            }
            
            .process-table tr:last-child td {
                border-bottom: none;
            }
            
            .loading-cell {
                text-align: center;
                padding: 20px !important;
                color: var(--accent);
            }
            
            input[type="radio"] {
                appearance: none;
                width: 16px;
                height: 16px;
                border: 2px solid var(--border);
                border-radius: 50%;
                outline: none;
                cursor: pointer;
                position: relative;
            }
            
            input[type="radio"]:checked {
                border-color: var(--accent);
            }

            .text-center {
                text-align: center;
            }
            
            .text-red {
                color: #f38ba8;
            }
        </style>
    `,
  );
  let selectedPid = null;
  function fetchProcesses() {
    fetch("http://" + window.location.hostname + ":9091/api/processes")
      .then((response) => response.json())
      .then((data) => {
        const tableBody = document.getElementById("processTableBody");
        tableBody.innerHTML = "";
        data.processes.forEach((process) => {
          const row = document.createElement("tr");
          const isSelected =
            selectedPid !== null &&
            process.pid.toString() === selectedPid.toString();
          row.innerHTML = `
                                    <td>${process.pid}</td>
                                    <td>${process.name}</td>
                                    <td>${process.cpu.toFixed(1)}</td>
                                    <td>${process.memory.toFixed(1)}</td>
                                    <td>${process.status}</td>
                                    <td class="text-center">
                                        <input type="radio" name="processSelect" value="${process.pid}" 
                                        ${isSelected ? "checked" : ""}>
                                    </td>
                                `;
          tableBody.appendChild(row);
        });

        document
          .querySelectorAll('input[name="processSelect"]')
          .forEach((radio) => {
            radio.addEventListener("change", function () {
              selectedPid = this.value;
            });
          });
      })
      .catch((error) => {
        document.getElementById("processTableBody").innerHTML = `
                                <tr>
                                    <td colspan="6" class="loading-cell text-red">
                                        Error loading processes: ${error.message}
                                    </td>
                                </tr>
                            `;
		notify("Process Manager", NotificationType.ERROR, error.message);
      });
  }

  function killProcess() {
    if (!selectedPid) {
      alert("Please select a process to kill");
      return;
    }

    fetch("http://" + window.location.hostname + ":9091/api/kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pid: selectedPid }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          fetchProcesses();
          notify("Process Manager", NotificationType.SUCESS, `Process ${selectedPid} Terminated Sucessfully.`);
        } else {
          notify("Process Manager", NotificationType.ERROR, data.error);
        }
      })
      .catch((error) => {
        notify("Process Manager", NotificationType.ERROR, error.message);
      });
  }

  document.getElementById("refreshBtn").addEventListener("click", () => {
    fetchProcesses();
  });

  document.getElementById("killBtn").addEventListener("click", killProcess);

  fetchProcesses();
  setInterval(() => {
    fetchProcesses();
  }, 5000);
}
