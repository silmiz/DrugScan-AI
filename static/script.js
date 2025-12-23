const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadContent = document.querySelector('.upload-content');

uploadArea.addEventListener('click', () => {
    fileInput.click();
});


fileInput.addEventListener('change', function () {
    const file = this.files[0];
    handleFile(file);
});


['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

uploadArea.addEventListener('dragover', () => {
    uploadArea.classList.add('active');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('active');
});

uploadArea.addEventListener('drop', (e) => {
    uploadArea.classList.remove('active');
    const file = e.dataTransfer.files[0];
    handleFile(file);
});


function handleFile(file) {
    if (file && file.type.startsWith('image/')) {

        uploadContent.innerHTML = `
            <div class="cloud-icon-bg" style="background-color: #10b981;">
                <i data-lucide="check" style="color: white;"></i>
            </div>
            <p><strong>${file.name}</strong></p>
            <span class="sub-text">Ready to analyze</span>
        `;
        lucide.createIcons();


        analyzeBtn.disabled = false;
        analyzeBtn.classList.add('ready');
    } else {
        alert('Please upload an image file (JPG/PNG)!');
    }
}


analyzeBtn.addEventListener('click', async () => {
    if (!fileInput.files[0]) return;

    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = 'Analyzing...';
    analyzeBtn.disabled = true;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        const resultContainer = document.getElementById('resultContainer');
        resultContainer.style.display = 'block';

        let detailsHTML = '';

        if (result.data.length === 0) {
            detailsHTML = `<p style="text-align:center; color:#94a3b8;">No medicine detected.</p>`;
        } else {
            result.data.forEach(item => {
                const icon = item.type === 'authentic' ? 'check-circle' : 'alert-triangle';

                detailsHTML += `
                <div class="result-item">
                    <span class="badge ${item.type}">
                        <i data-lucide="${icon}" style="width:16px;"></i>
                        ${item.label}
                    </span>
                    <span class="confidence">Confidence: <strong>${item.score}</strong></span>
                </div>
                `;
            });
        }

        resultContainer.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #1e293b;">Analysis Result</h3>
            
            <div class="result-card">
                <img src="${result.image}" class="result-image">
                <div class="result-details">
                    ${detailsHTML}
                </div>
            </div>

            <div class="info-section">
                
                <div class="info-grid">
                    <div class="info-box box-auth">
                        <h4><i data-lucide="check-circle" style="width:16px"></i> Visual Indicators: Authentic</h4>
                        <ul>
                            <li>Logo & brand match official database</li>
                            <li>Sharp packaging print (no blur)</li>
                            <li>Batch No. & Expiry Date clearly visible</li>
                            <li>Color & layout match official product</li>
                            <li>Packaging seal appears intact</li>
                        </ul>
                    </div>
                    <div class="info-box box-fake">
                        <h4><i data-lucide="x-circle" style="width:16px"></i> Visual Indicators: Counterfeit</h4>
                        <ul>
                            <li>Different logo/font from official version</li>
                            <li>Blurry print / inconsistent colors</li>
                            <li>Unreadable or invalid Batch Number</li>
                            <li>No Expiry Date found</li>
                            <li>Damaged packaging or non-standard seal</li>
                        </ul>
                    </div>
                </div>

                <div class="disclaimer-box">
                    <strong>⚠️ Disclaimer:</strong>
                    <p style="margin-bottom: 8px;">This result uses AI based on visual analysis and is <b>not a medical diagnosis.</b> <b>Below 90% confidence</b> and decisions regarding medication use, <b>must be consulted with professionals.</b></p>
                    <hr style="border: 0; border-top: 1px solid #fcd34d; margin: 8px 0;">
                    <strong>👨‍⚕️ Professional Advice:</strong>
                    <p>Immediately consult a doctor or pharmacist if you remain unsure about the AI detection results (recommended).</p>
                </div>

                <div class="action-grid">
                    <div class="action-item">
                        <h5>📢 Report Suspicious Items to:</h5>
                        <ul>
                            <li>The Pharmacy where purchased</li>
                            <li>BPOM (Food & Drug Authority)</li>
                        </ul>
                    </div>
                    <div class="action-item">
                        <h5>🏥 Buy Medicine Only From:</h5>
                        <ul>
                            <li>Official Pharmacies</li>
                            <li>Trusted Healthcare Facilities</li>
                        </ul>
                    </div>
                </div>

            </div>
        `;

        lucide.createIcons();
        resultContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        alert('Failed to process image.');
    } finally {
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
    }
});