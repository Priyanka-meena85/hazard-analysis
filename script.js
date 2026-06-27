// --- GLOBAL VARIABLES ---
let currentUser = null;
let users = JSON.parse(localStorage.getItem('hars_users')) || [];
let hazards = JSON.parse(localStorage.getItem('hars_hazards')) || [];
let materials = JSON.parse(localStorage.getItem('hars_materials')) || [];
let facilities = JSON.parse(localStorage.getItem('hars_facilities')) || [];

// --- MOCK DATA GENERATION ---
function generateMockData() {
    if (hazards.length === 0) {
        hazards = [
            { id: 1, title: 'Chemical Leak - Benzene Tank', description: 'Small leak detected near valve.', location: 'Chemical Processing Plant A', severity: 'High', probability: 'High', riskLevel: 'High', status: 'Pending', date: '2026-06-25', score: 9.2, priority: 'Critical' },
            { id: 2, title: 'Fire Risk - Refined Fuel Area', description: 'Combustible material stored improperly.', location: 'Refinery Complex B', severity: 'High', probability: 'Medium', riskLevel: 'High', status: 'In Progress', date: '2026-06-24', score: 8.7, priority: 'Critical' },
            { id: 3, title: 'Pressure Vessel Core Fail', description: 'Pressure exceeding safe limits.', location: 'Pharma Facility C', severity: 'Medium', probability: 'High', riskLevel: 'High', status: 'Pending', date: '2026-06-23', score: 7.9, priority: 'High' },
            { id: 4, title: 'Gas Alarm Sensor Calibration', description: 'Sensors reading slightly off baseline.', location: 'Bulk Gas Depot H', severity: 'Medium', probability: 'Medium', riskLevel: 'Medium', status: 'Completed', date: '2026-06-26', score: 6.8, priority: 'Medium' }
        ];
        localStorage.setItem('hars_hazards', JSON.stringify(hazards));
    }
    
    if (materials.length === 0) {
        materials = [
            { id: 1, name: 'Benzene', cas: '71-43-2', class: 'Flammable', stock: '1500 kg', assessment: 'High' },
            { id: 2, name: 'Sulfuric Acid', cas: '7664-93-9', class: 'Corrosive', stock: '3200 kg', assessment: 'Critical' },
            { id: 3, name: 'Ammonia', cas: '7664-41-7', class: 'Toxic', stock: '800 kg', assessment: 'Medium' }
        ];
        localStorage.setItem('hars_materials', JSON.stringify(materials));
    }

    if (facilities.length === 0) {
        facilities = [
            { id: 1, name: 'Chemical Plant A', location: 'Houston, TX', type: 'chemical', capacity: '5000 tons', risk: '8.2' },
            { id: 2, name: 'Refinery Complex B', location: 'Baton Rouge, LA', type: 'petroleum', capacity: '12000 tons', risk: '7.8' },
            { id: 3, name: 'Pharma Facility C', location: 'Newark, NJ', type: 'pharmaceutical', capacity: '2500 tons', risk: '6.1' }
        ];
        localStorage.setItem('hars_facilities', JSON.stringify(facilities));
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    generateMockData();
    
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('hars_currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        navigate('dashboard-page');
    } else {
        navigate('landing-page');
    }

    // Event Listeners for forms
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('hazard-form').addEventListener('submit', handleSaveHazard);
    document.getElementById('material-form').addEventListener('submit', handleSaveMaterial);
    document.getElementById('facility-form').addEventListener('submit', handleSaveFacility);
    
    // Hamburger menu toggle
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('active');
    });

    // Report Export buttons
    document.querySelector('.export-pdf').addEventListener('click', () => generateFile('PDF'));
    document.querySelector('.export-excel').addEventListener('click', () => generateFile('Excel'));
    
    // Report download buttons
    const downloadBtns = document.querySelectorAll('.report-item .btn-outline');
    downloadBtns.forEach(btn => btn.addEventListener('click', () => downloadMockFile('Report_Archive.pdf')));
});

// --- NAVIGATION ---
function navigate(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });

    // Show target page
    const target = document.getElementById(pageId);
    target.style.display = 'block';
    setTimeout(() => target.classList.add('active'), 10);

    // Navbar visibility
    const navbar = document.getElementById('navbar');
    if (pageId === 'dashboard-page') {
        navbar.style.display = 'none';
        renderDashboard();
    } else {
        navbar.style.display = 'block';
    }

    // Close mobile menu if open
    document.getElementById('nav-links').classList.remove('active');
}

function showAuthPage(section) {
    navigate('auth-page');
    toggleAuth(section);
}

function toggleAuth(section) {
    if (section === 'signup') {
        document.getElementById('signup-section').style.display = 'block';
        document.getElementById('login-section').style.display = 'none';
    } else {
        document.getElementById('signup-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
    }
}

// --- AUTHENTICATION ---
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const role = document.getElementById('signup-role').value;
    const messageEl = document.getElementById('signup-message');

    if (!name || !email || !password || !confirmPassword || !role) {
        showMessage(messageEl, 'Please fill in all fields.', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showMessage(messageEl, 'Passwords do not match.', 'error');
        return;
    }
    if (users.find(u => u.email === email)) {
        showMessage(messageEl, 'Email is already registered.', 'error');
        return;
    }

    const newUser = { id: Date.now(), name, email, password, role };
    users.push(newUser);
    localStorage.setItem('hars_users', JSON.stringify(users));

    showMessage(messageEl, 'Registration successful! Please login.', 'success');
    e.target.reset();
    setTimeout(() => {
        messageEl.style.display = 'none';
        toggleAuth('login');
    }, 2000);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('hars_currentUser', JSON.stringify(user));
        e.target.reset();
        navigate('dashboard-page');
    } else {
        showMessage(messageEl, 'Invalid email or password.', 'error');
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('hars_currentUser');
    navigate('landing-page');
}

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

// --- DASHBOARD LOGIC ---
function switchTab(tabId) {
    document.querySelectorAll('.dash-tabs .tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-target="${tabId}"]`).classList.add('active');

    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
        pane.style.display = 'none';
    });
    
    const targetPane = document.getElementById(tabId);
    targetPane.style.display = 'block';
    setTimeout(() => targetPane.classList.add('active'), 10);
}

function applyRBAC() {
    if (!currentUser) return;
    const role = currentUser.role;

    document.querySelectorAll('.rbac-admin, .rbac-manager, .rbac-operator-view').forEach(el => {
        el.style.display = 'none';
    });

    if (role === 'System Administrator') {
        document.querySelectorAll('.rbac-admin, .rbac-manager, .rbac-operator-view').forEach(el => el.style.display = '');
    } else if (role === 'Manager') {
        document.querySelectorAll('.rbac-manager, .rbac-operator-view').forEach(el => el.style.display = '');
    } else if (role === 'Operator') {
        document.querySelectorAll('.rbac-operator-view').forEach(el => el.style.display = '');
        switchTab('tab-dashboard');
    }
}

function renderDashboard() {
    if (!currentUser) return;
    
    document.getElementById('nav-user-email').textContent = currentUser.email;
    document.getElementById('nav-user-role').textContent = currentUser.role;
    document.getElementById('nav-user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

    applyRBAC();

    document.getElementById('kpi-critical').textContent = hazards.filter(h => h.riskLevel === 'High').length;
    document.getElementById('kpi-facilities').textContent = facilities.length.toString();
    document.getElementById('kpi-score').textContent = '8.1';
    document.getElementById('kpi-compliance').textContent = '94%';

    renderTopHazards();
    renderMitigatingActions();
    renderMaterials();
    renderFacilities();
    drawTrendChart();
}

function renderFacilities() {
    const container = document.getElementById('facilities-container');
    if (!container) return;
    container.innerHTML = '';
    
    facilities.forEach(fac => {
        const riskClass = parseFloat(fac.risk) > 8 ? 'risk-High' : parseFloat(fac.risk) > 6 ? 'risk-Medium' : 'risk-Low';
        
        let editBtn = '';
        if (currentUser.role === 'System Administrator' || currentUser.role === 'Manager') {
            editBtn = `<button class="btn-outline" onclick="editFacility(${fac.id})">Edit</button>`;
        }

        container.innerHTML += `
            <div class="facility-card">
                <div class="fac-header">
                    <h4>${fac.name}</h4>
                    <span class="risk-badge ${riskClass}">Risk: ${fac.risk}</span>
                </div>
                <div class="fac-details">
                    <p><i class='bx bxs-map'></i> ${fac.location}</p>
                    <p><i class='bx bxs-factory'></i> ${fac.type}</p>
                    <p><i class='bx bx-box'></i> Capacity: ${fac.capacity}</p>
                </div>
                <div class="fac-actions">
                    <button class="btn-primary" style="background:#2563eb;" onclick="alert('Facility Status: Active\\nLast Audit: 3 days ago\\nOpen Incidents: 2')">View Details</button>
                    ${editBtn}
                </div>
            </div>
        `;
    });
}

function renderTopHazards() {
    const tbody = document.getElementById('top-hazards-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const sortedHazards = [...hazards].sort((a, b) => b.id - a.id);

    sortedHazards.forEach(hazard => {
        const tr = document.createElement('tr');
        
        let prioClass = 'prio-low';
        if(hazard.priority === 'Critical') prioClass = 'prio-critical';
        if(hazard.priority === 'High') prioClass = 'prio-high';
        if(hazard.priority === 'Medium') prioClass = 'prio-medium';

        let score = hazard.score || (hazard.riskLevel === 'High' ? 8.5 : hazard.riskLevel === 'Medium' ? 5.5 : 2.5);
        let priority = hazard.priority || hazard.riskLevel;

        let actionsHtml = `<td class="rbac-manager">`;
        if (currentUser.role === 'System Administrator') {
            actionsHtml += `
                <div style="display:flex; gap:5px;">
                    <button class="btn-assign" onclick="resolveHazard(${hazard.id})" title="Resolve"><i class='bx bx-check'></i></button>
                    <button class="btn-outline" onclick="editHazard(${hazard.id})" title="Edit"><i class='bx bx-edit'></i></button>
                    <button class="btn-outline" style="background:#ef4444;" onclick="deleteHazard(${hazard.id})" title="Delete"><i class='bx bx-trash'></i></button>
                </div>
            `;
        } else if (currentUser.role === 'Manager') {
            actionsHtml += `
                <div style="display:flex; gap:5px;">
                    <button class="btn-assign" onclick="resolveHazard(${hazard.id})" title="Resolve"><i class='bx bx-check'></i></button>
                    <button class="btn-outline" onclick="editHazard(${hazard.id})" title="Edit"><i class='bx bx-edit'></i></button>
                </div>
            `;
        } else {
            actionsHtml += `<span style="color:var(--text-light); font-size: 0.85rem;">View Only</span>`;
        }
        actionsHtml += `</td>`;

        tr.innerHTML = `
            <td><strong>${hazard.title}</strong></td>
            <td>${hazard.location}</td>
            <td><strong>${score}</strong></td>
            <td><span class="priority-badge ${prioClass}">${priority}</span></td>
            <td>${hazard.date}</td>
            ${actionsHtml}
        `;
        tbody.appendChild(tr);
    });
}

function renderMitigatingActions() {
    const list = document.getElementById('mitigating-actions-list');
    if(!list) return;
    list.innerHTML = `
        <div class="action-item crit">
            <div class="action-text">
                <h4>CRITICAL SEVERITY</h4>
                <p>Immediate pressure validation scheduled for Chlorine containment in Bulk Gas Depot H.</p>
                <small>Mandate: Deploy operators within 8 hours</small>
            </div>
            <button class="btn-assign" onclick="alert('Ticket Assigned Successfully!')">Assign Ticket</button>
        </div>
        <div class="action-item crit">
            <div class="action-text">
                <h4>CRITICAL SEVERITY</h4>
                <p>Update fire protective blankets and extinguisher matrix in Refinery Complex B storage vaults.</p>
                <small>Mandate: Address within 24 hours</small>
            </div>
            <button class="btn-assign" onclick="alert('Ticket Assigned Successfully!')">Assign Ticket</button>
        </div>
        <div class="action-item high">
            <div class="action-text">
                <h4>HIGH SEVERITY</h4>
                <p>Update pressure relief valve instrumentation protocols in Pharma Facility C.</p>
                <small>Mandate: Calibrate within 72 hours</small>
            </div>
            <button class="btn-assign" onclick="alert('Ticket Assigned Successfully!')">Assign Ticket</button>
        </div>
    `;
}

// --- MATERIALS REGISTRY ---
function renderMaterials() {
    const tbody = document.getElementById('materials-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    materials.forEach(mat => {
        let badgeClass = 'prio-low';
        if(mat.assessment === 'Critical') badgeClass = 'prio-critical';
        if(mat.assessment === 'High') badgeClass = 'prio-high';
        if(mat.assessment === 'Medium') badgeClass = 'prio-medium';

        const tr = document.createElement('tr');
        let matActions = '';
        if (currentUser.role === 'System Administrator') {
            matActions = `
                <a href="#" style="color:#5c4dff; font-weight:600; margin-right:15px;" onclick="editMaterial(${mat.id}); return false;">Edit</a>
                <a href="#" style="color:#ef4444; font-weight:600;" onclick="deleteMaterial(${mat.id}); return false;">Delete</a>
            `;
        } else if (currentUser.role === 'Manager') {
            matActions = `
                <a href="#" style="color:#5c4dff; font-weight:600; margin-right:15px;" onclick="editMaterial(${mat.id}); return false;">Edit</a>
            `;
        } else {
            matActions = `<span style="color:var(--text-light); font-size: 0.85rem;">View Only</span>`;
        }

        tr.innerHTML = `
            <td><strong>${mat.name}</strong></td>
            <td>${mat.cas}</td>
            <td>${mat.class}</td>
            <td>${mat.stock}</td>
            <td><span class="priority-badge ${badgeClass}">${mat.assessment}</span></td>
            <td>${matActions}</td>
        `;
        tbody.appendChild(tr);
    });
}

function openMaterialModal() {
    document.getElementById('material-form').reset();
    document.getElementById('material-id').value = '';
    document.getElementById('material-modal-title').textContent = 'Log New Substance';
    document.getElementById('material-modal').classList.add('active');
}

function closeMaterialModal() {
    document.getElementById('material-modal').classList.remove('active');
}

function handleSaveMaterial(e) {
    e.preventDefault();
    
    const idField = document.getElementById('material-id').value;
    const name = document.getElementById('material-name').value;
    const cas = document.getElementById('material-cas').value;
    const hClass = document.getElementById('material-class').value;
    const stock = document.getElementById('material-stock').value;
    const assessment = document.getElementById('material-assessment').value;

    if (idField) {
        // Edit
        const mat = materials.find(m => m.id == idField);
        if(mat) {
            mat.name = name;
            mat.cas = cas;
            mat.class = hClass;
            mat.stock = stock;
            mat.assessment = assessment;
        }
    } else {
        // Create
        materials.push({
            id: Date.now(),
            name,
            cas,
            class: hClass,
            stock,
            assessment
        });
    }

    localStorage.setItem('hars_materials', JSON.stringify(materials));
    closeMaterialModal();
    renderMaterials();
}

function editMaterial(id) {
    const mat = materials.find(m => m.id === id);
    if (!mat) return;
    
    document.getElementById('material-id').value = mat.id;
    document.getElementById('material-name').value = mat.name;
    document.getElementById('material-cas').value = mat.cas;
    document.getElementById('material-class').value = mat.class;
    document.getElementById('material-stock').value = mat.stock;
    document.getElementById('material-assessment').value = mat.assessment;
    
    document.getElementById('material-modal-title').textContent = 'Edit Substance';
    document.getElementById('material-modal').classList.add('active');
}

function deleteMaterial(id) {
    if (confirm('Are you sure you want to delete this hazardous material?')) {
        materials = materials.filter(m => m.id !== id);
        localStorage.setItem('hars_materials', JSON.stringify(materials));
        renderMaterials();
    }
}

// --- FACILITIES MANAGEMENT ---
function openFacilityModal() {
    document.getElementById('facility-form').reset();
    document.getElementById('facility-id').value = '';
    document.getElementById('facility-modal-title').textContent = 'Add New Facility';
    document.getElementById('facility-modal').classList.add('active');
}

function closeFacilityModal() {
    document.getElementById('facility-modal').classList.remove('active');
}

function handleSaveFacility(e) {
    e.preventDefault();
    
    const idField = document.getElementById('facility-id').value;
    const name = document.getElementById('facility-name').value;
    const location = document.getElementById('facility-location').value;
    const type = document.getElementById('facility-type').value;
    const capacity = document.getElementById('facility-capacity').value;
    const risk = document.getElementById('facility-risk').value;

    if (idField) {
        // Edit
        const fac = facilities.find(f => f.id == idField);
        if(fac) {
            fac.name = name;
            fac.location = location;
            fac.type = type;
            fac.capacity = capacity;
            fac.risk = risk;
        }
    } else {
        // Create
        facilities.push({
            id: Date.now(),
            name,
            location,
            type,
            capacity,
            risk
        });
    }

    localStorage.setItem('hars_facilities', JSON.stringify(facilities));
    closeFacilityModal();
    renderFacilities();
}

function editFacility(id) {
    const fac = facilities.find(f => f.id === id);
    if (!fac) return;
    
    document.getElementById('facility-id').value = fac.id;
    document.getElementById('facility-name').value = fac.name;
    document.getElementById('facility-location').value = fac.location;
    document.getElementById('facility-type').value = fac.type;
    document.getElementById('facility-capacity').value = fac.capacity;
    document.getElementById('facility-risk').value = fac.risk;
    
    document.getElementById('facility-modal-title').textContent = 'Edit Facility';
    document.getElementById('facility-modal').classList.add('active');
}

// --- REPORTS EXPORT MOCK ---
function generateFile(type) {
    const reportType = document.querySelector('.modern-select').value;
    const textContent = `HARS System Report\nType: ${reportType}\nGenerated: ${new Date().toLocaleString()}\nBy: ${currentUser.name}\n\n[Mock Data Payload for ${type} Format]`;
    
    downloadMockFile(`HARS_Report_${new Date().getTime()}.${type === 'Excel' ? 'csv' : 'pdf'}`, textContent);
}

function downloadMockFile(filename, content = "Mock File Content") {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

// --- RISK ANALYSIS MOCK ---
function runRiskAnalysis() {
    showLoadingOverlay("Running Risk Analysis...");
    setTimeout(() => {
        hideLoadingOverlay();
        const container = document.getElementById('analysis-output');
        document.getElementById('analysis-output-title').textContent = "Risk Analysis Complete";
        document.getElementById('analysis-output-text').innerHTML = "Core metrics updated based on live data.<br>Analyzed 12 active facilities and 45 reported hazards.<br><strong>Overall System Risk Score: 8.1 (Stable)</strong>";
        container.style.display = 'block';
    }, 2000);
}

function generatePredictions() {
    showLoadingOverlay("Generating AI Predictive Models...");
    setTimeout(() => {
        hideLoadingOverlay();
        const container = document.getElementById('analysis-output');
        document.getElementById('analysis-output-title').textContent = "Predictive Models Generated";
        document.getElementById('analysis-output-text').innerHTML = "Models based on the last 6 months of incident data have been generated.<br><br><strong>Key Insight:</strong> 78% probability of pressure anomaly in Sector B over the next 14 days. Recommend preemptive maintenance on pressure valves.";
        container.style.display = 'block';
    }, 2500);
}

function showLoadingOverlay(text) {
    const overlay = document.getElementById('loading-overlay');
    document.getElementById('loading-text').textContent = text;
    overlay.classList.add('active');
}

function hideLoadingOverlay() {
    document.getElementById('loading-overlay').classList.remove('active');
}

// --- CHART RENDERING ---
function drawTrendChart() {
    const canvas = document.getElementById('riskTrendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.parentElement.clientWidth;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    const points = [
        { x: 0, y: 7.8 }, { x: 1, y: 8.1 }, { x: 2, y: 7.9 }, { x: 3, y: 8.3 },
        { x: 4, y: 7.6 }, { x: 5, y: 7.4 }, { x: 6, y: 7.3 }
    ];

    const padding = 30;
    const graphWidth = width - (padding * 2);
    const graphHeight = height - (padding * 2);
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.font = '10px Inter';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';

    for(let i = 5; i <= 10; i += 1) {
        let yPos = height - padding - ((i - 5) / 5) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(padding, yPos);
        ctx.lineTo(width - padding, yPos);
        ctx.stroke();
        ctx.fillText(i.toFixed(1), padding - 5, yPos + 3);
    }

    ctx.beginPath();
    ctx.strokeStyle = '#5c4dff';
    ctx.lineWidth = 3;
    
    points.forEach((p, index) => {
        let xPos = padding + (p.x / 6) * graphWidth;
        let yPos = height - padding - ((p.y - 5) / 5) * graphHeight;
        if(index === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
    });
    ctx.stroke();

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    ctx.fillStyle = '#5c4dff';
    ctx.textAlign = 'center';
    
    points.forEach((p, index) => {
        let xPos = padding + (p.x / 6) * graphWidth;
        let yPos = height - padding - ((p.y - 5) / 5) * graphHeight;
        
        ctx.beginPath();
        ctx.arc(xPos, yPos, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#666';
        ctx.fillText(labels[index], xPos, height - 5);
        ctx.fillStyle = '#5c4dff';
    });
}

window.addEventListener('resize', () => {
    if (document.getElementById('dashboard-page').classList.contains('active')) {
        drawTrendChart();
    }
});

// --- HAZARD MANAGEMENT ---
function calculateRisk(severity, probability) {
    if (severity === 'High' || probability === 'High') return 'High';
    if (severity === 'Medium' || probability === 'Medium') return 'Medium';
    return 'Low';
}

function openAddHazardModal() {
    document.getElementById('hazard-form').reset();
    document.getElementById('hazard-id').value = '';
    document.getElementById('modal-title').textContent = 'Report New Hazard';
    document.getElementById('hazard-modal').classList.add('active');
}

function closeHazardModal() {
    document.getElementById('hazard-modal').classList.remove('active');
}

function handleSaveHazard(e) {
    e.preventDefault();
    
    const idField = document.getElementById('hazard-id').value;
    const title = document.getElementById('hazard-title').value;
    const location = document.getElementById('hazard-location').value;
    const severity = document.getElementById('hazard-severity').value;
    const probability = document.getElementById('hazard-probability').value;
    const status = document.getElementById('hazard-status').value;
    const description = document.getElementById('hazard-description').value;
    
    const riskLevel = calculateRisk(severity, probability);

    if (idField) {
        // Update existing
        const haz = hazards.find(h => h.id == idField);
        if (haz) {
            haz.title = title;
            haz.location = location;
            haz.severity = severity;
            haz.probability = probability;
            haz.status = status;
            haz.description = description;
            haz.riskLevel = riskLevel;
            haz.score = riskLevel === 'High' ? 8.5 : riskLevel === 'Medium' ? 5.5 : 2.5;
            haz.priority = riskLevel === 'High' ? 'Critical' : riskLevel === 'Medium' ? 'Medium' : 'Low';
        }
    } else {
        const newHazard = {
            id: Date.now(),
            title,
            location,
            severity,
            probability,
            riskLevel,
            status,
            description,
            reportedBy: currentUser.name,
            date: new Date().toISOString().split('T')[0],
            score: riskLevel === 'High' ? 8.5 : riskLevel === 'Medium' ? 5.5 : 2.5,
            priority: riskLevel === 'High' ? 'Critical' : riskLevel === 'Medium' ? 'Medium' : 'Low'
        };
        hazards.push(newHazard);
    }

    localStorage.setItem('hars_hazards', JSON.stringify(hazards));
    closeHazardModal();
    renderDashboard();
}

function editHazard(id) {
    const haz = hazards.find(h => h.id === id);
    if (!haz) return;
    
    document.getElementById('hazard-id').value = haz.id;
    document.getElementById('hazard-title').value = haz.title;
    document.getElementById('hazard-location').value = haz.location;
    document.getElementById('hazard-severity').value = haz.severity;
    document.getElementById('hazard-probability').value = haz.probability;
    document.getElementById('hazard-status').value = haz.status || 'Pending';
    document.getElementById('hazard-description').value = haz.description;
    
    document.getElementById('modal-title').textContent = 'Edit Hazard';
    document.getElementById('hazard-modal').classList.add('active');
}

function resolveHazard(id) {
    if (confirm('Are you sure you want to mark this hazard as resolved?')) {
        const haz = hazards.find(h => h.id === id);
        if (haz) haz.status = 'Completed';
        localStorage.setItem('hars_hazards', JSON.stringify(hazards));
        renderDashboard();
    }
}

function deleteHazard(id) {
    if (confirm('Are you sure you want to completely delete this hazard report?')) {
        hazards = hazards.filter(h => h.id !== id);
        localStorage.setItem('hars_hazards', JSON.stringify(hazards));
        renderDashboard();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const hazModal = document.getElementById('hazard-modal');
    if (event.target === hazModal) closeHazardModal();
    
    const matModal = document.getElementById('material-modal');
    if (event.target === matModal) closeMaterialModal();
    
    const facModal = document.getElementById('facility-modal');
    if (event.target === facModal) closeFacilityModal();
}

// --- MOBILE MENU TOGGLE ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}
