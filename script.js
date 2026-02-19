let planetsData = [];
let currentMode = 'planets';
let currentFilter = 'all';
let animationFrameId;
let canvas3D, ctx3D;
let animationSpeed = 1;
let selectedPlanetInVisualization = null;


document.addEventListener('DOMContentLoaded', async function() {
    
    loadSavedTheme();
    
    showLoading(true);
    await loadData();
    initializeParticles();
    drawHeroAnimation();
    setupEventListeners();
    showLoading(false);
});


async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        planetsData = data.planets || [];
        const sunData = data.sun || {};
        const asteroidBeltData = data.asteroidBelt || {};
        const kuiperBeltData = data.kuiperBelt || {};
        const dwarfPlanetsData = data.dwarfPlanets || [];
        const missionsData = data.missions || [];
        const timelineData = data.timeline || [];

        
        displaySunInfo(sunData);
        displayPlanets(planetsData);
        displayMoons();
        displayRegions(asteroidBeltData, kuiperBeltData);
        displayDwarfPlanets(dwarfPlanetsData);
        displayMissions(missionsData);
        displayTimeline(timelineData);
        populateComparisonSelects();
        initializeComparisonDefaults();

        
        setTimeout(() => {
            canvas3D = document.getElementById('canvas3D');
            if (canvas3D && canvas3D.offsetParent !== null) {
                ctx3D = canvas3D.getContext('2d');
                canvas3D.width = canvas3D.offsetWidth;
                canvas3D.height = canvas3D.offsetHeight;
                drawOrbitalSystem();
            }
        }, 500);
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading solar system data. Please refresh the page.');
    }
}


function displaySunInfo(sun) {
    if (!sun || !sun.name) return;
    
    try {
        document.getElementById('sunDesc').textContent = sun.description || '';
        document.getElementById('sunDiameter').textContent = sun.diameter || 'N/A';
        document.getElementById('sunTemp').textContent = sun.temperature || 'N/A';
        document.getElementById('sunCoreTemp').textContent = sun.coreTemperature || 'N/A';
        document.getElementById('sunMass').textContent = sun.mass || 'N/A';
        document.getElementById('sunAge').textContent = sun.age || 'N/A';
        document.getElementById('sunLum').textContent = sun.luminosity || 'N/A';
    } catch (e) {
        console.error('Error displaying sun info:', e);
    }
}

function displayPlanets(planets) {
    const grid = document.getElementById('planetsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    planets.forEach((planet, index) => {
        const card = createPlanetCard(planet);
        grid.appendChild(card);
    });
}

function createPlanetCard(planet) {
    const card = document.createElement('div');
    card.className = 'planet-card';
    card.dataset.type = planet.type || 'unknown';
    card.dataset.name = (planet.name || '').toLowerCase();
    card.dataset.id = planet.id;

    card.innerHTML = `
        <div class="planet-visual" style="background: ${planet.color || '#fff'}; box-shadow: 0 0 30px ${planet.color || '#fff'}80;"></div>
        <h3 class="planet-name">${planet.emoji || '●'} ${planet.name || 'Unknown'}</h3>
        <p class="planet-type">${planet.type || 'Unknown'}</p>
        <div class="planet-distance">
            <span>${planet.distanceFromSun || 'N/A'}</span>
        </div>
        <button class="view-btn" onclick="viewPlanetDetails(${planet.id})">View Details</button>
    `;

    card.addEventListener('click', function(e) {
        if (!e.target.classList.contains('view-btn')) {
            viewPlanetDetails(planet.id);
        }
    });

    return card;
}

function displayMoons() {
    const grid = document.getElementById('moonsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const moonsList = [];
    planetsData.forEach(planet => {
        if (planet.moonsList && Array.isArray(planet.moonsList)) {
            planet.moonsList.forEach(moon => {
                moonsList.push({
                    ...moon,
                    parent: planet.name,
                    parentEmoji: planet.emoji
                });
            });
        }
    });
    
    moonsList.slice(0, 12).forEach(moon => {
        const card = document.createElement('div');
        card.className = 'moon-card';
        card.innerHTML = `
            <div class="moon-icon">🌙</div>
            <h3 class="moon-name">${moon.name || 'Unknown'}</h3>
            <p class="moon-parent">Orbits: ${moon.parentEmoji || ''} ${moon.parent || 'Unknown'}</p>
            <div class="moon-details">
                <p><strong>Diameter:</strong> ${moon.diameter || 'Unknown'}</p>
                ${moon.distance ? `<p><strong>Distance:</strong> ${moon.distance}</p>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

function displayRegions(asteroidBelt, kuiperBelt) {
    const asteroidCard = document.getElementById('asteroidBeltCard');
    if (asteroidCard && asteroidBelt && asteroidBelt.name) {
        asteroidCard.innerHTML = `
            <h2 class="region-name">🪨 ${asteroidBelt.name}</h2>
            <div class="region-info">
                <div class="region-info-item">
                    <span class="region-label">Type:</span>
                    <span class="region-value">${asteroidBelt.type || 'N/A'}</span>
                </div>
                <div class="region-info-item">
                    <span class="region-label">Location:</span>
                    <span class="region-value">${asteroidBelt.location || 'N/A'}</span>
                </div>
                <div class="region-info-item">
                    <span class="region-label">Distance from Sun:</span>
                    <span class="region-value">${asteroidBelt.distanceFromSun || 'N/A'}</span>
                </div>
                <div class="region-info-item">
                    <span class="region-label">Composition:</span>
                    <span class="region-value">${asteroidBelt.composition || 'N/A'}</span>
                </div>
                <div class="region-info-item">
                    <span class="region-label">Largest Object:</span>
                    <span class="region-value">${asteroidBelt.largestObject || 'N/A'}</span>
                </div>
            </div>
            <p style="margin-top: 1rem; color: #ffd93d; font-style: italic;">${asteroidBelt.funFact || ''}</p>
        `;
    }
    
    const kuiperCard = document.getElementById('kuiperBeltCard');
    if (kuiperCard && kuiperBelt && kuiperBelt.name) {
        kuiperCard.innerHTML = `
            <h2 class="region-name">❄️ ${kuiperBelt.name}</h2>
            <div class="region-info">
                <div class="region-info-item">
                    <span class="region-label">Type:</span>
                    <span class="region-value">${kuiperBelt.type || 'N/A'}</span>
                </div>
                <div class="region-info-item">
                    <span class="region-label">Location:</span>
                    <span class="region-value">${kuiperBelt.location || 'N/A'}</span>
                </div>
                <div class="region-info-item">
                    <span class="region-label">Distance from Sun:</span>
                    <span class="region-value">${kuiperBelt.distanceFromSun || 'N/A'}</span>
                </div>
                <div class="region-info-item">
                    <span class="region-label">Composition:</span>
                    <span class="region-value">${kuiperBelt.composition || 'N/A'}</span>
                </div>
                <div class="region-info-item">
                    <span class="region-label">Estimated Objects:</span>
                    <span class="region-value">${kuiperBelt.estimatedObjects || 'N/A'}</span>
                </div>
            </div>
            <p style="margin-top: 1rem; color: #ffd93d; font-style: italic;">${kuiperBelt.funFact || ''}</p>
        `;
    }
}

function displayDwarfPlanets(dwarfPlanets) {
    const grid = document.getElementById('dwarfPlanetsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    dwarfPlanets.forEach(dwarf => {
        const card = document.createElement('div');
        card.className = 'dwarf-planet-card';
        card.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${dwarf.emoji || '🔷'}</div>
            <h3 class="dwarf-name">${dwarf.name || 'Unknown'}</h3>
            <p class="dwarf-type">${dwarf.type || 'N/A'}</p>
            <div style="font-size: 0.9rem; color: #b0b0b0; margin: 1rem 0;">
                <p><strong>Diameter:</strong> ${dwarf.diameter || 'N/A'}</p>
                <p><strong>Distance:</strong> ${dwarf.distanceFromSun || 'N/A'}</p>
                <p><strong>Moons:</strong> ${dwarf.moons || '0'}</p>
            </div>
            <p style="font-size: 0.85rem; color: #ffd93d; margin-top: 0.5rem;">${dwarf.funFact || ''}</p>
        `;
        grid.appendChild(card);
    });
}

function displayMissions(missions) {
    const container = document.getElementById('missionsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    missions.forEach(mission => {
        const card = document.createElement('div');
        card.className = 'mission-card';
        
        let statusClass = 'mission-status';
        if (mission.status === 'active') statusClass += ' active';
        else if (mission.status === 'future') statusClass += ' future';
        
        card.innerHTML = `
            <div class="mission-year">${mission.year || 'N/A'}</div>
            <div class="mission-name">${mission.name || 'Unknown'}</div>
            <div class="mission-description">${mission.description || 'No description'}</div>
            <span class="${statusClass}">${(mission.status || 'completed').charAt(0).toUpperCase() + (mission.status || 'completed').slice(1)}</span>
        `;
        container.appendChild(card);
    });
}

function displayTimeline(timeline) {
    const container = document.getElementById('timelineContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    timeline.forEach(event => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-date">${event.date || 'N/A'}</div>
            <div class="timeline-content">
                <div class="timeline-title">${event.title || 'Event'}</div>
                <div class="timeline-description">${event.description || 'No details'}</div>
            </div>
        `;
        container.appendChild(item);
    });
}


function viewPlanetDetails(id) {
    const planet = planetsData.find(p => p.id === id);
    if (!planet) return;
    openModal(planet);
}

function openModal(planet) {
    const modal = document.getElementById('planetModal');
    if (!modal) return;
    
    const visualLarge = document.getElementById('planetVisualLarge');
    visualLarge.style.background = planet.color || '#fff';
    visualLarge.style.boxShadow = `0 0 50px ${planet.color || '#fff'}80`;

    document.getElementById('planetNameLarge').textContent = `${planet.emoji || ''} ${planet.name || 'Unknown'}`;

    const modalInfo = document.getElementById('modalInfo');
    
    let moonsHTML = '';
    if (planet.moonsList && planet.moonsList.length > 0) {
        moonsHTML = `<div style="margin-top: 1rem;"><strong>Major Moons:</strong><br>`;
        planet.moonsList.forEach(moon => {
            moonsHTML += `<span style="font-size: 0.9rem; color: #b0b0b0;">• ${moon.name} (${moon.diameter || 'N/A'})</span><br>`;
        });
        moonsHTML += `</div>`;
    }
    
    modalInfo.innerHTML = `
        <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 1rem;">${planet.description || 'No description available'}</p>
        
        <h3>📖 Discovery & Composition</h3>
        <div class="detail-row">
            <div class="detail-item">
                <div class="detail-label">Discovered By</div>
                <div class="detail-value">${planet.discoveredBy || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Discovery Year</div>
                <div class="detail-value">${planet.discoveryYear || 'N/A'}</div>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-item">
                <div class="detail-label">Age of Planet</div>
                <div class="detail-value">${planet.ageOfPlanet || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Composition</div>
                <div class="detail-value">${planet.composition || 'N/A'}</div>
            </div>
        </div>

        <h3>🌍 Physical Characteristics</h3>
        <div class="detail-row">
            <div class="detail-item">
                <div class="detail-label">Diameter</div>
                <div class="detail-value">${planet.diameter || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Mass</div>
                <div class="detail-value">${planet.mass || 'N/A'}</div>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-item">
                <div class="detail-label">Density</div>
                <div class="detail-value">${planet.density || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Surface Composition</div>
                <div class="detail-value">${planet.surfaceComposition || 'N/A'}</div>
            </div>
        </div>

        <h3>🚀 Orbital Information</h3>
        <div class="detail-row">
            <div class="detail-item">
                <div class="detail-label">Distance from Sun</div>
                <div class="detail-value">${planet.distanceFromSun || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Light Years Away</div>
                <div class="detail-value">${planet.lightYearFromSun || 'N/A'}</div>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-item">
                <div class="detail-label">Orbital Period</div>
                <div class="detail-value">${planet.orbitalPeriod || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Rotation Period</div>
                <div class="detail-value">${planet.rotationPeriod || 'N/A'}</div>
            </div>
        </div>

        <h3>🌡️ Temperature & Atmosphere</h3>
        <div class="detail-row">
            <div class="detail-item">
                <div class="detail-label">Maximum Temperature</div>
                <div class="detail-value">${planet.maximumTemperature || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Minimum Temperature</div>
                <div class="detail-value">${planet.minimumTemperature || 'N/A'}</div>
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Atmosphere Composition</div>
            <div class="detail-value">${planet.atmosphere || 'N/A'}</div>
        </div>

        <h3>⚡ Other Characteristics</h3>
        <div class="detail-row">
            <div class="detail-item">
                <div class="detail-label">Gravity</div>
                <div class="detail-value">${planet.gravity || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Escape Velocity</div>
                <div class="detail-value">${planet.escapeVelocity || 'N/A'}</div>
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Magnetic Field</div>
            <div class="detail-value">${planet.magneticField || 'N/A'}</div>
        </div>

        <h3>🌙 Moons & Rings</h3>
        <div class="detail-row">
            <div class="detail-item">
                <div class="detail-label">Number of Moons</div>
                <div class="detail-value">${planet.moons || '0'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Ring System</div>
                <div class="detail-value">${planet.ringSystem ? '✓ Yes' : 'None'}</div>
            </div>
        </div>
        ${planet.ringSystem && planet.ringDescription ? `
        <div class="detail-item" style="margin-top: 1rem;">
            <div class="detail-label">Ring Description</div>
            <div class="detail-value">${planet.ringDescription}</div>
        </div>
        ` : ''}
        ${moonsHTML}

        <h3>💡 Fun Fact</h3>
        <p style="background: rgba(255, 215, 0, 0.1); padding: 1rem; border-radius: 8px; border-left: 3px solid #ffd93d; margin-top: 1rem;">${planet.funFact || 'Interesting fact about this planet'}</p>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('planetModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}


function filterByCriteria(criteria) {
    currentFilter = criteria;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    const grid = document.getElementById('planetsGrid');
    if (!grid) return;
    
    const cards = grid.querySelectorAll('.planet-card');
    
    cards.forEach(card => {
        const cardType = card.dataset.type || '';
        const shouldShow = criteria === 'all' || cardType.toLowerCase().includes(criteria.toLowerCase());
        
        if (shouldShow) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

function sortPlanetsBy(sortBy) {
    let sorted = [...planetsData];
    
    if (sortBy === 'size') {
        sorted.sort((a, b) => {
            const diamA = parseFloat(a.diameter) || 0;
            const diamB = parseFloat(b.diameter) || 0;
            return diamB - diamA;
        });
    } else if (sortBy === 'moons') {
        sorted.sort((a, b) => (b.moons || 0) - (a.moons || 0));
    } else if (sortBy === 'distance') {
        sorted.sort((a, b) => (a.distanceFromSunKm || 0) - (b.distanceFromSunKm || 0));
    } else {
        sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
    }
    
    displayPlanets(sorted);
}


function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => sortPlanetsBy(e.target.value));
    }
    
    const themeToggle = document.querySelector('.theme-btn');
    const canvas3DElement = document.getElementById('canvas3D');
    if (canvas3DElement) {
        canvas3DElement.addEventListener('click', handleCanvasClick);
    }
}

function performSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const grid = document.getElementById('planetsGrid');
    if (!grid) return;
    
    const cards = grid.querySelectorAll('.planet-card');
    
    cards.forEach(card => {
        const name = card.dataset.name || '';
        const type = card.dataset.type || '';
        
        if (searchTerm === '' || name.includes(searchTerm) || type.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
}


function populateComparisonSelects() {
    const select1 = document.getElementById('planet1Select');
    const select2 = document.getElementById('planet2Select');
    
    if (!select1 || !select2) return;
    
    select1.innerHTML = '<option value="">-- Select Planet 1 --</option>';
    select2.innerHTML = '<option value="">-- Select Planet 2 --</option>';
    
    planetsData.forEach(planet => {
        const option1 = document.createElement('option');
        option1.value = planet.id;
        option1.textContent = `${planet.emoji || ''} ${planet.name || 'Unknown'}`;
        select1.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = planet.id;
        option2.textContent = `${planet.emoji || ''} ${planet.name || 'Unknown'}`;
        select2.appendChild(option2);
    });
    
    select1.addEventListener('change', updateComparison);
    select2.addEventListener('change', updateComparison);
}

function initializeComparisonDefaults() {
    if (planetsData.length >= 2) {
        const select1 = document.getElementById('planet1Select');
        const select2 = document.getElementById('planet2Select');
        if (select1 && select2) {
            select1.value = planetsData[0].id;
            select2.value = planetsData[1].id;
            updateComparison();
        }
    }
}

function updateComparison() {
    const planet1Id = parseInt(document.getElementById('planet1Select').value);
    const planet2Id = parseInt(document.getElementById('planet2Select').value);
    const display = document.getElementById('comparisonDisplay');
    
    if (!display) return;
    
    if (!planet1Id || !planet2Id) {
        display.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">Select two planets to compare</p>';
        return;
    }
    
    const p1 = planetsData.find(p => p.id === planet1Id);
    const p2 = planetsData.find(p => p.id === planet2Id);
    
    if (p1 && p2) {
        display.innerHTML = `
            <div class="comparison-item">
                <div class="comparison-planet-name">${p1.emoji || ''} ${p1.name}</div>
                <div class="comparison-data">
                    <div class="comparison-row"><span class="comparison-label">Diameter:</span><span class="comparison-value">${p1.diameter || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Mass:</span><span class="comparison-value">${p1.mass || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Distance:</span><span class="comparison-value">${p1.distanceFromSun || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Orbital Period:</span><span class="comparison-value">${p1.orbitalPeriod || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Temperature:</span><span class="comparison-value">${p1.temperature || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Moons:</span><span class="comparison-value">${p1.moons || '0'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Gravity:</span><span class="comparison-value">${p1.gravity || 'N/A'}</span></div>
                </div>
            </div>
            <div class="comparison-item">
                <div class="comparison-planet-name">${p2.emoji || ''} ${p2.name}</div>
                <div class="comparison-data">
                    <div class="comparison-row"><span class="comparison-label">Diameter:</span><span class="comparison-value">${p2.diameter || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Mass:</span><span class="comparison-value">${p2.mass || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Distance:</span><span class="comparison-value">${p2.distanceFromSun || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Orbital Period:</span><span class="comparison-value">${p2.orbitalPeriod || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Temperature:</span><span class="comparison-value">${p2.temperature || 'N/A'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Moons:</span><span class="comparison-value">${p2.moons || '0'}</span></div>
                    <div class="comparison-row"><span class="comparison-label">Gravity:</span><span class="comparison-value">${p2.gravity || 'N/A'}</span></div>
                </div>
            </div>
        `;
    }
}

function compareCharacteristics() {
    const planet1Id = parseInt(document.getElementById('planet1Select').value);
    const planet2Id = parseInt(document.getElementById('planet2Select').value);
    
    if (!planet1Id || !planet2Id) {
        alert('Please select both planets first');
        return;
    }
    
    alert('Detailed comparison feature active! Compare all characteristics including atmosphere, geology, and orbital mechanics.');
}


function switchMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const sectionId = `${mode}Section`;
    const section = document.getElementById(sectionId);
    
    if (section) {
        section.classList.add('active');
    }
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    if (mode === 'visualization') {
        setTimeout(() => {
            canvas3D = document.getElementById('canvas3D');
            if (canvas3D && !ctx3D) {
                ctx3D = canvas3D.getContext('2d');
                canvas3D.width = canvas3D.offsetWidth;
                canvas3D.height = canvas3D.offsetHeight;
            }
            drawOrbitalSystem();
        }, 100);
    } else if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}


function drawOrbitalSystem() {
    if (!ctx3D || !canvas3D) return;
    
    const width = canvas3D.width;
    const height = canvas3D.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    
    const grd = ctx3D.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, 'rgba(5, 10, 26, 0.9)');
    grd.addColorStop(1, 'rgba(10, 14, 39, 0.9)');
    ctx3D.fillStyle = grd;
    ctx3D.fillRect(0, 0, width, height);
    
    const showOrbits = document.getElementById('showOrbits')?.checked !== false;
    
    
    if (showOrbits) {
        planetsData.forEach(planet => {
            const distance = (planet.id * 45) - 20;
            ctx3D.strokeStyle = 'rgba(0, 217, 255, 0.1)';
            ctx3D.lineWidth = 1;
            ctx3D.beginPath();
            ctx3D.arc(centerX, centerY, distance, 0, Math.PI * 2);
            ctx3D.stroke();
        });
    }
    
    
    ctx3D.fillStyle = '#ffd93d';
    ctx3D.shadowBlur = 20;
    ctx3D.shadowColor = '#ffd93d';
    ctx3D.beginPath();
    ctx3D.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx3D.fill();
    ctx3D.shadowBlur = 0;
    
    
    const time = Date.now() / 6000;
    planetsData.forEach(planet => {
        const distance = (planet.id * 45) - 20;
        const period = planet.id * 2;
        const angle = (time / period) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        
        const baseSize = planet.type.includes('Gas') ? 10 : 6;
        
        ctx3D.fillStyle = planet.color || '#fff';
        ctx3D.shadowBlur = 12;
        ctx3D.shadowColor = planet.color || '#fff';
        ctx3D.beginPath();
        ctx3D.arc(x, y, baseSize, 0, Math.PI * 2);
        ctx3D.fill();
        ctx3D.shadowBlur = 0;
        
        
        ctx3D.fillStyle = '#b0b0b0';
        ctx3D.font = '10px Arial';
        ctx3D.fillText(planet.name.substring(0, 3), x - 10, y - 15);
    });
    
    animationFrameId = requestAnimationFrame(drawOrbitalSystem);
}

function updateVisualization() {
    const viewMode = document.getElementById('viewMode')?.value || 'orbit';
    const speedValue = document.getElementById('speedSlider')?.value || 1;
    
    
    if (viewMode === 'realscale') {
        animationSpeed = parseFloat(speedValue) * 0.1;
    } else if (viewMode === 'compact') {
        animationSpeed = parseFloat(speedValue) * 3;
    } else {
        animationSpeed = parseFloat(speedValue);
    }
    
    drawOrbitalSystem();
}

function resetVisualization() {
    const viewMode = document.getElementById('viewMode');
    const speedSlider = document.getElementById('speedSlider');
    const showOrbits = document.getElementById('showOrbits');
    
    if (viewMode) viewMode.value = 'orbit';
    if (speedSlider) speedSlider.value = 1;
    if (showOrbits) showOrbits.checked = true;
    
    drawOrbitalSystem();
}


function handleCanvasClick(event) {
    if (!canvas3D) return;
    
    const rect = canvas3D.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const centerX = canvas3D.width / 2;
    const centerY = canvas3D.height / 2;
    const time = Date.now() / 6000;
    
    
    planetsData.forEach(planet => {
        const distance = (planet.id * 45) - 20;
        const period = planet.id * 2;
        const angle = (time / period) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const radius = planet.type.includes('Gas') ? 10 : 6;
        
        const dist = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
        if (dist < radius + 10) { 
            displayPlanetInVisualizationPanel(planet);
        }
    });
    
    
    const dist = Math.sqrt((clickX - centerX) ** 2 + (clickY - centerY) ** 2);
    if (dist < 25) {
        displaySunInVisualizationPanel();
    }
}

function displayPlanetInVisualizationPanel(planet) {
    const nameEl = document.getElementById('viewPlanetName');
    const infoEl = document.getElementById('viewPlanetInfo');
    
    if (!nameEl || !infoEl) return;
    
    selectedPlanetInVisualization = planet.id;
    nameEl.textContent = `${planet.emoji || ''} ${planet.name}`;
    
    infoEl.innerHTML = `
        <div style="font-size: 0.95rem; line-height: 1.8;">
            <p><strong>Type:</strong> ${planet.type}</p>
            <p><strong>Distance from Sun:</strong> ${planet.distanceFromSun}</p>
            <p><strong>Diameter:</strong> ${planet.diameter}</p>
            <p><strong>Temperature:</strong> ${planet.temperature}</p>
            <p><strong>Atmosphere:</strong> ${planet.atmosphere}</p>
            <p><strong>Moons:</strong> ${planet.moons}</p>
            <p><strong>Gravity:</strong> ${planet.gravity}</p>
            ${planet.discoveredBy ? `<p><strong>Discovered by:</strong> ${planet.discoveredBy}</p>` : ''}
            ${planet.discoveryYear ? `<p><strong>Discovery Year:</strong> ${planet.discoveryYear}</p>` : ''}
            <p style="margin-top: 1rem; font-style: italic; color: #ffd93d;">💡 ${planet.funFact}</p>
        </div>
    `;
}

function displaySunInVisualizationPanel() {
    const nameEl = document.getElementById('viewPlanetName');
    const infoEl = document.getElementById('viewPlanetInfo');
    
    if (!nameEl || !infoEl) return;
    
    selectedPlanetInVisualization = 0;
    nameEl.textContent = '☀️  The Sun';
    
    
    infoEl.innerHTML = `
        <div style="font-size: 0.95rem; line-height: 1.8;">
            <p><strong>Type:</strong> G-type Main-sequence Star</p>
            <p><strong>Diameter:</strong> 1,391,000 km</p>
            <p><strong>Mass:</strong> 1.989 × 10³⁰ kg</p>
            <p><strong>Temperature (Surface):</strong> 5,500 °C</p>
            <p><strong>Core Temperature:</strong> 15.7 Million °C</p>
            <p><strong>Age:</strong> 4.603 Billion Years</p>
            <p style="margin-top: 1rem; font-style: italic; color: #ffd93d;">💡 Every second, the Sun converts 600 million tons of hydrogen into helium!</p>
        </div>
    `;
}


function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.dataset.theme = savedTheme;
    updateThemeButton();
}

function toggleTheme() {
    const currentTheme = document.body.dataset.theme || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    updateThemeButton();
}

function updateThemeButton() {
    const themeBtn = document.querySelector('.theme-btn');
    const currentTheme = document.body.dataset.theme || 'dark';
    if (themeBtn) {
        themeBtn.textContent = currentTheme === 'light' ? '🌙' : '☀️';
        themeBtn.title = currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
}


function drawHeroAnimation() {
    const heroCanvas = document.getElementById('heroCanvas');
    if (!heroCanvas) return;
    
    const ctx = heroCanvas.getContext('2d');
    heroCanvas.width = heroCanvas.offsetWidth;
    heroCanvas.height = heroCanvas.offsetHeight;
    
    let particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * heroCanvas.width;
            this.y = Math.random() * heroCanvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0) this.x = heroCanvas.width;
            if (this.x > heroCanvas.width) this.x = 0;
            if (this.y < 0) this.y = heroCanvas.height;
            if (this.y > heroCanvas.height) this.y = 0;
        }
        
        draw() {
            ctx.fillStyle = `rgba(0, 217, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    ctx.strokeStyle = `rgba(0, 217, 255, ${0.15 * (1 - distance / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}


function initializeParticles() {
    const container = document.getElementById('particlesBackground');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 250 + 150;
        particle.style.position = 'absolute';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = `radial-gradient(circle, rgba(0, 217, 255, ${Math.random() * 0.08 + 0.02}) 0%, transparent 70%)`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 25 + 15}s ease-in-out infinite`;
        particle.style.pointerEvents = 'none';
        container.appendChild(particle);
    }
}


function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        if (show) {
            spinner.classList.add('active');
        } else {
            spinner.classList.remove('active');
        }
    }
}


window.onclick = function(event) {
    const modal = document.getElementById('planetModal');
    if (modal && event.target === modal) {
        closeModal();
    }
};

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

window.addEventListener('beforeunload', function() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});


window.addEventListener('resize', function() {
    if (canvas3D && currentMode === 'visualization') {
        canvas3D.width = canvas3D.offsetWidth;
        canvas3D.height = canvas3D.offsetHeight;
        drawOrbitalSystem();
    }
});
