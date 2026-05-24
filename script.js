const patients = [
  { id: 1, name: "Aarav Kumar", age: 67, department: "Cardiology", diagnosis: "Heart Failure", stay: 8, status: "Recovered", month: "Jan", severity: 8 },
  { id: 2, name: "Meera Nair", age: 45, department: "Neurology", diagnosis: "Migraine", stay: 3, status: "Recovered", month: "Jan", severity: 3 },
  { id: 3, name: "Rohan Sharma", age: 52, department: "Orthopedics", diagnosis: "Fracture", stay: 5, status: "Recovered", month: "Feb", severity: 4 },
  { id: 4, name: "Ananya Rao", age: 29, department: "Emergency", diagnosis: "Accident Trauma", stay: 6, status: "Under Care", month: "Feb", severity: 7 },
  { id: 5, name: "Vikram Iyer", age: 73, department: "Cardiology", diagnosis: "Arrhythmia", stay: 9, status: "Under Care", month: "Mar", severity: 8 },
  { id: 6, name: "Sara Thomas", age: 36, department: "Gynecology", diagnosis: "Maternal Care", stay: 4, status: "Recovered", month: "Mar", severity: 3 },
  { id: 7, name: "Kabir Singh", age: 61, department: "Oncology", diagnosis: "Chemotherapy", stay: 10, status: "Under Care", month: "Apr", severity: 9 },
  { id: 8, name: "Priya Menon", age: 40, department: "General Medicine", diagnosis: "Dengue Fever", stay: 5, status: "Recovered", month: "Apr", severity: 5 },
  { id: 9, name: "Dev Patel", age: 12, department: "Pediatrics", diagnosis: "Asthma", stay: 2, status: "Recovered", month: "May", severity: 2 },
  { id: 10, name: "Lakshmi Das", age: 70, department: "Neurology", diagnosis: "Stroke", stay: 11, status: "Referred", month: "May", severity: 9 },
  { id: 11, name: "Nikhil Verma", age: 58, department: "Emergency", diagnosis: "Severe Infection", stay: 7, status: "Under Care", month: "Jun", severity: 7 },
  { id: 12, name: "Isha Jain", age: 33, department: "General Medicine", diagnosis: "Pneumonia", stay: 6, status: "Recovered", month: "Jun", severity: 6 }
];

const defaultCredentials = {
  username: "Roshan",
  password: "hospital123"
};

const loginScreen = document.querySelector("#loginScreen");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");
const logoutBtn = document.querySelector("#logoutBtn");
const departmentFilter = document.querySelector("#departmentFilter");
const searchInput = document.querySelector("#searchInput");
const showPassword = document.querySelector("#showPassword");
const rememberUser = document.querySelector("#rememberUser");
const toggleChangeLogin = document.querySelector("#toggleChangeLogin");
const changeLoginForm = document.querySelector("#changeLoginForm");
const changeLoginMessage = document.querySelector("#changeLoginMessage");
const forgotPasswordBtn = document.querySelector("#forgotPasswordBtn");
const resetLoginBtn = document.querySelector("#resetLoginBtn");
const loginHelp = document.querySelector("#loginHelp");

function loadCredentials() {
  const saved = localStorage.getItem("hospitalLoginCredentials");
  if (!saved) return { ...defaultCredentials };

  try {
    const savedCredentials = JSON.parse(saved);
    if (savedCredentials.username === "admin" && savedCredentials.password === defaultCredentials.password) {
      saveCredentials(defaultCredentials);
      localStorage.setItem("hospitalRememberedUsername", defaultCredentials.username);
      return { ...defaultCredentials };
    }
    return { ...defaultCredentials, ...savedCredentials };
  } catch (error) {
    localStorage.removeItem("hospitalLoginCredentials");
    return { ...defaultCredentials };
  }
}

function saveCredentials(credentials) {
  localStorage.setItem("hospitalLoginCredentials", JSON.stringify(credentials));
}

function getRememberedUsername() {
  return localStorage.getItem("hospitalRememberedUsername") || defaultCredentials.username;
}

function setLoginHelp(message, isError = false) {
  loginHelp.textContent = message;
  loginHelp.classList.toggle("error-text", isError);
}

let credentials = loadCredentials();

function riskScore(patient, departmentLoad) {
  const agePoints = patient.age >= 65 ? 25 : patient.age >= 50 ? 15 : 6;
  const stayPoints = patient.stay >= 8 ? 25 : patient.stay >= 5 ? 15 : 6;
  const severityPoints = patient.severity * 5;
  const loadPoints = departmentLoad >= 3 ? 10 : 4;
  return Math.min(100, agePoints + stayPoints + severityPoints + loadPoints);
}

function riskLevel(score) {
  if (score >= 75) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

function getFilteredPatients() {
  const selectedDepartment = departmentFilter.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  return patients.filter((patient) => {
    const departmentMatch = selectedDepartment === "All" || patient.department === selectedDepartment;
    const searchMatch = `${patient.name} ${patient.diagnosis}`.toLowerCase().includes(searchTerm);
    return departmentMatch && searchMatch;
  });
}

function groupCount(items, key) {
  return items.reduce((totals, item) => {
    totals[item[key]] = (totals[item[key]] || 0) + 1;
    return totals;
  }, {});
}

function drawBarChart(canvas, labels, values) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 42;
  const chartHeight = height - padding * 1.8;
  const maxValue = Math.max(...values, 1);
  const barWidth = (width - padding * 2) / labels.length - 16;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#f7fafc";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#d9e2ea";
  context.beginPath();
  context.moveTo(padding, 24);
  context.lineTo(padding, height - padding);
  context.lineTo(width - 16, height - padding);
  context.stroke();

  labels.forEach((label, index) => {
    const x = padding + index * (barWidth + 16) + 12;
    const barHeight = (values[index] / maxValue) * chartHeight;
    const y = height - padding - barHeight;
    context.fillStyle = index % 2 === 0 ? "#177e89" : "#276fbf";
    context.fillRect(x, y, barWidth, barHeight);
    context.fillStyle = "#132029";
    context.font = "700 14px Arial";
    context.fillText(values[index], x + barWidth / 2 - 4, y - 8);
    context.save();
    context.translate(x + 5, height - 14);
    context.rotate(-0.55);
    context.font = "12px Arial";
    context.fillStyle = "#647482";
    context.fillText(label, 0, 0);
    context.restore();
  });
}

function drawLineChart(canvas, labels, values) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 44;
  const maxValue = Math.max(...values, 1);
  const stepX = (width - padding * 2) / (labels.length - 1);

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#f7fafc";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#d9e2ea";
  context.beginPath();
  context.moveTo(padding, 24);
  context.lineTo(padding, height - padding);
  context.lineTo(width - 18, height - padding);
  context.stroke();

  const points = values.map((value, index) => ({
    x: padding + index * stepX,
    y: height - padding - (value / maxValue) * (height - padding * 1.8)
  }));

  context.strokeStyle = "#177e89";
  context.lineWidth = 4;
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.stroke();

  points.forEach((point, index) => {
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#276fbf";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(point.x, point.y, 6, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = "#132029";
    context.font = "700 13px Arial";
    context.fillText(values[index], point.x - 4, point.y - 14);
    context.font = "12px Arial";
    context.fillStyle = "#647482";
    context.fillText(labels[index], point.x - 10, height - 15);
  });
}

function updateMetrics(records) {
  const total = records.length;
  const avgStay = total ? records.reduce((sum, patient) => sum + patient.stay, 0) / total : 0;
  const recovered = records.filter((patient) => patient.status === "Recovered").length;
  const departmentLoads = groupCount(patients, "department");
  const highRisk = records.filter((patient) => riskLevel(riskScore(patient, departmentLoads[patient.department])) === "High").length;

  document.querySelector("#totalPatients").textContent = total;
  document.querySelector("#avgStay").textContent = `${avgStay.toFixed(1)} days`;
  document.querySelector("#highRisk").textContent = highRisk;
  document.querySelector("#recoveryRate").textContent = total ? `${Math.round((recovered / total) * 100)}%` : "0%";
}

function updateCharts(records) {
  const departmentCounts = groupCount(records, "department");
  const departmentLabels = Object.keys(departmentCounts);
  const departmentValues = Object.values(departmentCounts);
  const topIndex = departmentValues.indexOf(Math.max(...departmentValues, 0));
  document.querySelector("#topDepartment").textContent = departmentLabels.length ? `Top: ${departmentLabels[topIndex]}` : "Top: -";
  drawBarChart(document.querySelector("#departmentChart"), departmentLabels.length ? departmentLabels : ["No data"], departmentValues.length ? departmentValues : [0]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthCounts = groupCount(records, "month");
  drawLineChart(document.querySelector("#trendChart"), months, months.map((month) => monthCounts[month] || 0));
}

function updateTable(records) {
  const departmentLoads = groupCount(patients, "department");
  const rows = records.map((patient) => {
    const score = riskScore(patient, departmentLoads[patient.department]);
    const level = riskLevel(score);
    return `
      <tr>
        <td>${patient.name}</td>
        <td>${patient.age}</td>
        <td>${patient.department}</td>
        <td>${patient.diagnosis}</td>
        <td>${patient.stay} days</td>
        <td>${patient.status}</td>
        <td><span class="pill ${level.toLowerCase()}">${level}</span></td>
      </tr>
    `;
  }).join("");

  document.querySelector("#patientTable").innerHTML = rows || `<tr><td colspan="7">No matching patient records found.</td></tr>`;
}

function updateRiskList(records) {
  const departmentLoads = groupCount(patients, "department");
  const highPriority = [...records]
    .map((patient) => ({ ...patient, score: riskScore(patient, departmentLoads[patient.department]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  document.querySelector("#riskList").innerHTML = highPriority.map((patient) => {
    const level = riskLevel(patient.score);
    const color = level === "High" ? "#c2413f" : level === "Medium" ? "#d18422" : "#2f9e67";
    return `
      <div class="risk-item">
        <strong>${patient.name}<span>${patient.score}%</span></strong>
        <span>${patient.department}<span class="pill ${level.toLowerCase()}">${level}</span></span>
        <div class="risk-meter"><div style="width: ${patient.score}%; background: ${color};"></div></div>
      </div>
    `;
  }).join("") || `<p class="model-copy">No patients match the selected view.</p>`;
}

function renderDashboard() {
  const records = getFilteredPatients();
  updateMetrics(records);
  updateCharts(records);
  updateTable(records);
  updateRiskList(records);
}

function populateDepartments() {
  const departments = [...new Set(patients.map((patient) => patient.department))].sort();
  departments.forEach((department) => {
    const option = document.createElement("option");
    option.value = department;
    option.textContent = department;
    departmentFilter.appendChild(option);
  });
}

function fillLoginDefaults() {
  const usernameInput = document.querySelector("#username");
  const passwordInput = document.querySelector("#password");
  usernameInput.value = getRememberedUsername();
  passwordInput.value = "";
  setLoginHelp(`Current username: ${credentials.username}`);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = formData.get("username").trim();
  const password = formData.get("password").trim();

  if (username === credentials.username && password === credentials.password) {
    loginError.textContent = "";
    if (rememberUser.checked) {
      localStorage.setItem("hospitalRememberedUsername", username);
    } else {
      localStorage.removeItem("hospitalRememberedUsername");
    }
    loginScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");
    renderDashboard();
    return;
  }

  loginError.textContent = "Invalid login details. Use the saved username and password.";
});

logoutBtn.addEventListener("click", () => {
  dashboard.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  document.querySelector("#password").value = "";
  fillLoginDefaults();
});

showPassword.addEventListener("change", () => {
  const passwordType = showPassword.checked ? "text" : "password";
  document.querySelector("#password").type = passwordType;
  document.querySelector("#currentPassword").type = passwordType;
  document.querySelector("#newPassword").type = passwordType;
  document.querySelector("#confirmPassword").type = passwordType;
});

toggleChangeLogin.addEventListener("click", () => {
  changeLoginForm.classList.toggle("hidden");
  changeLoginMessage.textContent = "";
  document.querySelector("#newUsername").value = credentials.username;
  document.querySelector("#currentPassword").value = "";
  document.querySelector("#newPassword").value = "";
  document.querySelector("#confirmPassword").value = "";
});

changeLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(changeLoginForm);
  const currentPassword = formData.get("currentPassword").trim();
  const newUsername = formData.get("newUsername").trim();
  const newPassword = formData.get("newPassword").trim();
  const confirmPassword = formData.get("confirmPassword").trim();

  if (currentPassword !== credentials.password) {
    changeLoginMessage.textContent = "Current password is incorrect.";
    return;
  }

  if (newUsername.length < 3) {
    changeLoginMessage.textContent = "Username must be at least 3 characters.";
    return;
  }

  if (newPassword.length < 6) {
    changeLoginMessage.textContent = "Password must be at least 6 characters.";
    return;
  }

  if (newPassword !== confirmPassword) {
    changeLoginMessage.textContent = "New password and confirm password do not match.";
    return;
  }

  credentials = { username: newUsername, password: newPassword };
  saveCredentials(credentials);
  localStorage.setItem("hospitalRememberedUsername", newUsername);
  document.querySelector("#username").value = newUsername;
  document.querySelector("#password").value = "";
  changeLoginForm.classList.add("hidden");
  changeLoginMessage.textContent = "";
  loginError.textContent = "";
  setLoginHelp("Login details updated. Use your new password to sign in.");
});

forgotPasswordBtn.addEventListener("click", () => {
  setLoginHelp(`Hint: username is ${credentials.username}. If needed, use Reset demo login to restore Roshan / hospital123.`);
});

resetLoginBtn.addEventListener("click", () => {
  credentials = { ...defaultCredentials };
  saveCredentials(credentials);
  localStorage.setItem("hospitalRememberedUsername", credentials.username);
  document.querySelector("#username").value = credentials.username;
  document.querySelector("#password").value = "";
  loginError.textContent = "";
  changeLoginForm.classList.add("hidden");
  setLoginHelp("Demo login restored: Roshan / hospital123.");
});

departmentFilter.addEventListener("change", renderDashboard);
searchInput.addEventListener("input", renderDashboard);

populateDepartments();
fillLoginDefaults();
