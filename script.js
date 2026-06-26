document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const uploadBtn = document.getElementById('uploadBtn');
    const successMessage = document.getElementById('successMessage');
    const fileLink = document.getElementById('fileLink');
    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('resetBtn');

    let selectedFile = null;

    // Event listeners untuk drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Fungsi untuk handle file
    function handleFile(file) {
        // Cek ukuran file (maks 500MB)
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            alert('Ukuran file terlalu besar! Maksimal 500MB.');
            return;
        }

        selectedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'flex';
        progressContainer.style.display = 'none';
        successMessage.style.display = 'none';
        document.querySelector('.drop-zone').style.display = 'block';
    }

    // Format ukuran file
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Byte';
        const k = 1024;
        const sizes = ['Byte', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Upload file
    uploadBtn.addEventListener('click', function() {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        const xhr = new XMLHttpRequest();
        
        // Track progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = Math.round(percentComplete) + '%';
                progressContainer.style.display = 'flex';
            }
        });

        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        // Tampilkan pesan sukses
                        progressContainer.style.display = 'none';
                        successMessage.style.display = 'block';
                        fileInfo.style.display = 'none';
                        document.querySelector('.drop-zone').style.display = 'none';
                        
                        // Tampilkan link file
                        const link = response.file_url || response.link;
                        fileLink.textContent = link;
                        fileLink.href = link;
                    } else {
                        alert('Upload gagal: ' + (response.message || 'Terjadi kesalahan'));
                    }
                } catch (e) {
                    alert('Terjadi kesalahan saat memproses response server.');
                }
            } else {
                alert('Upload gagal. Status: ' + xhr.status);
            }
        });

        xhr.addEventListener('error', function() {
            alert('Terjadi kesalahan jaringan. Silakan coba lagi.');
        });

        xhr.open('POST', 'upload.php', true);
        xhr.send(formData);
    });

    // Copy link
    copyBtn.addEventListener('click', function() {
        const link = fileLink.textContent;
        navigator.clipboard.writeText(link).then(() => {
            alert('Link berhasil disalin!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Link berhasil disalin!');
        });
    });

    // Reset
    resetBtn.addEventListener('click', function() {
        selectedFile = null;
        fileInput.value = '';
        fileInfo.style.display = 'none';
        progressContainer.style.display = 'none';
        successMessage.style.display = 'none';
        document.querySelector('.drop-zone').style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
    });
});