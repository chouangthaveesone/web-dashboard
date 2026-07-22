// 1. Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmODvMgq46_hKkbIbyXI041GZ0tuicxZI",
    authDomain: "software-report-dashboard.firebaseapp.com",
    projectId: "software-report-dashboard",
    storageBucket: "software-report-dashboard.firebasestorage.app",
    messagingSenderId: "502005539016",
    appId: "1:502005539016:web:23e901315469a0a42ac5fd",
    measurementId: "G-QYYC564LDN"
};

// 2. Initialize Firebase or use Fallback Database
let database = null;
let useLocalFallback = false;
const connectionStatusEl = document.getElementById('connection-status');

// Local storage proxy class
class LocalStorageDatabaseProxy {
    constructor() {
        // Clear legacy format if detected to force a clean upgrade to prefix-style IDs
        const dataStr = localStorage.getItem('projects');
        if (dataStr && (dataStr.includes('"pjId":"1"') || dataStr.includes('"pjId":"2"'))) {
            localStorage.removeItem('projects');
        }

        if (!localStorage.getItem('projects')) {
            // Seed with sample data matching user's image if empty (using prefix ID format)
            const seedData = {
                "sample-1": {
                    bank: "BCEL",
                    pjId: "BCE001",
                    project: "CRM HQV 01 Miss USD 01 Note",
                    description: "BCEL team report customer deposit USD 500 note at CRM HQV 01 note missing in second transaction\n- Insert 05 note, accept 01 note, reject 04 note\n- Insert 04 note, accept 00 note, reject 04 note",
                    currentStatus: "Collect transaction issue information report to VN team support investigating root caused",
                    solutions: "Follow HCS team investigating and advise result",
                    pjType: "PPR",
                    priority: "High",
                    status: "In progress",
                    actionBy: "Primesys/BCEL",
                    projectDate: "25-May-26",
                    targetDate: "17-Jul-26",
                    weeklyActivity: "[07Jul]: HCS team feedback cannot find the root case of note 100 usd missing on CRM Logs\n[08Jul]: PS team show customer did deposit note on machine back to HCS again",
                    pendingBy: "Primesys",
                    reference: "Obee/Chouang",
                    follow: "Follow HCS team response result of issue missing 100 usd 01 note",
                    remark: ""
                },
                "sample-2": {
                    bank: "BCEL",
                    pjId: "BCE002",
                    project: "Currency exchange phrase 2",
                    description: "Continue implement currency exchange: customize Ej format, Language and add new currency",
                    currentStatus: "Work with BCEL team collect URD",
                    solutions: "Continue work with bank team collect URD",
                    pjType: "PROJ",
                    priority: "Medium",
                    status: "In progress",
                    actionBy: "Primesys/BCEL",
                    projectDate: "25-Mar-26",
                    targetDate: "25-Oct-26",
                    weeklyActivity: "[06Jul]: Received final URD and send to VN team\n[06Jul]: HCS team send question list to BCEL team clarify currency add to Currency exchange\n[10Jul]: BCEL team on internal discussion",
                    pendingBy: "Primesys",
                    reference: "Obee/Chouang",
                    follow: "Follow Bank team feedback the clarify additional new currency question",
                    remark: ""
                },
                "sample-3": {
                    bank: "BCEL",
                    pjId: "BCE003",
                    project: "CRM BCEL Hanged on processing screen while exit vendor mode to ATM Mode",
                    description: "VDA mode on CRM UAT/Production hanged while exiting to Atm mode (need to start new app)",
                    currentStatus: "Collect VDA logs and raise to HCS team support investigate and provide solutions",
                    solutions: "Wait from HCS team investigate root cause",
                    pjType: "PPR",
                    priority: "High",
                    status: "In progress",
                    actionBy: "Primesys/BCEL",
                    projectDate: "19-Mar-26",
                    targetDate: "25-Jul-26",
                    weeklyActivity: "[10Jun]: Email push PS team progress with HCS team update result of their investigating root caused",
                    pendingBy: "Primesys",
                    reference: "Som/Pho",
                    follow: "Wait from HCS team feedback",
                    remark: ""
                },
                "sample-4": {
                    bank: "BCEL",
                    pjId: "BCE004",
                    project: "CRM template improve rate accepte 100k & 1000b",
                    description: "Improvement CRM accepte note rate for LAK 100,000 and THB 1000",
                    currentStatus: "Collect note data of 100.000 LAK and 1.000 THB successful",
                    solutions: "Submit note data file to HCS-JP team review",
                    pjType: "PPR",
                    priority: "Medium",
                    status: "In progress",
                    actionBy: "Primesys/BCEL",
                    projectDate: "27-Oct-25",
                    targetDate: "30-Jun-26",
                    weeklyActivity: "[03Jul]: HCS team update unfortunately to arrange resource support development plan of July and believe to provide more example other currency blue mark before next development",
                    pendingBy: "HCS",
                    reference: "Obee/Pho",
                    follow: "Follow HCS team provide next development plan",
                    remark: ""
                },
                "sample-5": {
                    bank: "BCEL",
                    pjId: "BCE005",
                    project: "CRM BCEL Champasak brnach isn't recore ATM CANNOT TRANSMIT on transaction timeout",
                    description: "After udpate package QR code bank team report CRM in Champasak branch get issue time out during transaction, but iAtm app isn't report ATM CANNOT TRANSMIT to Fidata",
                    currentStatus: "Deploy patch fix issue ATM CANNOT TRANSMIT to CRM Hqv 02 to monitoring",
                    solutions: "Deploy package to procution",
                    pjType: "PPR",
                    priority: "High",
                    status: "In progress",
                    actionBy: "Primesys/BCEL",
                    projectDate: "23-Jun-25",
                    targetDate: "30-Jun-26",
                    weeklyActivity: "[30Jul]: Deploy package CRM HQV01-02-03-04 to monitoring",
                    pendingBy: "HCS/Primesys",
                    reference: "Obee/Pho",
                    follow: "Request Bank team approve deploy all machine",
                    remark: ""
                }
            };
            localStorage.setItem('projects', JSON.stringify(seedData));
        }
    }

    ref(path) {
        return {
            on: (event, callback) => {
                this.callback = callback;
                // Emit initial value
                const data = JSON.parse(localStorage.getItem('projects') || '{}');
                callback({
                    forEach: (childCallback) => {
                        Object.keys(data).forEach(key => {
                            childCallback({
                                key: key,
                                val: () => data[key]
                            });
                        });
                    }
                });
                // Watch storage changes
                window.addEventListener('storage-update', () => {
                    const freshData = JSON.parse(localStorage.getItem('projects') || '{}');
                    callback({
                        forEach: (childCallback) => {
                            Object.keys(freshData).forEach(key => {
                                childCallback({
                                    key: key,
                                    val: () => freshData[key]
                                });
                            });
                        }
                    });
                });
            },
            push: (payload) => {
                return new Promise((resolve) => {
                    const data = JSON.parse(localStorage.getItem('projects') || '{}');
                    const newId = 'local-' + Date.now();
                    data[newId] = payload;
                    localStorage.setItem('projects', JSON.stringify(data));
                    window.dispatchEvent(new Event('storage-update'));
                    resolve();
                });
            },
            update: (payload) => {
                return new Promise((resolve) => {
                    const data = JSON.parse(localStorage.getItem('projects') || '{}');
                    const id = path.split('/').pop();
                    data[id] = Object.assign({}, data[id], payload);
                    localStorage.setItem('projects', JSON.stringify(data));
                    window.dispatchEvent(new Event('storage-update'));
                    resolve();
                });
            }
        };
    }
}

// 3. Attempt Firebase setup with a 2-second timeout fallback
try {
    firebase.initializeApp(firebaseConfig);
    const rawDb = firebase.database();
    
    // Check connection state
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('timeout'), 2000));
    const connectPromise = new Promise((resolve) => {
        rawDb.ref(".info/connected").on("value", (snap) => {
            if (snap.val() === true) {
                resolve('connected');
            }
        });
    });

    Promise.race([connectPromise, timeoutPromise]).then((status) => {
        if (status === 'connected') {
            database = rawDb;
            connectionStatusEl.className = "text-xs text-emerald-400";
            connectionStatusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Connected to Firebase';
        } else {
            console.warn("Firebase connection timed out. Falling back to LocalStorage.");
            useLocalFallback = true;
            database = new LocalStorageDatabaseProxy();
            connectionStatusEl.className = "text-xs text-amber-400";
            connectionStatusEl.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Offline Mode (LocalStorage Active)';
        }
        initializeDashboard();
    });
} catch (e) {
    console.error("Firebase initialization failed. Falling back to LocalStorage.", e);
    useLocalFallback = true;
    database = new LocalStorageDatabaseProxy();
    connectionStatusEl.className = "text-xs text-amber-400";
    connectionStatusEl.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Offline Mode (LocalStorage Active)';
    initializeDashboard();
}

// 4. State Management
let currentStatusTab = 'In progress';
let allProjectsData = []; // Cached array of {id, data}

// 5. Chart Instances
let chartInProgressInstance = null;
let chartHoldInstance = null;
let chartCloseInstance = null;

// 6. Setup / Initialize Dashboard
function initializeDashboard() {
    switchTab('In progress');
}

// Switch Table tabs
function switchTab(status) {
    currentStatusTab = status;
    ['In progress', 'Hold', 'Close'].forEach(s => {
        const btn = document.getElementById(`tab-${s.replace(' ', '-')}`);
        if (s === status) {
            btn.className = "flex-1 lg:flex-none px-6 py-2.5 text-xs md:text-sm font-semibold rounded-lg bg-emerald-600 text-white transition shadow-md border border-emerald-500/30";
        } else {
            btn.className = "flex-1 lg:flex-none px-6 py-2.5 text-xs md:text-sm font-semibold rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition";
        }
    });
    loadRealtimeData();
}

// 7. Load Realtime Data
function loadRealtimeData() {
    database.ref('projects').on('value', (snapshot) => {
        allProjectsData = [];
        snapshot.forEach((childSnapshot) => {
            allProjectsData.push({
                id: childSnapshot.key,
                data: childSnapshot.val()
            });
        });

        // Apply visual updates & chart updates
        updateMetricsAndCharts();
        renderTable();
    });
}

// 8. Update Stats and 3 Charts (In Progress, Hold, Close)
function updateMetricsAndCharts() {
    // 1. Calculate Status Counts
    const inProgressCount = allProjectsData.filter(p => p.data.status === 'In progress').length;
    const holdCount = allProjectsData.filter(p => p.data.status === 'Hold').length;
    const closeCount = allProjectsData.filter(p => p.data.status === 'Close').length;

    document.getElementById('stat-count-in-progress').innerText = `${inProgressCount} PJ`;
    document.getElementById('stat-count-hold').innerText = `${holdCount} PJ`;
    document.getElementById('stat-count-close').innerText = `${closeCount} PJ`;

    // 2. Prepare breakdown data per status (Breakdown by Bank)
    const getBreakdown = (status) => {
        const filtered = allProjectsData.filter(p => p.data.status === status);
        const counts = {};
        filtered.forEach(p => {
            const b = p.data.bank || 'Unknown';
            counts[b] = (counts[b] || 0) + 1;
        });
        return {
            labels: Object.keys(counts),
            data: Object.values(counts)
        };
    };

    const inProgressBreakdown = getBreakdown('In progress');
    const holdBreakdown = getBreakdown('Hold');
    const closeBreakdown = getBreakdown('Close');

    // Destroy existing charts to reload neatly
    if (chartInProgressInstance) chartInProgressInstance.destroy();
    if (chartHoldInstance) chartHoldInstance.destroy();
    if (chartCloseInstance) chartCloseInstance.destroy();

    // Chart Configuration Helper
    const chartConfig = (ctx, label, breakdown, baseColor) => {
        const hasData = breakdown.data.length > 0;
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: hasData ? breakdown.labels : ['No Projects'],
                datasets: [{
                    data: hasData ? breakdown.data : [1],
                    backgroundColor: hasData 
                        ? ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6']
                        : ['#374151'],
                    borderWidth: 1,
                    borderColor: '#1f2937'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#9ca3af',
                            font: { size: 9 },
                            boxWidth: 8
                        }
                    }
                },
                cutout: '70%'
            }
        });
    };

    // Instantiate active charts
    const ctxIP = document.getElementById('chart-in-progress').getContext('2d');
    chartInProgressInstance = chartConfig(ctxIP, 'In Progress', inProgressBreakdown, '#10b981');

    const ctxH = document.getElementById('chart-hold').getContext('2d');
    chartHoldInstance = chartConfig(ctxH, 'Hold', holdBreakdown, '#f59e0b');

    const ctxC = document.getElementById('chart-close').getContext('2d');
    chartCloseInstance = chartConfig(ctxC, 'Close', closeBreakdown, '#6366f1');
}

// 9. Apply Filters & Render Table
function applyFilters() {
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    const searchQuery = document.getElementById('filter-search').value.toLowerCase().trim();
    const filterBank = document.getElementById('filter-bank').value;
    const filterPriority = document.getElementById('filter-priority').value;
    const filterType = document.getElementById('filter-type').value;

    const filtered = allProjectsData.filter(item => {
        const data = item.data;

        // 1. Status Tab filter
        if (data.status !== currentStatusTab) return false;

        // 2. Bank filter
        if (filterBank && data.bank !== filterBank) return false;

        // 3. Priority filter
        if (filterPriority && data.priority !== filterPriority) return false;

        // 4. Project Type filter
        if (filterType && data.pjType !== filterType) return false;

        // 5. Search query (Matches Project, Description, or Reference)
        if (searchQuery) {
            const projectMatch = (data.project || '').toLowerCase().includes(searchQuery);
            const descMatch = (data.description || '').toLowerCase().includes(searchQuery);
            const refMatch = (data.reference || '').toLowerCase().includes(searchQuery);
            const actMatch = (data.weeklyActivity || '').toLowerCase().includes(searchQuery);
            if (!projectMatch && !descMatch && !refMatch && !actMatch) return false;
        }

        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="p-8 text-center text-gray-500 font-medium">No projects found matching the criteria.</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const data = item.data;
        const id = item.id;

        // Priority Badge coloring
        let priorityColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (data.priority === 'High') priorityColor = 'text-red-400 bg-red-500/10 border-red-500/20';
        if (data.priority === 'Medium' || data.priority === 'Midium') priorityColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';

        // Type Badge coloring
        let typeColor = 'bg-gray-700 text-gray-300';
        if (data.pjType === 'MNT') typeColor = 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30';
        if (data.pjType === 'PPR') typeColor = 'bg-rose-600/20 text-rose-400 border border-rose-500/30';
        if (data.pjType === 'PROJ') typeColor = 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30';

        // Status coloring
        let statusBadge = 'text-emerald-400 bg-emerald-500/10';
        if (data.status === 'Hold') statusBadge = 'text-amber-400 bg-amber-500/10';
        if (data.status === 'Close') statusBadge = 'text-gray-400 bg-gray-500/10';

        tbody.innerHTML += `
            <tr class="hover:bg-gray-800/60 transition border-b border-gray-800">
                <td class="p-4 font-bold text-gray-100 flex items-center gap-1.5">
                    <i class="fa-solid fa-building-columns text-emerald-500 text-xs"></i> ${data.bank || '-'}
                </td>
                <td class="p-4 text-gray-400 font-mono text-[11px] font-semibold">${data.pjId || '-'}</td>
                <td class="p-4 font-semibold text-emerald-400 break-words max-w-xs">
                    <button onclick="viewProjectDetails('${id}', ${JSON.stringify(data).replace(/"/g, '&quot;')})" class="text-left text-emerald-400 hover:text-emerald-300 underline font-semibold focus:outline-none transition-all">
                        ${data.project || '-'}
                    </button>
                </td>
                <td class="p-4 text-gray-300 whitespace-pre-line break-words max-w-sm">${data.currentStatus || '-'}</td>
                <td class="p-4"><span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${typeColor}">${data.pjType || 'Other'}</span></td>
                <td class="p-4"><span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border ${priorityColor}">${data.priority || 'Low'}</span></td>
                <td class="p-4"><span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${statusBadge}">${data.status || 'In progress'}</span></td>
                <td class="p-4 text-gray-400 font-medium">${data.actionBy || '-'}</td>
                <td class="p-4 text-gray-400 font-mono">${data.projectDate || '-'}</td>
                <td class="p-4 text-gray-400 font-mono">${data.targetDate || '-'}</td>
                <td class="p-4 text-center sticky right-0 bg-gray-900 shadow-xl z-10">
                    <button onclick="editData('${id}', ${JSON.stringify(data).replace(/"/g, '&quot;')})" class="bg-emerald-600/10 hover:bg-emerald-600/30 text-emerald-400 font-bold px-3 py-1.5 rounded border border-emerald-500/20 transition flex items-center gap-1 mx-auto text-[10px]">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                </td>
            </tr>
        `;
    });
}

// Helper to generate the prefix-style sequential ID based on Bank name
function generateNextPjId(bank) {
    // 1. Determine prefix (first 3 letters capitalized)
    const prefix = (bank || 'GEN').substring(0, 3).toUpperCase();
    
    // 2. Find maximum sequence number currently in allProjectsData
    let maxSeq = 0;
    allProjectsData.forEach(item => {
        const pjId = item.data.pjId || '';
        // Extract sequence number assuming format AAA999 or AAA+digits
        const match = pjId.match(/[A-Z]{3}(\d+)/i);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxSeq) {
                maxSeq = num;
            }
        }
    });
    
    const nextSeq = maxSeq + 1;
    const paddedSeq = String(nextSeq).padStart(3, '0');
    return `${prefix}${paddedSeq}`;
}

// 10. Open Modal for Insertion
function openModal() {
    document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-folder-plus text-xl"></i> Add Project / Issue Info';
    document.getElementById('item-id').value = '';
    
    // Default values
    document.getElementById('form-bank').value = 'BCEL'; 
    
    // Automatically generate next sequential PJ ID
    const nextId = generateNextPjId('BCEL');
    document.getElementById('form-pj-id').value = nextId;
    document.getElementById('form-pj-id').disabled = true; // Read-only to keep sequence integrity
    
    document.getElementById('form-project').value = '';
    document.getElementById('form-description').value = '';
    
    // Clear status/solution and hide them on creation as in standard flow
    document.getElementById('form-current-status').value = '';
    document.getElementById('form-solutions').value = '';
    document.getElementById('status-solutions-section').classList.add('hidden');

    document.getElementById('form-pj-type').value = 'PPR';
    document.getElementById('form-priority').value = 'Medium';
    document.getElementById('form-status').value = currentStatusTab;
    document.getElementById('form-action-by').value = '';
    document.getElementById('form-pending-by').value = '';
    document.getElementById('form-reference').value = '';
    document.getElementById('form-project-date').value = '';
    document.getElementById('form-target-date').value = '';
    document.getElementById('form-weekly-activity').value = '';
    document.getElementById('form-follow').value = '';
    document.getElementById('form-remark').value = '';

    document.getElementById('data-modal').classList.remove('hidden');
}

// Close Modal
function closeModal() {
    document.getElementById('data-modal').classList.add('hidden');
}

// Add event listener to form-bank to update the generated ID automatically
document.addEventListener('DOMContentLoaded', () => {
    const bankSelect = document.getElementById('form-bank');
    if (bankSelect) {
        bankSelect.addEventListener('change', (e) => {
            const isNew = !document.getElementById('item-id').value;
            if (isNew) {
                const nextId = generateNextPjId(e.target.value);
                document.getElementById('form-pj-id').value = nextId;
            }
        });
    }
});

// Project Details SPA view state
let activeDetailedProjectId = null;
let activeDetailedProjectData = null;

// Function to transition from Dashboard List to Project Detail View
function viewProjectDetails(id, data) {
    activeDetailedProjectId = id;
    activeDetailedProjectData = data;

    // Transition views smoothly
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Populate Detailed View Elements
    document.getElementById('detail-badge-bank').innerText = data.bank || 'BCEL';
    document.getElementById('detail-title-project').innerText = data.project || '-';
    document.getElementById('detail-val-description').innerText = data.description || 'No description provided.';
    document.getElementById('detail-val-current-status').innerText = data.currentStatus || 'No current status logged.';
    document.getElementById('detail-val-solutions').innerText = data.solutions || 'No solution logged.';
    document.getElementById('detail-val-weekly-activity').innerText = data.weeklyActivity || 'No activities logged yet.';
    document.getElementById('detail-val-pj-id').innerText = data.pjId || '-';

    // Priority Badge coloring
    const pBadge = document.getElementById('detail-badge-priority');
    pBadge.innerText = data.priority || 'Low';
    pBadge.className = 'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ';
    if (data.priority === 'High') {
        pBadge.className += 'text-red-400 bg-red-500/10 border-red-500/20';
    } else if (data.priority === 'Medium' || data.priority === 'Midium') {
        pBadge.className += 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else {
        pBadge.className += 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }

    // Type Badge coloring
    const tBadge = document.getElementById('detail-badge-pj-type');
    tBadge.innerText = data.pjType || 'Other';
    tBadge.className = 'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ';
    if (data.pjType === 'MNT') tBadge.className += 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30';
    else if (data.pjType === 'PPR') tBadge.className += 'bg-rose-600/20 text-rose-400 border border-rose-500/30';
    else if (data.pjType === 'PROJ') tBadge.className += 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30';
    else tBadge.className += 'bg-gray-700 text-gray-300';

    // Status Badge coloring
    const sBadge = document.getElementById('detail-badge-status');
    sBadge.innerText = data.status || 'In progress';
    sBadge.className = 'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ';
    if (data.status === 'Hold') sBadge.className += 'text-amber-400 bg-amber-500/10';
    else if (data.status === 'Close') sBadge.className += 'text-gray-400 bg-gray-500/10';
    else sBadge.className += 'text-emerald-400 bg-emerald-500/10';

    // Details Fields
    document.getElementById('detail-val-action-by').innerText = data.actionBy || '-';
    document.getElementById('detail-val-pending-by').innerText = data.pendingBy || '-';
    document.getElementById('detail-val-reference').innerText = data.reference || '-';
    document.getElementById('detail-val-project-date').innerText = data.projectDate || '-';
    document.getElementById('detail-val-target-date').innerText = data.targetDate || '-';
    document.getElementById('detail-val-follow').innerText = data.follow || 'No follow actions logged.';
    document.getElementById('detail-val-remark').innerText = data.remark || 'No remarks.';

    // Clear quick append log input
    document.getElementById('quick-activity-input').value = '';

    // Assign click action to Detail Edit button dynamically
    const editBtn = document.getElementById('detail-btn-edit');
    editBtn.onclick = () => {
        editData(id, data);
    };
}

// Function to return back to dashboard list
function closeProjectDetails() {
    activeDetailedProjectId = null;
    activeDetailedProjectData = null;

    document.getElementById('detail-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Quick append weekly activity logic
function quickAppendWeeklyActivity() {
    if (!activeDetailedProjectId || !activeDetailedProjectData) return;

    const inputEl = document.getElementById('quick-activity-input');
    const valueText = inputEl.value.trim();
    if (!valueText) {
        alert("Please enter some activity text first!");
        return;
    }

    // Build automated date prefix like [09Jul]:
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const prefix = `[${day}${month}]: `;

    // Create final appended text
    const currentActivity = activeDetailedProjectData.weeklyActivity || '';
    const newEntry = `${prefix}${valueText}`;
    const updatedActivity = currentActivity 
        ? `${currentActivity}\n${newEntry}` 
        : newEntry;

    // Update payload in DB
    database.ref('projects/' + activeDetailedProjectId).update({
        weeklyActivity: updatedActivity
    })
    .then(() => {
        // Dynamically update the cached data & render
        activeDetailedProjectData.weeklyActivity = updatedActivity;
        document.getElementById('detail-val-weekly-activity').innerText = updatedActivity;
        inputEl.value = '';
    })
    .catch((error) => {
        alert("Error appending activity: " + error.message);
    });
}

// 11. Edit Data (Prepopulate modal with all 17 fields)
function editData(id, data) {
    document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-pen-to-square text-xl"></i> Edit Project / Issue Info';
    document.getElementById('item-id').value = id;
    
    document.getElementById('form-bank').value = data.bank || 'BCEL';
    document.getElementById('form-pj-id').value = data.pjId || '';
    document.getElementById('form-pj-id').disabled = false; // Allow manual editing during Edit mode if needed, or keep editable
    document.getElementById('form-project').value = data.project || '';
    document.getElementById('form-description').value = data.description || '';
    
    // Unhide status/solutions on edit
    document.getElementById('form-current-status').value = data.currentStatus || '';
    document.getElementById('form-solutions').value = data.solutions || '';
    document.getElementById('status-solutions-section').classList.remove('hidden');

    document.getElementById('form-pj-type').value = data.pjType || 'PPR';
    // Standardize Medium/Midium spelling
    const priorityVal = data.priority === 'Midium' ? 'Medium' : (data.priority || 'Medium');
    document.getElementById('form-priority').value = priorityVal;
    
    document.getElementById('form-status').value = data.status || 'In progress';
    document.getElementById('form-action-by').value = data.actionBy || '';
    document.getElementById('form-pending-by').value = data.pendingBy || '';
    document.getElementById('form-reference').value = data.reference || '';
    document.getElementById('form-project-date').value = data.projectDate || '';
    document.getElementById('form-target-date').value = data.targetDate || '';
    document.getElementById('form-weekly-activity').value = data.weeklyActivity || '';
    document.getElementById('form-follow').value = data.follow || '';
    document.getElementById('form-remark').value = data.remark || '';

    document.getElementById('data-modal').classList.remove('hidden');
}

// 12. Save Data to Firebase or LocalStorage
function saveData() {
    const id = document.getElementById('item-id').value;
    
    // Make sure PJ ID is generated on save if it's empty (just in case)
    let pjIdVal = document.getElementById('form-pj-id').value;
    if (!pjIdVal) {
        pjIdVal = generateNextPjId(document.getElementById('form-bank').value);
    }

    const payload = {
        bank: document.getElementById('form-bank').value,
        pjId: pjIdVal,
        project: document.getElementById('form-project').value,
        description: document.getElementById('form-description').value,
        currentStatus: document.getElementById('form-current-status').value,
        solutions: document.getElementById('form-solutions').value,
        pjType: document.getElementById('form-pj-type').value,
        priority: document.getElementById('form-priority').value,
        status: document.getElementById('form-status').value,
        actionBy: document.getElementById('form-action-by').value,
        pendingBy: document.getElementById('form-pending-by').value,
        reference: document.getElementById('form-reference').value,
        projectDate: document.getElementById('form-project-date').value,
        targetDate: document.getElementById('form-target-date').value,
        weeklyActivity: document.getElementById('form-weekly-activity').value,
        follow: document.getElementById('form-follow').value,
        remark: document.getElementById('form-remark').value
    };

    const actionPromise = id 
        ? database.ref('projects/' + id).update(payload)
        : database.ref('projects').push(payload);

    actionPromise
        .then(() => { 
            closeModal(); 
            // If we are currently in the detailed view of this project, update the detailed view display dynamically
            if (activeDetailedProjectId === id) {
                viewProjectDetails(id, payload);
            } else if (!id) {
                // If it is a brand new project, transition back to dashboard view to let user see it
                closeProjectDetails();
            }
        })
        .catch((error) => { 
            alert("Database Error: " + error.message); 
        });
}

// 13. Export data to CSV
function exportToCSV() {
    if (allProjectsData.length === 0) {
        alert("No data to export!");
        return;
    }

    const headers = [
        "Bank", "No of PJ", "Project/Issue", "Description", "Current status",
        "Solution", "Project Type", "Priority", "Status", "Action by",
        "Project start date", "Target date to finish", "Weekly Activity",
        "Pending by", "Reference", "Follow", "REMARK"
    ];

    const csvRows = [headers.join(",")];

    allProjectsData.forEach(item => {
        const d = item.data;
        const row = [
            d.bank || "",
            d.pjId || "",
            d.project || "",
            d.description || "",
            d.currentStatus || "",
            d.solutions || "",
            d.pjType || "",
            d.priority || "",
            d.status || "",
            d.actionBy || "",
            d.projectDate || "",
            d.targetDate || "",
            d.weeklyActivity || "",
            d.pendingBy || "",
            d.reference || "",
            d.follow || "",
            d.remark || ""
        ].map(val => {
            // Escape double quotes and enclose value in quotes if it contains commas or newlines
            let escaped = String(val).replace(/"/g, '""');
            if (escaped.includes(",") || escaped.includes("\n") || escaped.includes("\r") || escaped.includes('"')) {
                escaped = `"${escaped}"`;
            }
            return escaped;
        });
        csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ATM_Worklog_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
