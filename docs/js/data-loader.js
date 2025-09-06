// Function to load and display experience data
function loadExperience() {
    fetch('assets/data/resume_data.yml')
        .then(response => response.text())
        .then(yamlText => {
            const data = jsyaml.load(yamlText);
            const container = document.getElementById('experience-container');
            
            data.entries.forEach(entry => {
                const experienceDiv = document.createElement('div');
                experienceDiv.className = 'd-flex flex-column flex-md-row justify-content-between mb-5';
                
                let bulletPointsHtml = '';
                if (entry.bullet_points && entry.bullet_points.length > 0) {
                    bulletPointsHtml = entry.bullet_points.map(point => `<p>${point}</p>`).join('');
                }
                const skillsHtml = entry.skills && entry.skills.length > 0
                    ? `<p class="mt-3"><strong>Skills:</strong> ${entry.skills.join(', ')}</p>`
                    : '';
                
                experienceDiv.innerHTML = `
                    <div class="flex-grow-1">
                        <h3 class="mb-0">${entry.job_title}</h3>
                        <div class="subheading mb-3">${entry.employer}</div>
                        ${bulletPointsHtml}
                        ${skillsHtml}
                    </div>
                    <div class="flex-shrink-0">
                        <span class="text-secondary">${entry.date_range}</span>
                    </div>
                `;
                container.appendChild(experienceDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing experience YAML:', error);
        });
}
//------------------------------------------------------------------------------------------------------------------------------------------------
// Function to load and display education data
function loadEducation() {
    fetch('assets/data/education_data.yml')
        .then(response => response.text())
        .then(yamlText => {
            const data = jsyaml.load(yamlText);
            const container = document.getElementById('education-container');
            
            data.education.forEach(entry => {
                const educationDiv = document.createElement('div');
                educationDiv.className = 'd-flex flex-column flex-md-row justify-content-between mb-5';
                
                let majorHtml = '';
                if (entry.major) {
                    majorHtml = `<div class="subheading mb-3">${entry.major}</div>`;
                }

                educationDiv.innerHTML = `
                    <div class="flex-grow-1">
                        <h3 class="mb-0">${entry.university}</h3>
                        <div class="subheading mb-0 allow-lowercase">${entry.degree}</div>
                        ${majorHtml}
                    </div>
                    <div class="flex-shrink-0">
                        <span class="text-secondary">${entry.date_range}</span>
                    </div>
                `;
                container.appendChild(educationDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing education YAML:', error);
        });
}
//------------------------------------------------------------------------------------------------------------------------------------------------
// Function to load and display publications from a TeX file
function loadPublications() {
    fetch('assets/data/publications.bib')
        .then(response => response.text())
        .then(bibText => {
            const container = document.getElementById('publications-container');
            
            try {
                const publications = new Cite(bibText);

                // Create ordered list
                const list = document.createElement('ol');
                container.appendChild(list);

                publications.data.forEach(entry => {
                    const li = document.createElement('li');
                    li.className = 'publication-entry';

                    // Extract data safely
                    const authors = Array.isArray(entry.author)
                        ? entry.author.map(author => `${author.given || ''} ${author.family || ''}`.trim()).join(', ')
                        : 'No Author';
                    
                    let title = (typeof entry.title === 'string') ? entry.title : 'No Title';
                    const journal = entry['container-title'] || entry['collection-title'] || entry['publisher'] || 'No Journal';
                    const year = (entry.issued && Array.isArray(entry.issued['date-parts']) && entry.issued['date-parts'][0])
                        ? entry.issued['date-parts'][0][0]
                        : 'No Year';
                    const url = entry.URL || '';
                    const volume = entry.volume || '';
                    const issue = entry.issue || '';
                    const pages = entry.page || '';
                    const doi = entry.DOI || '';

                    // Construct formatted string
                    let formattedText = `${authors}, `;
                    formattedText += `<span class="publication-title">"${title}"</span>, `;
                    formattedText += `<span class="publication-journal">${journal}</span>`;

                    if (volume) formattedText += `, Vol. ${volume}`;
                    if (issue) formattedText += `(${issue})`;
                    if (pages) formattedText += `, pp. ${pages}`;
                    if (year) formattedText += ` (${year})`;

                    if (url) {
                        formattedText += ` <a href="${url}" target="_blank">[link]</a>`;
                    } else if (doi) {
                        formattedText += ` <a href="https://doi.org/${doi}" target="_blank">[DOI]</a>`;
                    }

                    li.innerHTML = formattedText;
                    list.appendChild(li);

                    if (window.MathJax) {
                        MathJax.typesetPromise([li]).catch(err => console.error(err));
                    }
                });
            } catch (error) {
                console.error('Error parsing publications with Citation.js:', error);
            }
        })
        .catch(error => {
            console.error('Error fetching publications:', error);
        });
}

class SvgInjector {
    static async insertSvg(container, svgPath, labelText = '') {
        try {
            const response = await fetch(svgPath);
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svg = svgDoc.querySelector('svg');
            if (!svg) return;

            svg.removeAttribute('width');
            svg.removeAttribute('height');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            svg.style.display = 'block';
            svg.style.width = '1em';
            svg.style.height = '1em';
            svg.style.fill = 'currentColor';
            svg.style.verticalAlign = 'middle';

            svg.querySelectorAll('*').forEach(child => {
                child.removeAttribute('fill');
                child.removeAttribute('stroke');
            });

            const wrapper = document.createElement('span');
            wrapper.style.display = 'inline-flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'center';
            wrapper.style.width = '1em';
            wrapper.style.height = '1em';
            wrapper.appendChild(svg);

            container.innerHTML = '';
            container.appendChild(wrapper);

            if (labelText) {
                const labelDiv = document.createElement('div');
                labelDiv.style.textAlign = 'center';
                labelDiv.style.marginTop = '0.25em';
                labelDiv.style.fontSize = '0.7em';
                labelDiv.textContent = labelText;
                container.appendChild(labelDiv);
            }
        } catch (err) {
            console.error('Failed to load SVG:', svgPath, err);
        }
    }

    static async processAll() {
        const elements = document.querySelectorAll('.js-svg-icon');
        for (const el of elements) {
            const path = el.dataset.svgPath;
            const label = el.dataset.label || '';
            await SvgInjector.insertSvg(el, path, label);
        }
    }
}

function loadPosts() {
    const yamlPath = 'assets/data/posts.yml';        // YAML file path
    const containerId = 'blog-cards';                // Container ID
    const viewAllUrl = '/all-posts.html';           // "View All Posts" URL

    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(yamlPath)
        .then(res => res.text())
        .then(yamlText => {
            const posts = jsyaml.load(yamlText);

            // Optional: sort by date
            posts.sort((a, b) => {
                if (!a.date || !b.date) return 0;
                return new Date(b.date) - new Date(a.date);
            });

            // Only loop through the first two posts
            posts.slice(0, 2).forEach(post => {
                // Flip-style card container
                const card = document.createElement('div');
                card.className = 'card m-2';
                card.style.width = '500px';
                card.style.height = '300px';
                card.style.cursor = 'pointer';
                card.onclick = () => window.location.href = post.path;

                // Card inner HTML with flip animation
                card.innerHTML = `
                    <img class="card__image" src="${post.image}" alt="${post.title}" />
                    <div class="card__content">
                        <p class="card__title">${post.title}</p>
                        <p class="card__description">${post.description}</p>
                    </div>
                `;

                container.appendChild(card);
            });

            // Add "View All Posts" card at the end
            const viewAll = document.createElement('div');
            viewAll.className = 'card m-2 d-flex align-items-center justify-content-center';
            viewAll.style.width = '500px';
            viewAll.style.height = '75px';
            viewAll.style.cursor = 'pointer';
            viewAll.innerHTML = `<h5 class="card-title">View All Posts</h5>`;
            viewAll.onclick = () => window.location.href = viewAllUrl;
            container.appendChild(viewAll);
        })
        .catch(err => console.error('Error loading blog YAML:', err));
}

function loadTalks() {
    const yamlPath = 'assets/data/talks.yml';
    const containerId = 'talks-cards';

    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(yamlPath)
        .then(res => res.text())
        .then(yamlText => {
            const talks = jsyaml.load(yamlText);

            talks.forEach(talk => {
                const card = document.createElement('div');
                card.className = 'card m-2';
                card.style.flex = '1 1 calc(60% - 1rem)';
                card.style.height = '400px';
                card.style.cursor = 'pointer';
                card.onclick = () => window.open(talk.url, '_blank');

                card.innerHTML = `
                    <div class="card-image-wrapper" style="height: 100%; width: 100%; overflow: hidden; background:rgb(0, 0, 0); display: flex; align-items: center; justify-content: center;">
                        <img class="card__image" src="${talk.image}" alt="${talk.title}" style="height: 100%; width: auto; object-fit: cover; display: block;" />
                    </div>
                    <div class="card__content" style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(255,255,255,0.9);">
                        <p class="card__title">${talk.title}</p>
                        <p class="card__description">${talk.conference}</p>
                        <p class="card__description"><strong>${talk.date}</strong></p>
                    </div>
                `;
                card.style.position = "relative";

                container.appendChild(card);
            });
        })
        .catch(err => console.error('Error loading talks YAML:', err));
}

//------------------------------------------------------------------------------------------------------------------------------------------------
// Main loader function that calls all the section-specific loaders
function loadAllSections() {
    loadExperience();
    loadEducation();
    loadPublications();
    loadPosts();
    loadTalks();

    // Re-run MathJax after all content is added
    // Use a small delay to ensure all content is rendered before MathJax processes it.
    setTimeout(() => {
        if (window.MathJax) {
            MathJax.typeset();
        }
    }, 250);
}

// Trigger the main loader function when the entire window is loaded
window.onload = loadAllSections;

// Automatically run after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    SvgInjector.processAll();
});