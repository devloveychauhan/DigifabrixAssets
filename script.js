const PLANS = 0;
let planIndex = 0;

function reloadPlans() {
    const d = document.getElementById("planDate").value;
    const s = document.getElementById("shiftId").value;
    window.location.href = `?date=${encodeURIComponent(d)}&shift_id=${encodeURIComponent(s)}`;
}

function setKpi(p) {
    document.getElementById("kDate").innerText =
        `${p.PlanDate} (${p.ShiftName})`;
    document.getElementById("kTime").innerText = p.ServerTime;
    document.getElementById("kLine").innerText = p.LineName;
    document.getElementById("kModel").innerText = p.Model || "-";
    document.getElementById("kSfg").innerText = p.SFG_Code;
    document.getElementById("kTotalPlan").innerText = p.TotalPlan;
    document.getElementById("kTotalActual").innerText = p.TotalActual;
    document.getElementById("kTargetUph").innerText = p.Target_UPH;
    document.getElementById("kActualUph").innerText = p.ActualUPH;
}

function buildRows(rows) {
    const body = document.getElementById("dashBody");
    body.innerHTML = "";
    if (!rows || rows.length === 0) {
        body.innerHTML = `<tr><td colspan="14">No data</td></tr>`;
        return;
    }
    for (const r of rows) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.timing}</td>
            <td>${r.uph_target}</td>
            <td>${r["Cell Short"]}</td>
            <td>${r["Laser Weld"]}</td>
            <td>${r["Laser Visual"]}</td>
            <td>${r["BMS Mounting"]}</td>
            <td>${r["EOL"]}</td>
            <td>${r["FT"]}</td>
            <td>${r["FQC"]}</td>
            <td>${r["SFG"]}</td>
            <td>${r["Packing"]}</td>
            <td>${r["PDI"]}</td>
            <td>${r.plan_cum}</td>
            <td>${r.actual_cum}</td>
          `;
        body.appendChild(tr);
    }
}

async function loadPlan(planId) {
    const res = await fetch(`?ajax=1&plan_id=${planId}`, {
        cache: "no-store",
    });
    const js = await res.json();
    if (!js.ok) {
        document.getElementById("dashBody").innerHTML =
            `<tr><td colspan="14">${js.msg}</td></tr>`;
        return;
    }
    setKpi(js.data.plan);
    buildRows(js.data.rows);
}

function tick() {
    if (!PLANS || PLANS.length === 0) return;
    const plan = PLANS[planIndex % PLANS.length];
    planIndex++;
    loadPlan(plan.PlanId);
}

document.addEventListener("DOMContentLoaded", () => {
    if (!PLANS || PLANS.length === 0) return;
    tick();
    setInterval(tick, 5000);
});


function getThemeColor(variable) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
}

function responsiveFont(base) {
    const w = window.innerWidth;
    if (w > 1800) return base + 4;
    if (w > 1200) return base + 2;
    if (w > 768) return base;
    return base - 3;
}

/* ===============================
DUMMY DATA (Replace with API)
=================================*/

const labels = [
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
];

const values = [108.2, 371.28, 315.37, 336.88, 372.58, 146.17, 0];

/* ===============================
CHART FACTORY FUNCTION
=================================*/

function createChart(type, canvasId) {
    return new Chart(document.getElementById(canvasId), {
        type: type,
        data: {
            labels,
            datasets: [
                {
                    label: "Production",
                    data: values,
                    borderColor: "#3b82f6",
                    backgroundColor:
                        type === "bar" ? "#3b82f6" : "rgba(59,130,246,0.2)",
                    borderRadius: 6,
                    fill: type === "line",
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // better for TV performance
            plugins: {
                legend: {
                    labels: {
                        color: getThemeColor("--text-primary"),
                        font: { size: responsiveFont(14) },
                    },
                },
                datalabels: {
                    color: getThemeColor("--text-primary"),
                    font: { size: responsiveFont(16) },
                    formatter: (val) => val.toFixed(2),
                    anchor: "end",
                    align: "top",
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: getThemeColor("--text-primary"),
                        font: { size: responsiveFont(20) },
                    },
                    title: {
                        display: true,
                        text: "Months",
                        color: getThemeColor("--text-primary"),
                        font: { size: responsiveFont(16), weight: "bold" },
                    },
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getThemeColor("--text-primary"),
                        font: { size: responsiveFont(20) },
                    },
                    title: {
                        display: true,
                        text: "Hundreds",
                        color: getThemeColor("--text-primary"),
                        font: { size: responsiveFont(20), weight: "bold" },
                    },
                },
            },
        },
        plugins: [ChartDataLabels],
    });
}

/* ===============================
CREATE CHARTS
=================================*/

let barChart = createChart("bar", "barChart");
let lineChart = createChart("line", "lineChart");

/* ===============================
THEME TOGGLE
=================================*/

const toggleBtn = document.getElementById("themeToggle");

toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? null : "dark";

    document.documentElement.setAttribute("data-theme", next);
    toggleBtn.textContent =
        next === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

    localStorage.setItem("dashboard-theme", next ? "dark" : "light");

    barChart.destroy();
    lineChart.destroy();

    barChart = createChart("bar", "barChart");
    lineChart = createChart("line", "lineChart");
});

/* ===============================
LOAD SAVED THEME
=================================*/

const saved = localStorage.getItem("dashboard-theme");
if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    toggleBtn.textContent = "☀️ Light Mode";
}